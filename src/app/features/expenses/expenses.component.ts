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
  ExpenseService
} from '../../core/services/expense.service';

import {
  SupplierService
} from '../../core/services/supplier.service';

import {
  ExpenseCategoryService
} from '../../core/services/expense-category.service';

import {
  ExpensePaymentService
} from '../../core/services/expense-payment.service';

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
  Expense
} from '../../shared/models/expense.model';

import {
  Supplier
} from '../../shared/models/supplier.model';

import {
  ExpenseCategory
} from '../../shared/models/expense-category.model';

import {
  PayExpenseRequest
} from '../../shared/models/expense-payment.model';

import {
  AccountingAccount
} from '../../shared/models/accounting.model';


@Component({
  selector: 'app-expenses',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})
export class ExpensesComponent implements OnInit {

  private readonly expenseService =
    inject(ExpenseService);

  private readonly supplierService =
    inject(SupplierService);

  private readonly categoryService =
    inject(ExpenseCategoryService);

  private readonly paymentService =
    inject(ExpensePaymentService);

  private readonly accountingService =
    inject(AccountingService);

  private readonly appContext =
    inject(AppContextService);

  private readonly authService =
    inject(AuthService);

  private readonly fb =
    inject(FormBuilder);


  expenses: Expense[] = [];

  suppliers: Supplier[] = [];

  categories: ExpenseCategory[] = [];

  selectedExpense: Expense | null = null;


  formVisible = false;

  supplierFormVisible = false;

  categoryFormVisible = false;

  payFormVisible = false;

  rejectFormVisible = false;

  rejectReason = '';


  treasuryAccounts: AccountingAccount[] = [];

  expenseAccounts: AccountingAccount[] = [];

  loadingAccounts = false;

  lastPaymentResult: string | null = null;


  loading = false;

  loadingSuppliers = false;

  loadingCategories = false;

  saving = false;

  actionLoading = false;


  errorMessage = '';

  formError = '';

  successMessage = '';


  readonly expenseForm =
    this.fb.nonNullable.group({

      supplierId: [''],

      expenseCategoryId: [
        '',
        [
          Validators.required
        ]
      ],

      subject: [
        '',
        [
          Validators.required
        ]
      ],

      description: [''],

      amount: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]

    });


  readonly supplierForm =
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

      taxIdentifier: [''],

      phone: [''],

      email: [
        '',
        [
          Validators.email
        ]
      ],

      address: [''],

      bankName: [''],

      bankAccount: ['']

    });


  readonly categoryForm =
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

      description: ['']

    });


  readonly payForm =
    this.fb.nonNullable.group({

      paymentMethod: [
        'BANK_TRANSFER',
        [
          Validators.required
        ]
      ],

      paymentReference: [''],

      treasuryAccountCode: [
        '',
        [
          Validators.required
        ]
      ],

      expenseAccountCode: [
        '',
        [
          Validators.required
        ]
      ],

      notes: ['']

    });


  get canCreate(): boolean {

    return this.authService
      .hasPermission('EXPENSE_CREATE');
  }


  get canVerify(): boolean {

    return this.authService
      .hasPermission('EXPENSE_VERIFY');
  }


  get canApprove(): boolean {

    return this.authService
      .hasPermission('EXPENSE_APPROVE');
  }


  get canPay(): boolean {

    return this.authService
      .hasPermission('EXPENSE_PAY');
  }


  ngOnInit(): void {

    this.loadExpenses();

    this.loadSuppliers();

    this.loadCategories();
  }


  loadExpenses(): void {

    this.loading = true;

    this.errorMessage = '';


    this.expenseService
      .list(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({

        next: expenses => {

          this.expenses = expenses;
        },

        error: error => {

          console.error(
            'Erreur chargement depenses',
            error
          );

          this.errorMessage =
            'Impossible de charger les depenses.';
        }

      });
  }


  loadSuppliers(): void {

    this.loadingSuppliers = true;


    this.supplierService
      .list(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingSuppliers = false;
        })
      )
      .subscribe({

        next: suppliers => {

          this.suppliers = suppliers;
        },

        error: error => {

          console.error(
            'Erreur chargement fournisseurs',
            error
          );
        }

      });
  }


  loadCategories(): void {

    this.loadingCategories = true;


    this.categoryService
      .list(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingCategories = false;
        })
      )
      .subscribe({

        next: categories => {

          this.categories = categories;
        },

        error: error => {

          console.error(
            'Erreur chargement categories de depenses',
            error
          );
        }

      });
  }


  openCreateForm(): void {

    this.formError = '';

    this.successMessage = '';

    this.expenseForm.reset({

      supplierId: '',

      expenseCategoryId: '',

      subject: '',

      description: '',

      amount: 0

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


  submitExpenseForm(): void {

    this.formError = '';


    if (this.expenseForm.invalid) {

      this.expenseForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.expenseForm.getRawValue();


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      supplierId:
        this.nullIfEmpty(
          value.supplierId
        ),

      expenseCategoryId:
        value.expenseCategoryId,

      subject:
        value.subject.trim(),

      description:
        this.nullIfEmpty(
          value.description
        ),

      amount:
        value.amount

    };


    this.expenseService
      .create(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: expense => {

          this.successMessage =
            `Depense ${expense.expenseNumber} creee avec succes.`;

          this.formVisible = false;

          this.loadExpenses();
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  openSupplierForm(): void {

    this.formError = '';

    this.supplierForm.reset({

      code: '',

      name: '',

      taxIdentifier: '',

      phone: '',

      email: '',

      address: '',

      bankName: '',

      bankAccount: ''

    });

    this.supplierFormVisible = true;
  }


  closeSupplierForm(): void {

    if (this.saving) {
      return;
    }

    this.supplierFormVisible = false;
  }


  submitSupplierForm(): void {

    this.formError = '';


    if (this.supplierForm.invalid) {

      this.supplierForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.supplierForm.getRawValue();


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      code:
        value.code.trim(),

      name:
        value.name.trim(),

      taxIdentifier:
        this.nullIfEmpty(
          value.taxIdentifier
        ),

      phone:
        this.nullIfEmpty(
          value.phone
        ),

      email:
        this.nullIfEmpty(
          value.email
        ),

      address:
        this.nullIfEmpty(
          value.address
        ),

      bankName:
        this.nullIfEmpty(
          value.bankName
        ),

      bankAccount:
        this.nullIfEmpty(
          value.bankAccount
        )

    };


    this.supplierService
      .create(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: supplier => {

          this.suppliers = [
            ...this.suppliers,
            supplier
          ];

          this.expenseForm.patchValue({
            supplierId: supplier.id
          });

          this.supplierFormVisible = false;
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  openCategoryForm(): void {

    this.formError = '';

    this.categoryForm.reset({

      code: '',

      name: '',

      description: ''

    });

    this.categoryFormVisible = true;
  }


  closeCategoryForm(): void {

    if (this.saving) {
      return;
    }

    this.categoryFormVisible = false;
  }


  submitCategoryForm(): void {

    this.formError = '';


    if (this.categoryForm.invalid) {

      this.categoryForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.categoryForm.getRawValue();


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      code:
        value.code.trim(),

      name:
        value.name.trim(),

      description:
        this.nullIfEmpty(
          value.description
        )

    };


    this.categoryService
      .create(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: category => {

          this.categories = [
            ...this.categories,
            category
          ];

          this.expenseForm.patchValue({
            expenseCategoryId: category.id
          });

          this.categoryFormVisible = false;
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  selectExpense(
    expense: Expense
  ): void {

    this.selectedExpense = expense;

    this.rejectFormVisible = false;

    this.rejectReason = '';
  }


  closeDetails(): void {

    this.selectedExpense = null;
  }


  submitExpenseAction(): void {

    if (!this.selectedExpense) {
      return;
    }


    this.actionLoading = true;

    this.errorMessage = '';


    this.expenseService
      .submit(
        this.selectedExpense.id
      )
      .pipe(
        finalize(() => {
          this.actionLoading = false;
        })
      )
      .subscribe({

        next: expense => {

          this.updateAfterAction(expense);
        },

        error: error => {

          this.handleActionError(error);
        }

      });
  }


  verifyExpenseAction(): void {

    if (!this.selectedExpense) {
      return;
    }


    this.actionLoading = true;

    this.errorMessage = '';


    this.expenseService
      .verify(
        this.selectedExpense.id
      )
      .pipe(
        finalize(() => {
          this.actionLoading = false;
        })
      )
      .subscribe({

        next: expense => {

          this.updateAfterAction(expense);
        },

        error: error => {

          this.handleActionError(error);
        }

      });
  }


  approveExpenseAction(): void {

    if (!this.selectedExpense) {
      return;
    }


    this.actionLoading = true;

    this.errorMessage = '';


    this.expenseService
      .approve(
        this.selectedExpense.id
      )
      .pipe(
        finalize(() => {
          this.actionLoading = false;
        })
      )
      .subscribe({

        next: expense => {

          this.updateAfterAction(expense);
        },

        error: error => {

          this.handleActionError(error);
        }

      });
  }


  openPayForm(): void {

    if (!this.selectedExpense) {
      return;
    }


    this.formError = '';

    this.lastPaymentResult = null;

    this.payForm.reset({

      paymentMethod: 'BANK_TRANSFER',

      paymentReference: '',

      treasuryAccountCode: '',

      expenseAccountCode: '',

      notes: ''

    });

    this.payFormVisible = true;


    if (this.treasuryAccounts.length === 0) {

      this.loadAccountsForPayment();
    }
  }


  private loadAccountsForPayment(): void {

    this.loadingAccounts = true;


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

          this.treasuryAccounts =
            accounts.filter(
              a => a.accountType === 'ASSET'
            );

          this.expenseAccounts =
            accounts.filter(
              a => a.accountType === 'EXPENSE'
            );
        },

        error: error => {

          console.error(
            'Erreur chargement plan comptable',
            error
          );

          this.formError =
            'Impossible de charger le plan comptable.';
        }

      });
  }


  closePayForm(): void {

    if (this.actionLoading) {
      return;
    }

    this.payFormVisible = false;

    this.formError = '';
  }


  submitPayForm(): void {

    if (!this.selectedExpense) {
      return;
    }


    this.formError = '';


    if (this.payForm.invalid) {

      this.payForm.markAllAsTouched();

      return;
    }


    const value =
      this.payForm.getRawValue();


    const expenseAccount =
      this.expenseAccounts.find(
        a => a.code === value.expenseAccountCode
      );

    if (!expenseAccount) {

      this.formError =
        'Compte de charge introuvable.';

      return;
    }


    this.actionLoading = true;


    const request: PayExpenseRequest = {

      paymentMethod:
        value.paymentMethod,

      paymentReference:
        this.nullIfEmpty(
          value.paymentReference
        ),

      treasuryAccountCode:
        value.treasuryAccountCode,

      expenseAccountCode:
        value.expenseAccountCode,

      expenseAccountName:
        expenseAccount.name,

      notes:
        this.nullIfEmpty(
          value.notes
        )

    };


    this.paymentService
      .pay(
        this.selectedExpense.id,
        request
      )
      .pipe(
        finalize(() => {
          this.actionLoading = false;
        })
      )
      .subscribe({

        next: result => {

          this.lastPaymentResult =
            `Paiement ${result.paymentNumber} enregistre avec succes.`;

          this.payFormVisible = false;

          this.selectedExpense = {
            ...this.selectedExpense!,
            status: result.expenseStatus
          };

          this.expenses =
            this.expenses.map(e =>
              e.id === this.selectedExpense!.id
                ? this.selectedExpense!
                : e
            );
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Erreur paiement depense',
            error
          );

          this.formError =
            error.error?.message
            ?? "Impossible d'enregistrer le paiement.";
        }

      });
  }


  openRejectForm(): void {

    this.rejectFormVisible = true;

    this.rejectReason = '';
  }


  cancelReject(): void {

    this.rejectFormVisible = false;

    this.rejectReason = '';
  }


  confirmReject(): void {

    if (
      !this.selectedExpense ||
      !this.rejectReason.trim()
    ) {
      return;
    }


    this.actionLoading = true;

    this.errorMessage = '';


    this.expenseService
      .reject(
        this.selectedExpense.id,
        this.rejectReason.trim()
      )
      .pipe(
        finalize(() => {
          this.actionLoading = false;
        })
      )
      .subscribe({

        next: expense => {

          this.rejectFormVisible = false;

          this.updateAfterAction(expense);
        },

        error: error => {

          this.handleActionError(error);
        }

      });
  }


  private updateAfterAction(
    expense: Expense
  ): void {

    this.selectedExpense = expense;

    this.expenses =
      this.expenses.map(e =>
        e.id === expense.id
          ? expense
          : e
      );
  }


  private handleFormError(
    error: HttpErrorResponse
  ): void {

    console.error(
      'Erreur enregistrement depense',
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


  private handleActionError(
    error: HttpErrorResponse
  ): void {

    console.error(
      'Erreur action depense',
      error
    );


    if (error.status === 403) {

      this.errorMessage =
        'Vous ne disposez pas des droits necessaires pour cette action.';

      return;
    }


    this.errorMessage =
      error.error?.message
      ?? "Impossible d'effectuer cette action.";
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

      case 'SUBMITTED':
        return 'Soumise';

      case 'VERIFIED':
        return 'Verifiee';

      case 'BUDGET_CHECKED':
        return 'Budget verifie';

      case 'APPROVED':
        return 'Approuvee';

      case 'REJECTED':
        return 'Rejetee';

      case 'PAID':
        return 'Payee';

      case 'CANCELLED':
        return 'Annulee';

      default:
        return status || '-';
    }
  }
}