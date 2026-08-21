import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  DashboardService
} from '../../core/services/dashboard.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  DashboardRecentTransaction,
  DashboardSummary
} from '../../shared/models/dashboard.model';

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

  loading = false;

  errorMessage = '';

  summary: DashboardSummary | null = null;

  currentTheme: 'light' | 'dark' | 'blue' = 'light';

  ngOnInit(): void {
    this.loadTheme();
    this.loadDashboard();
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
