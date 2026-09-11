import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  forkJoin,
  of
} from 'rxjs';

import {
  catchError,
  finalize
} from 'rxjs/operators';

import {
  DashboardService
} from '../../core/services/dashboard.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

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
  DashboardRecentTransaction,
  DashboardSummary
} from '../../shared/models/dashboard.model';

import {
  Student
} from '../../shared/models/student.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './dashboard.component.html',

  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private readonly dashboardService =
    inject(DashboardService);

  private readonly appContext =
    inject(AppContextService);

  private readonly studentService =
    inject(StudentService);

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly billingService =
    inject(BillingService);

  loading = false;

  errorMessage = '';

  summary: DashboardSummary | null = null;

  currentTheme: 'light' | 'dark' | 'blue' = 'light';


  loadingMonthly = false;

  monthlyPaidCount = 0;

  monthlyUnpaidCount = 0;

  paidStudentsList: Student[] = [];

  unpaidStudentsList: Student[] = [];

  showMonthlyDetail = false;


  ngOnInit(): void {
    this.loadTheme();
    this.loadDashboard();
    this.loadMonthlyPaymentStatus();
  }

  loadDashboard(): void {

    this.loading = true;

    this.errorMessage = '';

    const establishmentId =
      this.appContext.establishmentId();

    this.dashboardService
      .getSummary(establishmentId)
      .subscribe({

        next: response => {

          this.summary = response;

          this.loading = false;
        },

        error: error => {

          console.error(
            'Erreur chargement dashboard',
            error
          );

          this.errorMessage =
            'Impossible de charger les données du tableau de bord.';

          this.loading = false;
        }

      });
  }


  loadMonthlyPaymentStatus(): void {

    this.loadingMonthly = true;

    const establishmentId =
      this.appContext.establishmentId();


    this.academicYearService
      .findAll(establishmentId)
      .subscribe({

        next: years => {

          const currentYear =
            years.find(y => y.currentYear) ?? years[0];

          if (!currentYear) {

            this.loadingMonthly = false;

            return;
          }


          this.studentService
            .findAll(0, 1000)
            .subscribe({

              next: page => {

                const eligible =
                  (page.content ?? []).filter(
                    s => s.currentAcademicYearId === currentYear.id
                  );


                if (eligible.length === 0) {

                  this.monthlyPaidCount = 0;

                  this.monthlyUnpaidCount = 0;

                  this.paidStudentsList = [];

                  this.unpaidStudentsList = [];

                  this.loadingMonthly = false;

                  return;
                }


                const now = new Date();

                const currentMonth = now.getMonth();

                const currentYearNum = now.getFullYear();


                const calls =
                  eligible.map(student =>
                    this.billingService
                      .getSummary(student.id, currentYear.id)
                      .pipe(
                        catchError(() => of(null))
                      )
                  );


                forkJoin(calls)
                  .pipe(
                    finalize(() => {
                      this.loadingMonthly = false;
                    })
                  )
                  .subscribe(results => {

                    const paid: Student[] = [];

                    const unpaid: Student[] = [];


                    eligible.forEach((student, index) => {

                      const summary =
                        results[index];

                      const monthlyCharge =
                        summary?.charges.find(c => {

                          const due =
                            new Date(c.dueDate);

                          return (
                            due.getMonth() === currentMonth &&
                            due.getFullYear() === currentYearNum
                          );
                        });


                      if (
                        monthlyCharge &&
                        monthlyCharge.status === 'PAID'
                      ) {

                        paid.push(student);

                      }
                      else {

                        unpaid.push(student);
                      }

                    });


                    this.paidStudentsList = paid;

                    this.unpaidStudentsList = unpaid;

                    this.monthlyPaidCount = paid.length;

                    this.monthlyUnpaidCount = unpaid.length;
                  });
              },

              error: () => {

                this.loadingMonthly = false;
              }

            });
        },

        error: () => {

          this.loadingMonthly = false;
        }

      });
  }


  toggleMonthlyDetail(): void {

    this.showMonthlyDetail =
      !this.showMonthlyDetail;
  }


  closeMonthlyDetail(): void {

    this.showMonthlyDetail = false;
  }


  formatAmount(
    amount: number | null | undefined
  ): string {

    const value =
      Number(amount ?? 0);

    return new Intl.NumberFormat(
      'fr-FR',
      {
        maximumFractionDigits: 0
      }
    ).format(value) + ' XOF';
  }

  transactionClass(
    transaction: DashboardRecentTransaction
  ): string {

    return transaction.type === 'INCOME'
      ? 'income'
      : 'expense';
  }

  transactionSign(
    transaction: DashboardRecentTransaction
  ): string {

    return transaction.type === 'INCOME'
      ? '+'
      : '-';
  }

  get incomePercentage(): number {

    if (!this.summary) {
      return 0;
    }

    const total =
      Number(this.summary.totalIncome) +
      Number(this.summary.totalExpenses);

    if (total <= 0) {
      return 0;
    }

    return Math.round(
      (Number(this.summary.totalIncome) / total) * 100
    );
  }

  get expensePercentage(): number {

    if (!this.summary) {
      return 0;
    }

    const total =
      Number(this.summary.totalIncome) +
      Number(this.summary.totalExpenses);

    if (total <= 0) {
      return 0;
    }

    return Math.round(
      (Number(this.summary.totalExpenses) / total) * 100
    );
  }

  get budgetConsumedPercentage(): number {

    if (!this.summary) {
      return 0;
    }

    const budget =
      Number(this.summary.budgetAmount);

    if (budget <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (Number(this.summary.budgetConsumed) / budget) * 100
      )
    );
  }

  get budgetCommittedPercentage(): number {

    if (!this.summary) {
      return 0;
    }

    const budget =
      Number(this.summary.budgetAmount);

    if (budget <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (Number(this.summary.budgetCommitted) / budget) * 100
      )
    );
  }

  get budgetAvailablePercentage(): number {

    if (!this.summary) {
      return 0;
    }

    const budget =
      Number(this.summary.budgetAmount);

    if (budget <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (Number(this.summary.budgetAvailable) / budget) * 100
      )
    );
  }

  setTheme(
    theme: 'light' | 'dark' | 'blue'
  ): void {

    this.currentTheme = theme;

    localStorage.setItem(
      'school-finance-theme',
      theme
    );

    document.body.setAttribute(
      'data-theme',
      theme
    );
  }

  loadTheme(): void {

    const savedTheme =
      localStorage.getItem(
        'school-finance-theme'
      );

    if (
      savedTheme === 'dark' ||
      savedTheme === 'blue'
    ) {

      this.currentTheme =
        savedTheme;
    }

    document.body.setAttribute(
      'data-theme',
      this.currentTheme
    );
  }

  toggleSidebar(): void {

    document.body.classList.toggle(
      'sidebar-collapsed'
    );
  }
}