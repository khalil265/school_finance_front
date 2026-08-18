import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  finalize
} from 'rxjs';

import {
  TreasuryService
} from '../../core/services/treasury.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  TreasuryTransaction
} from '../../shared/models/treasury.model';


@Component({
  selector: 'app-treasury',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './treasury.component.html',
  styleUrl: './treasury.component.css'
})
export class TreasuryComponent implements OnInit {

  private readonly treasuryService =
    inject(TreasuryService);

  private readonly appContext =
    inject(AppContextService);


  transactions: TreasuryTransaction[] = [];

  balance: number | null = null;


  loading = false;

  loadingBalance = false;


  errorMessage = '';


  ngOnInit(): void {

    this.loadTransactions();

    this.loadBalance();
  }


  loadTransactions(): void {

    this.loading = true;

    this.errorMessage = '';


    this.treasuryService
      .transactions(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({

        next: transactions => {

          this.transactions = transactions;
        },

        error: error => {

          console.error(
            'Erreur chargement transactions tresorerie',
            error
          );

          this.errorMessage =
            'Impossible de charger les transactions de tresorerie.';
        }

      });
  }


  loadBalance(): void {

    this.loadingBalance = true;


    this.treasuryService
      .balance(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingBalance = false;
        })
      )
      .subscribe({

        next: balance => {

          this.balance = balance;
        },

        error: error => {

          console.error(
            'Erreur chargement solde tresorerie',
            error
          );
        }

      });
  }


  typeLabel(
    type: string
  ): string {

    return type === 'INCOME'
      ? 'Entree'
      : 'Sortie';
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
}