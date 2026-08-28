import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  PaymentService
} from '../../core/services/payment.service';

import {
  StudentService
} from '../../core/services/student.service';

import {
  AcademicYearService
} from '../../core/services/academic-year.service';

import {
  BillingService
} from '../../core/services/billing.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  Student
} from '../../shared/models/student.model';

import {
  AcademicYear
} from '../../shared/models/academic-year.model';

import {
  Payment,
  Receipt
} from '../../shared/models/payment.model';

import {
  StudentCharge,
  StudentFinancialSummary
} from '../../shared/models/billing.model';


@Component({
  selector: 'app-payments',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {

  private readonly paymentService =
    inject(PaymentService);

  private readonly studentService =
    inject(StudentService);

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly billingService =
    inject(BillingService);

  private readonly appContext =
    inject(AppContextService);

  private readonly fb =
    inject(FormBuilder);


  academicYears: AcademicYear[] = [];

  selectedAcademicYearId = '';


  searchQuery = '';

  searchResults: Student[] = [];

  selectedStudent: Student | null = null;


  payments: Payment[] = [];

  lastPayment: Payment | null = null;


  monthlySummary: StudentFinancialSummary | null = null;

  monthlyCharges: StudentCharge[] = [];


  formVisible = false;


  loadingYears = false;

  searching = false;

  loadingPayments = false;

  loadingMonthly = false;

  saving = false;

  downloadingReceiptId: string | null = null;


  errorMessage = '';

  formError = '';

  successMessage = '';


  readonly paymentForm =
    this.fb.nonNullable.group({

      amount: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      paymentMethod: [
        'CASH',
        [
          Validators.required
        ]
      ],

      transactionReference: [''],

      notes: ['']

    });


  ngOnInit(): void {

    this.loadAcademicYears();
  }


  loadAcademicYears(): void {

    this.loadingYears = true;


    this.academicYearService
      .findAll(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingYears = false;
        })
      )
      .subscribe({

        next: years => {

          this.academicYears = years;

          const current =
            years.find(y => y.currentYear);

          this.selectedAcademicYearId =
            current
              ? current.id
              : (years[0]?.id ?? '');
        },

        error: error => {

          console.error(
            'Erreur chargement annees academiques',
            error
          );

          this.errorMessage =
            'Impossible de charger les annees academiques.';
        }

      });
  }


  searchStudents(): void {

    if (!this.searchQuery.trim()) {

      this.searchResults = [];

      return;
    }


    this.searching = true;

    this.errorMessage = '';


    this.studentService
      .search(
        this.searchQuery.trim(),
        0,
        10
      )
      .pipe(
        finalize(() => {
          this.searching = false;
        })
      )
      .subscribe({

        next: page => {

          this.searchResults =
            page.content ?? [];
        },

        error: error => {

          console.error(
            'Erreur recherche eleve',
            error
          );

          this.errorMessage =
            'Impossible de rechercher les eleves.';
        }

      });
  }


  selectStudent(
    student: Student
  ): void {

    this.selectedStudent = student;

    this.searchResults = [];

    this.searchQuery = '';

    this.payments = [];

    this.lastPayment = null;

    this.monthlySummary = null;

    this.monthlyCharges = [];

    this.formVisible = false;

    this.successMessage = '';

    this.loadPayments();

    this.loadMonthlySummary();
  }


  loadPayments(): void {

    if (
      !this.selectedStudent ||
      !this.selectedAcademicYearId
    ) {
      return;
    }


    this.loadingPayments = true;

    this.errorMessage = '';


    this.paymentService
      .getStudentPayments(
        this.selectedStudent.id,
        this.selectedAcademicYearId
      )
      .pipe(
        finalize(() => {
          this.loadingPayments = false;
        })
      )
      .subscribe({

        next: payments => {

          this.payments = payments;
        },

        error: error => {

          console.error(
            'Erreur chargement paiements',
            error
          );

          this.errorMessage =
            'Impossible de charger les paiements.';
        }

      });
  }


  loadMonthlySummary(): void {

    if (
      !this.selectedStudent ||
      !this.selectedAcademicYearId
    ) {
      return;
    }


    this.loadingMonthly = true;


    this.billingService
      .getSummary(
        this.selectedStudent.id,
        this.selectedAcademicYearId
      )
      .pipe(
        finalize(() => {
          this.loadingMonthly = false;
        })
      )
      .subscribe({

        next: summary => {

          this.monthlySummary = summary;

          this.monthlyCharges =
            summary.charges
              .filter(c => c.installmentNumber != null)
              .sort(
                (a, b) =>
                  (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0)
              );
        },

        error: () => {

          this.monthlySummary = null;

          this.monthlyCharges = [];
        }

      });
  }


  get monthsTotal(): number {

    return this.monthlyCharges.length;
  }


  get monthsPaid(): number {

    return this.monthlyCharges.filter(
      c => c.status === 'PAID'
    ).length;
  }


  get monthsRemaining(): number {

    return this.monthsTotal - this.monthsPaid;
  }


  onAcademicYearChange(): void {

    this.lastPayment = null;

    if (this.selectedStudent) {

      this.loadPayments();

      this.loadMonthlySummary();
    }
  }


  openPaymentForm(): void {

    this.formError = '';

    this.successMessage = '';

    this.lastPayment = null;

    this.paymentForm.reset({

      amount: 0,

      paymentMethod: 'CASH',

      transactionReference: '',

      notes: ''

    });

    this.formVisible = true;
  }


  closeForm(): void {

    if (this.saving) {
      return;
    }

    this.formVisible = false;

    this.formError = '';
  }


  submitPayment(): void {

    this.formError = '';


    if (
      !this.selectedStudent ||
      !this.selectedAcademicYearId
    ) {

      this.formError =
        "Selectionnez un eleve et une annee academique.";

      return;
    }


    if (this.paymentForm.invalid) {

      this.paymentForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.paymentForm.getRawValue();


    const request = {

      studentId:
        this.selectedStudent.id,

      academicYearId:
        this.selectedAcademicYearId,

      amount:
        value.amount,

      paymentMethod:
        value.paymentMethod,

      transactionReference:
        this.nullIfEmpty(
          value.transactionReference
        ),

      notes:
        this.nullIfEmpty(
          value.notes
        )

    };


    this.paymentService
      .create(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: payment => {

          this.lastPayment = payment;

          this.successMessage =
            `Paiement ${payment.paymentNumber} enregistre avec succes.`;

          this.formVisible = false;

          this.loadPayments();

          this.loadMonthlySummary();
        },

        error: (error: HttpErrorResponse) => {

          this.handleSaveError(error);
        }

      });
  }


  downloadReceipt(
    receipt: Receipt | null
  ): void {

    if (!receipt || receipt.cancelled) {
      return;
    }


    this.downloadingReceiptId = receipt.id;


    this.paymentService
      .downloadReceiptPdf(
        receipt.id
      )
      .pipe(
        finalize(() => {
          this.downloadingReceiptId = null;
        })
      )
      .subscribe({

        next: blob => {

          const url =
            window.URL.createObjectURL(blob);

          const link =
            document.createElement('a');

          link.href = url;

          link.download =
            `recu-${receipt.receiptNumber}.pdf`;

          link.click();

          window.URL.revokeObjectURL(url);
        },

        error: error => {

          console.error(
            'Erreur telechargement recu',
            error
          );

          this.errorMessage =
            'Impossible de telecharger le recu.';
        }

      });
  }


  private handleSaveError(
    error: HttpErrorResponse
  ): void {

    console.error(
      'Erreur enregistrement paiement',
      error
    );


    if (error.status === 403) {

      this.formError =
        'Vous ne disposez pas des droits necessaires.';

      return;
    }


    if (error.status === 400) {

      this.formError =
        error.error?.message
        ?? 'Les informations saisies sont invalides.';

      return;
    }


    if (error.status === 404) {

      this.formError =
        error.error?.message
        ?? "Aucun compte financier pour cet eleve. Generez d'abord son echeancier dans le module Facturation.";

      return;
    }


    this.formError =
      error.error?.message
      ?? "Impossible d'enregistrer le paiement.";
  }


  private nullIfEmpty(
    value: string | null | undefined
  ): string | null {

    if (
      value == null ||
      value.trim() === ''
    ) {

      return null;
    }

    return value.trim();
  }


  methodLabel(
    method: string
  ): string {

    switch (method) {

      case 'CASH':
        return 'Especes';

      case 'CHECK':
        return 'Cheque';

      case 'BANK_TRANSFER':
        return 'Virement bancaire';

      case 'MOBILE_MONEY':
        return 'Mobile Money';

      default:
        return method || '-';
    }
  }


  statusLabel(
    status: string
  ): string {

    switch (status) {

      case 'PENDING':
        return 'En attente';

      case 'COMPLETED':
        return 'Complete';

      case 'CANCELLED':
        return 'Annule';

      case 'PAID':
        return 'Paye';

      case 'PARTIALLY_PAID':
        return 'Partiel';

      case 'OVERDUE':
        return 'En retard';

      default:
        return status || '-';
    }
  }
}