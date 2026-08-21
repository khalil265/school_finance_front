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

  templateUrl:
    './dashboard.component.html',

  styleUrl:
    './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private readonly dashboardService =
    inject(DashboardService);

  private readonly appContext =
    inject(AppContextService);


  loading = false;

  errorMessage = '';

  summary: DashboardSummary | null = null;


  ngOnInit(): void {

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
    ).format(value)
      + ' XOF';
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
}