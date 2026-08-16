import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

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
  BillingService
} from '../../core/services/billing.service';

import {
  StudentService
} from '../../core/services/student.service';

import {
  AcademicYearService
} from '../../core/services/academic-year.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  Enrollment,
  Student
} from '../../shared/models/student.model';

import {
  AcademicYear
} from '../../shared/models/academic-year.model';

import {
  StudentFinancialSummary
} from '../../shared/models/billing.model';


@Component({
  selector: 'app-billing',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {

  private readonly billingService =
    inject(BillingService);

  private readonly studentService =
    inject(StudentService);

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly appContext =
    inject(AppContextService);


  academicYears: AcademicYear[] = [];

  selectedAcademicYearId = '';


  searchQuery = '';

  searchResults: Student[] = [];

  selectedStudent: Student | null = null;


  summary: StudentFinancialSummary | null = null;


  enrollments: Enrollment[] = [];

  currentEnrollment: Enrollment | null = null;

  loadingEnrollments = false;


  loadingYears = false;

  searching = false;

  loadingSummary = false;

  refreshing = false;

  generating = false;


  errorMessage = '';

  generateError = '';

  generateSuccess = '';


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

    this.summary = null;

    this.enrollments = [];

    this.currentEnrollment = null;

    this.generateError = '';

    this.generateSuccess = '';

    this.loadEnrollments();

    this.loadSummary();
  }


  loadEnrollments(): void {

    if (!this.selectedStudent) {
      return;
    }


    this.loadingEnrollments = true;


    this.studentService
      .getEnrollments(
        this.selectedStudent.id
      )
      .pipe(
        finalize(() => {
          this.loadingEnrollments = false;
        })
      )
      .subscribe({

        next: enrollments => {

          this.enrollments = enrollments;

          this.updateCurrentEnrollment();
        },

        error: error => {

          console.error(
            'Erreur chargement inscriptions',
            error
          );

          this.enrollments = [];

          this.currentEnrollment = null;
        }

      });
  }


  private updateCurrentEnrollment(): void {

    if (!this.selectedAcademicYearId) {

      this.currentEnrollment = null;

      return;
    }


    this.currentEnrollment =
      this.enrollments.find(
        e =>
          e.academicYearId === this.selectedAcademicYearId &&
          e.status === 'ACTIVE'
      )
      ?? null;
  }


  loadSummary(): void {

    if (
      !this.selectedStudent ||
      !this.selectedAcademicYearId
    ) {
      return;
    }


    this.loadingSummary = true;

    this.errorMessage = '';


    this.billingService
      .getSummary(
        this.selectedStudent.id,
        this.selectedAcademicYearId
      )
      .pipe(
        finalize(() => {
          this.loadingSummary = false;
        })
      )
      .subscribe({

        next: summary => {

          this.summary = summary;
        },

        error: (error: HttpErrorResponse) => {

          this.summary = null;


          if (error.status === 404) {

            this.errorMessage =
              'Aucun compte financier pour cet eleve sur cette annee. Generez son echeancier ci-dessous.';

            return;
          }


          console.error(
            'Erreur chargement resume financier',
            error
          );

          this.errorMessage =
            'Impossible de charger le resume financier.';
        }

      });
  }


  onAcademicYearChange(): void {

    this.summary = null;

    this.updateCurrentEnrollment();


    if (this.selectedStudent) {

      this.loadSummary();
    }
  }


  refreshSummary(): void {

    if (
      !this.selectedStudent ||
      !this.selectedAcademicYearId
    ) {
      return;
    }


    this.refreshing = true;

    this.errorMessage = '';


    this.billingService
      .refreshSummary(
        this.selectedStudent.id,
        this.selectedAcademicYearId
      )
      .pipe(
        finalize(() => {
          this.refreshing = false;
        })
      )
      .subscribe({

        next: summary => {

          this.summary = summary;
        },

        error: error => {

          console.error(
            'Erreur rafraichissement resume',
            error
          );

          this.errorMessage =
            'Impossible de rafraichir le resume financier.';
        }

      });
  }


  generateSchedule(): void {

    if (!this.currentEnrollment) {

      this.generateError =
        "Aucune inscription active trouvee pour cette annee academique.";

      return;
    }


    this.generating = true;

    this.generateError = '';

    this.generateSuccess = '';


    this.billingService
      .generateSchedule({
        enrollmentId:
          this.currentEnrollment.id
      })
      .pipe(
        finalize(() => {
          this.generating = false;
        })
      )
      .subscribe({

        next: response => {

          this.generateSuccess =
            `Echeancier genere : ${response.createdCharges} charge(s) creee(s), ${response.skippedCharges} ignoree(s).`;

          this.loadSummary();
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Erreur generation echeancier',
            error
          );

          this.generateError =
            error.error?.message
            ?? "Impossible de generer l'echeancier.";
        }

      });
  }


  statusLabel(
    status: string
  ): string {

    switch (status) {

      case 'UP_TO_DATE':
        return 'A jour';

      case 'PARTIAL':
        return 'Partiel';

      case 'OVERDUE':
        return 'En retard';

      case 'SETTLED':
        return 'Solde';

      case 'SUSPENDED':
        return 'Suspendu';

      case 'PENDING':
        return 'En attente';

      case 'PARTIALLY_PAID':
        return 'Paiement partiel';

      case 'PAID':
        return 'Paye';

      case 'CANCELLED':
        return 'Annule';

      default:
        return status || '-';
    }
  }
}