import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loading = false;
  errorMessage = '';

  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {

    this.form = this.fb.nonNullable.group({

      username: [
        '',
        [
          Validators.required
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ]

    });
  }

  login(): void {

    this.errorMessage = '';

    if (this.form.invalid) {

      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService
      .login(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({

        next: () => {

          this.router.navigate(['/dashboard']);
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Erreur authentification',
            error
          );

          if (error.status === 401) {

            this.errorMessage =
              'Nom utilisateur ou mot de passe incorrect.';

          }
          else if (error.status === 0) {

            this.errorMessage =
              'Impossible de joindre le serveur School Finance.';

          }
          else {

            this.errorMessage =
              'Une erreur est survenue pendant la connexion.';
          }
        }

      });
  }
}