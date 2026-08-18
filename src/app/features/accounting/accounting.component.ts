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
  AccountingService
} from '../../core/services/accounting.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  AuthService
} from '../../core/auth/auth.service';

import {
  AccountingAccount,
  GeneralJournalLine,
  Ledger,
  TrialBalance
} from '../../shared/models/accounting.model';


@Component({
  selector: 'app-accounting',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './accounting.component.html',
  styleUrl: './accounting.component.css'
})
export class AccountingComponent implements OnInit {

  private readonly accountingService =
    inject(AccountingService);

  private readonly appContext =
    inject(AppContextService);

  private readonly authService =
    inject(AuthService);

  private readonly fb =
    inject(FormBuilder);


  activeTab: 'accounts' | 'journal' | 'ledger' | 'balance' = 'accounts';


  accounts: AccountingAccount[] = [];

  journalLines: GeneralJournalLine[] = [];

  ledger: Ledger | null = null;

  trialBalance: TrialBalance | null = null;


  accountFormVisible = false;


  filterFrom = '';

  filterTo = '';

  ledgerAccountCode = '';


  loadingAccounts = false;

  loadingJournal = false;

  loadingLedger = false;

  loadingBalance = false;

  saving = false;


  errorMessage = '';

  formError = '';

  successMessage = '';


  readonly accountForm =
    this.fb.nonNullable.group({

      code: [
        '',
        [
          Validators.required
        ]
      ],

      name: [
        '',
        [
          Validators.required
        ]
      ],

      accountType: [
        'ASSET',
        [
          Validators.required
        ]
      ],

      description: [''],

      postingAllowed: [true]

    });


  get canManage(): boolean {

    return this.authService
      .hasPermission('ACCOUNTING_ENTRY_CREATE');
  }


  ngOnInit(): void {

    this.loadAccounts();
  }


  switchTab(
    tab: 'accounts' | 'journal' | 'ledger' | 'balance'
  ): void {

    this.activeTab = tab;

    this.errorMessage = '';


    if (tab === 'journal' && this.journalLines.length === 0) {

      this.loadJournal();
    }

    if (tab === 'balance' && !this.trialBalance) {

      this.loadTrialBalance();
    }
  }


  loadAccounts(): void {

    this.loadingAccounts = true;

    this.errorMessage = '';


    this.accountingService
      .listAccounts(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingAccounts = false;
        })
      )
      .subscribe({

        next: accounts => {

          this.accounts = accounts;
        },

        error: error => {

          console.error(
            'Erreur chargement plan comptable',
            error
          );

          this.errorMessage =
            'Impossible de charger le plan comptable.';
        }

      });
  }


  openAccountForm(): void {

    this.formError = '';

    this.successMessage = '';

    this.accountForm.reset({

      code: '',

      name: '',

      accountType: 'ASSET',

      description: '',

      postingAllowed: true

    });

    this.accountFormVisible = true;
  }


  closeAccountForm(): void {

    if (this.saving) {
      return;
    }

    this.accountFormVisible = false;

    this.formError = '';
  }


  submitAccountForm(): void {

    this.formError = '';


    if (this.accountForm.invalid) {

      this.accountForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.accountForm.getRawValue();


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      code:
        value.code.trim(),

      name:
        value.name.trim(),

      accountType:
        value.accountType,

      parentId: null,

      description:
        this.nullIfEmpty(
          value.description
        ),

      postingAllowed:
        value.postingAllowed

    };


    this.accountingService
      .createAccount(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: account => {

          this.successMessage =
            `Compte "${account.code} - ${account.name}" cree avec succes.`;

          this.accountFormVisible = false;

          this.loadAccounts();
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  toggleAccountActive(
    account: AccountingAccount
  ): void {

    if (!account.active) {
      return;
    }


    this.accountingService
      .deactivateAccount(
        account.id
      )
      .subscribe({

        next: () => {

          this.loadAccounts();
        },

        error: error => {

          console.error(
            'Erreur desactivation compte',
            error
          );

          this.errorMessage =
            "Impossible de desactiver ce compte.";
        }

      });
  }


  loadJournal(): void {

    this.loadingJournal = true;

    this.errorMessage = '';


    this.accountingService
      .journal(
        this.appContext.establishmentId(),
        this.nullIfEmpty(this.filterFrom),
        this.nullIfEmpty(this.filterTo)
      )
      .pipe(
        finalize(() => {
          this.loadingJournal = false;
        })
      )
      .subscribe({

        next: lines => {

          this.journalLines = lines;
        },

        error: error => {

          console.error(
            'Erreur chargement journal',
            error
          );

          this.errorMessage =
            'Impossible de charger le journal general.';
        }

      });
  }


  loadLedger(): void {

    if (!this.ledgerAccountCode.trim()) {

      this.errorMessage =
        'Saisissez un code de compte.';

      return;
    }


    this.loadingLedger = true;

    this.errorMessage = '';


    this.accountingService
      .ledger(
        this.appContext.establishmentId(),
        this.ledgerAccountCode.trim(),
        this.nullIfEmpty(this.filterFrom),
        this.nullIfEmpty(this.filterTo)
      )
      .pipe(
        finalize(() => {
          this.loadingLedger = false;
        })
      )
      .subscribe({

        next: ledger => {

          this.ledger = ledger;
        },

        error: (error: HttpErrorResponse) => {

          this.ledger = null;

          console.error(
            'Erreur chargement grand livre',
            error
          );

          this.errorMessage =
            error.error?.message
            ?? 'Impossible de charger le grand livre pour ce compte.';
        }

      });
  }


  loadTrialBalance(): void {

    this.loadingBalance = true;

    this.errorMessage = '';


    this.accountingService
      .trialBalance(
        this.appContext.establishmentId(),
        this.nullIfEmpty(this.filterFrom),
        this.nullIfEmpty(this.filterTo)
      )
      .pipe(
        finalize(() => {
          this.loadingBalance = false;
        })
      )
      .subscribe({

        next: balance => {

          this.trialBalance = balance;
        },

        error: error => {

          console.error(
            'Erreur chargement balance',
            error
          );

          this.errorMessage =
            'Impossible de charger la balance generale.';
        }

      });
  }


  private handleFormError(
    error: HttpErrorResponse
  ): void {

    console.error(
      'Erreur enregistrement compte',
      error
    );


    if (error.status === 403) {

      this.formError =
        'Vous ne disposez pas des droits necessaires.';

      return;
    }


    if (error.status === 400 || error.status === 409) {

      this.formError =
        error.error?.message
        ?? 'Les informations saisies sont invalides.';

      return;
    }


    this.formError =
      "Impossible d'enregistrer.";
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


  accountTypeLabel(
    type: string
  ): string {

    switch (type) {

      case 'ASSET':
        return 'Actif';

      case 'LIABILITY':
        return 'Passif';

      case 'EQUITY':
        return 'Capitaux propres';

      case 'REVENUE':
        return 'Produit';

      case 'EXPENSE':
        return 'Charge';

      default:
        return type || '-';
    }
  }


  directionLabel(
    direction: string
  ): string {

    return direction === 'DEBIT'
      ? 'Debit'
      : 'Credit';
  }
}