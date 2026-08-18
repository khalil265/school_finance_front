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
  CashService
} from '../../core/services/cash.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  AuthService
} from '../../core/auth/auth.service';

import {
  CashSession,
  CashSessionDetails
} from '../../shared/models/cash.model';


@Component({
  selector: 'app-cash',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './cash.component.html',
  styleUrl: './cash.component.css'
})
export class CashComponent implements OnInit {

  private readonly cashService =
    inject(CashService);

  private readonly appContext =
    inject(AppContextService);

  private readonly authService =
    inject(AuthService);

  private readonly fb =
    inject(FormBuilder);


  currentDetails: CashSessionDetails | null = null;

  sessionHistory: CashSession[] = [];

  showHistory = false;


  openFormVisible = false;

  closeFormVisible = false;


  loading = false;

  loadingHistory = false;

  saving = false;


  errorMessage = '';

  formError = '';

  successMessage = '';


  readonly openForm =
    this.fb.nonNullable.group({

      openingBalance: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]

    });


  readonly closeForm =
    this.fb.nonNullable.group({

      physicalBalance: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      notes: ['']

    });


  get canManage(): boolean {

    return this.authService
      .hasPermission('ACCOUNTING_ENTRY_CREATE');
  }


  ngOnInit(): void {

    this.loadCurrent();
  }


  loadCurrent(): void {

    this.loading = true;

    this.errorMessage = '';


    this.cashService
      .current(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({

        next: details => {

          this.currentDetails = details;
        },

        error: (error: HttpErrorResponse) => {

          this.currentDetails = null;


          if (error.status === 404) {

            return;
          }


          console.error(
            'Erreur chargement session caisse',
            error
          );

          this.errorMessage =
            'Impossible de charger la session de caisse.';
        }

      });
  }


  loadHistory(): void {

    this.showHistory = !this.showHistory;


    if (!this.showHistory || this.sessionHistory.length > 0) {
      return;
    }


    this.loadingHistory = true;


    this.cashService
      .list(
        this.appContext.establishmentId()
      )
      .pipe(
        finalize(() => {
          this.loadingHistory = false;
        })
      )
      .subscribe({

        next: sessions => {

          this.sessionHistory = sessions;
        },

        error: error => {

          console.error(
            'Erreur chargement historique caisse',
            error
          );
        }

      });
  }


  openSessionForm(): void {

    this.formError = '';

    this.successMessage = '';

    this.openForm.reset({
      openingBalance: 0
    });

    this.openFormVisible = true;
  }


  closeSessionFormPanel(): void {

    if (this.saving) {
      return;
    }

    this.openFormVisible = false;

    this.formError = '';
  }


  submitOpenForm(): void {

    this.formError = '';


    if (this.openForm.invalid) {

      this.openForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.openForm.getRawValue();


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      accountCode: null,

      openingBalance:
        value.openingBalance

    };


    this.cashService
      .open(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: session => {

          this.successMessage =
            `Session ${session.sessionNumber} ouverte avec succes.`;

          this.openFormVisible = false;

          this.loadCurrent();
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  openCloseForm(): void {

    if (!this.currentDetails) {
      return;
    }


    this.formError = '';

    this.successMessage = '';

    this.closeForm.reset({

      physicalBalance:
        this.currentDetails.session.theoreticalBalance,

      notes: ''

    });

    this.closeFormVisible = true;
  }


  closeCloseFormPanel(): void {

    if (this.saving) {
      return;
    }

    this.closeFormVisible = false;

    this.formError = '';
  }


  submitCloseForm(): void {

    if (!this.currentDetails) {
      return;
    }


    this.formError = '';


    if (this.closeForm.invalid) {

      this.closeForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.closeForm.getRawValue();


    const request = {

      physicalBalance:
        value.physicalBalance,

      notes:
        this.nullIfEmpty(
          value.notes
        )

    };


    this.cashService
      .close(
        this.currentDetails.session.id,
        request
      )
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: details => {

          this.successMessage =
            'Session de caisse cloturee avec succes.';

          this.closeFormVisible = false;

          this.currentDetails = details;

          this.sessionHistory = [];
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  private handleFormError(
    error: HttpErrorResponse
  ): void {

    console.error(
      'Erreur enregistrement session caisse',
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

    return status === 'OPEN'
      ? 'Ouverte'
      : 'Cloturee';
  }
}