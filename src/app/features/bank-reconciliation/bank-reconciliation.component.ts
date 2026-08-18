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
  BankService
} from '../../core/services/bank.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  AuthService
} from '../../core/auth/auth.service';

import {
  BankStatement,
  BankStatementLine,
  ReconciliationCandidate
} from '../../shared/models/bank.model';


@Component({
  selector: 'app-bank-reconciliation',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './bank-reconciliation.component.html',
  styleUrl: './bank-reconciliation.component.css'
})
export class BankReconciliationComponent implements OnInit {

  private readonly bankService =
    inject(BankService);

  private readonly appContext =
    inject(AppContextService);

  private readonly authService =
    inject(AuthService);

  private readonly fb =
    inject(FormBuilder);


  statements: BankStatement[] = [];

  selectedStatement: BankStatement | null = null;

  lines: BankStatementLine[] = [];


  selectedLine: BankStatementLine | null = null;

  candidates: ReconciliationCandidate[] = [];


  statementFormVisible = false;

  lineFormVisible = false;


  loadingStatements = false;

  loadingLines = false;

  loadingCandidates = false;

  saving = false;


  errorMessage = '';

  formError = '';

  successMessage = '';


  readonly statementForm =
    this.fb.nonNullable.group({

      statementReference: [
        '',
        [
          Validators.required
        ]
      ],

      bankName: [
        '',
        [
          Validators.required
        ]
      ],

      bankAccountNumber: [''],

      accountCode: [
        '',
        [
          Validators.required
        ]
      ],

      startDate: [
        '',
        [
          Validators.required
        ]
      ],

      endDate: [
        '',
        [
          Validators.required
        ]
      ],

      openingBalance: [
        0,
        [
          Validators.required
        ]
      ],

      closingBalance: [
        0,
        [
          Validators.required
        ]
      ]

    });


  readonly lineForm =
    this.fb.nonNullable.group({

      transactionDate: [
        '',
        [
          Validators.required
        ]
      ],

      bankReference: [''],

      description: [
        '',
        [
          Validators.required
        ]
      ],

      direction: [
        'CREDIT',
        [
          Validators.required
        ]
      ],

      amount: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]

    });


  get canManage(): boolean {

    return this.authService
      .hasPermission('BANK_RECONCILE');
  }


  ngOnInit(): void {

    this.loadStatements();
  }


  loadStatements(): void {

    this.loadingStatements = true;

    this.errorMessage = '';


    this.bankService
      .listStatements(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingStatements = false;
        })
      )
      .subscribe({

        next: statements => {

          this.statements = statements;
        },

        error: error => {

          console.error(
            'Erreur chargement releves bancaires',
            error
          );

          this.errorMessage =
            'Impossible de charger les releves bancaires.';
        }

      });
  }


  openStatementForm(): void {

    this.formError = '';

    this.successMessage = '';

    this.statementForm.reset({

      statementReference: '',

      bankName: '',

      bankAccountNumber: '',

      accountCode: '',

      startDate: '',

      endDate: '',

      openingBalance: 0,

      closingBalance: 0

    });

    this.statementFormVisible = true;
  }


  closeStatementForm(): void {

    if (this.saving) {
      return;
    }

    this.statementFormVisible = false;

    this.formError = '';
  }


  submitStatementForm(): void {

    this.formError = '';


    if (this.statementForm.invalid) {

      this.statementForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.statementForm.getRawValue();


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      statementReference:
        value.statementReference.trim(),

      bankName:
        value.bankName.trim(),

      bankAccountNumber:
        this.nullIfEmpty(
          value.bankAccountNumber
        ),

      accountCode:
        value.accountCode.trim(),

      startDate:
        value.startDate,

      endDate:
        value.endDate,

      openingBalance:
        value.openingBalance,

      closingBalance:
        value.closingBalance

    };


    this.bankService
      .createStatement(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: statement => {

          this.successMessage =
            `Releve "${statement.statementReference}" cree avec succes.`;

          this.statementFormVisible = false;

          this.loadStatements();
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  selectStatement(
    statement: BankStatement
  ): void {

    this.selectedStatement = statement;

    this.selectedLine = null;

    this.candidates = [];

    this.formError = '';

    this.successMessage = '';

    this.loadLines();
  }


  closeDetails(): void {

    this.selectedStatement = null;

    this.lines = [];

    this.selectedLine = null;

    this.candidates = [];
  }


  loadLines(): void {

    if (!this.selectedStatement) {
      return;
    }


    this.loadingLines = true;


    this.bankService
      .getLines(
        this.selectedStatement.id
      )
      .pipe(
        finalize(() => {
          this.loadingLines = false;
        })
      )
      .subscribe({

        next: lines => {

          this.lines = lines;
        },

        error: error => {

          console.error(
            'Erreur chargement lignes releve',
            error
          );
        }

      });
  }


  openLineForm(): void {

    this.formError = '';

    this.lineForm.reset({

      transactionDate: '',

      bankReference: '',

      description: '',

      direction: 'CREDIT',

      amount: 0

    });

    this.lineFormVisible = true;
  }


  closeLineForm(): void {

    if (this.saving) {
      return;
    }

    this.lineFormVisible = false;

    this.formError = '';
  }


  submitLineForm(): void {

    if (!this.selectedStatement) {
      return;
    }


    this.formError = '';


    if (this.lineForm.invalid) {

      this.lineForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.lineForm.getRawValue();


    const request = {

      transactionDate:
        value.transactionDate,

      bankReference:
        this.nullIfEmpty(
          value.bankReference
        ),

      description:
        value.description.trim(),

      direction:
        value.direction,

      amount:
        value.amount

    };


    this.bankService
      .addLine(
        this.selectedStatement.id,
        request
      )
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: () => {

          this.lineFormVisible = false;

          this.loadLines();
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  selectLine(
    line: BankStatementLine
  ): void {

    if (line.status !== 'UNMATCHED') {
      return;
    }


    this.selectedLine = line;

    this.candidates = [];

    this.loadingCandidates = true;

    this.errorMessage = '';


    this.bankService
      .candidates(
        line.id
      )
      .pipe(
        finalize(() => {
          this.loadingCandidates = false;
        })
      )
      .subscribe({

        next: candidates => {

          this.candidates = candidates;
        },

        error: error => {

          console.error(
            'Erreur chargement candidats',
            error
          );

          this.errorMessage =
            'Impossible de charger les candidats de rapprochement.';
        }

      });
  }


  closeCandidates(): void {

    this.selectedLine = null;

    this.candidates = [];
  }


  reconcileWith(
    candidate: ReconciliationCandidate
  ): void {

    if (!this.selectedLine) {
      return;
    }


    this.bankService
      .reconcile(
        this.selectedLine.id,
        candidate.accountingEntryLineId
      )
      .subscribe({

        next: () => {

          this.selectedLine = null;

          this.candidates = [];

          this.loadLines();
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Erreur rapprochement',
            error
          );

          this.errorMessage =
            error.error?.message
            ?? 'Impossible de rapprocher cette ligne.';
        }

      });
  }


  closeStatement(): void {

    if (!this.selectedStatement) {
      return;
    }


    this.bankService
      .closeStatement(
        this.selectedStatement.id
      )
      .subscribe({

        next: statement => {

          this.selectedStatement = statement;

          this.statements =
            this.statements.map(s =>
              s.id === statement.id
                ? statement
                : s
            );
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Erreur cloture releve',
            error
          );

          this.errorMessage =
            error.error?.message
            ?? 'Impossible de cloturer ce releve.';
        }

      });
  }


  private handleFormError(
    error: HttpErrorResponse
  ): void {

    console.error(
      'Erreur enregistrement',
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


  statusLabel(
    status: string
  ): string {

    switch (status) {

      case 'OPEN':
        return 'Ouvert';

      case 'CLOSED':
        return 'Cloture';

      case 'UNMATCHED':
        return 'Non rapproche';

      case 'MATCHED':
        return 'Rapproche';

      case 'DISCREPANCY':
        return 'Ecart';

      case 'IGNORED':
        return 'Ignore';

      default:
        return status || '-';
    }
  }


  directionLabel(
    direction: string
  ): string {

    return direction === 'CREDIT'
      ? 'Entree'
      : 'Sortie';
  }
}