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
  BudgetService
} from '../../core/services/budget.service';

import {
  AcademicYearService
} from '../../core/services/academic-year.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  AuthService
} from '../../core/auth/auth.service';

import {
  AcademicYear
} from '../../shared/models/academic-year.model';

import {
  Budget,
  BudgetLine
} from '../../shared/models/budget.model';


@Component({
  selector: 'app-budget',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit {

  private readonly budgetService =
    inject(BudgetService);

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly appContext =
    inject(AppContextService);

  private readonly authService =
    inject(AuthService);

  private readonly fb =
    inject(FormBuilder);


  budgets: Budget[] = [];

  academicYears: AcademicYear[] = [];

  selectedBudget: Budget | null = null;

  budgetLines: BudgetLine[] = [];


  budgetFormVisible = false;

  lineFormVisible = false;


  loading = false;

  loadingYears = false;

  loadingLines = false;

  saving = false;

  activating = false;


  errorMessage = '';

  formError = '';

  successMessage = '';


  readonly budgetForm =
    this.fb.nonNullable.group({

      academicYearId: [
        '',
        [
          Validators.required
        ]
      ],

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

      description: ['']

    });


  readonly lineForm =
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

      description: [''],

      allocatedAmount: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]

    });


  get canCreate(): boolean {

    return this.authService
      .hasPermission('BUDGET_CREATE');
  }


  get canApprove(): boolean {

    return this.authService
      .hasPermission('BUDGET_APPROVE');
  }


  ngOnInit(): void {

    this.loadBudgets();

    this.loadAcademicYears();
  }


  loadBudgets(): void {

    this.loading = true;

    this.errorMessage = '';


    this.budgetService
      .list(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({

        next: budgets => {

          this.budgets = budgets;
        },

        error: error => {

          console.error(
            'Erreur chargement budgets',
            error
          );

          this.errorMessage =
            'Impossible de charger les budgets.';
        }

      });
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
        },

        error: error => {

          console.error(
            'Erreur chargement annees academiques',
            error
          );
        }

      });
  }


  openBudgetForm(): void {

    this.formError = '';

    this.successMessage = '';


    const current =
      this.academicYears.find(y => y.currentYear);


    this.budgetForm.reset({

      academicYearId:
        current
          ? current.id
          : (this.academicYears[0]?.id ?? ''),

      code: '',

      name: '',

      description: ''

    });

    this.budgetFormVisible = true;
  }


  closeBudgetForm(): void {

    if (this.saving) {
      return;
    }

    this.budgetFormVisible = false;

    this.formError = '';
  }


  submitBudgetForm(): void {

    this.formError = '';


    if (this.budgetForm.invalid) {

      this.budgetForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.budgetForm.getRawValue();


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      academicYearId:
        value.academicYearId,

      code:
        value.code.trim(),

      name:
        value.name.trim(),

      description:
        this.nullIfEmpty(
          value.description
        )

    };


    this.budgetService
      .create(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: budget => {

          this.successMessage =
            `Budget "${budget.name}" cree avec succes.`;

          this.budgetFormVisible = false;

          this.loadBudgets();
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  selectBudget(
    budget: Budget
  ): void {

    this.selectedBudget = budget;

    this.formError = '';

    this.successMessage = '';

    this.loadLines();
  }


  closeDetails(): void {

    this.selectedBudget = null;

    this.budgetLines = [];
  }


  loadLines(): void {

    if (!this.selectedBudget) {
      return;
    }


    this.loadingLines = true;


    this.budgetService
      .getLines(
        this.selectedBudget.id
      )
      .pipe(
        finalize(() => {
          this.loadingLines = false;
        })
      )
      .subscribe({

        next: lines => {

          this.budgetLines = lines;
        },

        error: error => {

          console.error(
            'Erreur chargement lignes budgetaires',
            error
          );
        }

      });
  }


  openLineForm(): void {

    this.formError = '';

    this.lineForm.reset({

      code: '',

      name: '',

      description: '',

      allocatedAmount: 0

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

    if (!this.selectedBudget) {
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

      code:
        value.code.trim(),

      name:
        value.name.trim(),

      description:
        this.nullIfEmpty(
          value.description
        ),

      allocatedAmount:
        value.allocatedAmount

    };


    this.budgetService
      .addLine(
        this.selectedBudget.id,
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

          this.refreshSelectedBudget();
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  activateBudget(): void {

    if (!this.selectedBudget) {
      return;
    }


    this.activating = true;

    this.errorMessage = '';


    this.budgetService
      .activate(
        this.selectedBudget.id
      )
      .pipe(
        finalize(() => {
          this.activating = false;
        })
      )
      .subscribe({

        next: budget => {

          this.selectedBudget = budget;

          this.budgets =
            this.budgets.map(b =>
              b.id === budget.id
                ? budget
                : b
            );
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Erreur activation budget',
            error
          );

          this.errorMessage =
            error.error?.message
            ?? "Impossible d'activer le budget.";
        }

      });
  }


  private refreshSelectedBudget(): void {

    if (!this.selectedBudget) {
      return;
    }


    this.budgetService
      .getById(
        this.selectedBudget.id
      )
      .subscribe({

        next: budget => {

          this.selectedBudget = budget;

          this.budgets =
            this.budgets.map(b =>
              b.id === budget.id
                ? budget
                : b
            );
        },

        error: () => {}

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

      case 'DRAFT':
        return 'Brouillon';

      case 'ACTIVE':
        return 'Actif';

      case 'CLOSED':
        return 'Cloture';

      case 'CANCELLED':
        return 'Annule';

      default:
        return status || '-';
    }
  }


  consumptionPercent(
    budget: Budget
  ): number {

    if (!budget.totalAmount) {
      return 0;
    }

    return Math.round(
      (budget.totalConsumed / budget.totalAmount) * 100
    );
  }
}