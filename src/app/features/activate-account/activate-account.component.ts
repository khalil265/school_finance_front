import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  AccountActivationService
} from '../../core/services/account-activation.service';


@Component({
  selector: 'app-activate-account',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.css'
})
export class ActivateAccountComponent implements OnInit {

  private readonly activationService =
    inject(AccountActivationService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);


  token = '';

  username = '';

  firstName = '';

  password = '';

  confirmPassword = '';


  checking = true;

  submitting = false;

  linkValid = false;

  linkExpired = false;

  activated = false;


  errorMessage = '';


  ngOnInit(): void {

    const paramToken =
      this.route.snapshot.paramMap.get('token');

    if (!paramToken) {

      this.checking = false;

      this.errorMessage =
        "Aucun jeton d'activation fourni.";

      return;
    }

    this.token = paramToken;


    this.activationService
      .check(
        this.token
      )
      .pipe(
        finalize(() => {
          this.checking = false;
        })
      )
      .subscribe({

        next: result => {

          this.linkValid = result.valid;

          this.linkExpired = result.expired;

          this.username = result.username;

          this.firstName = result.firstName;
        },

        error: () => {

          this.linkValid = false;

          this.errorMessage =
            "Ce lien d'activation est invalide.";
        }

      });
  }


  submit(): void {

    this.errorMessage = '';


    if (!this.password || this.password.length < 8) {

      this.errorMessage =
        'Le mot de passe doit contenir au moins 8 caracteres.';

      return;
    }


    if (this.password !== this.confirmPassword) {

      this.errorMessage =
        'Les mots de passe ne correspondent pas.';

      return;
    }


    this.submitting = true;


    this.activationService
      .activate({
        token: this.token,
        password: this.password
      })
      .pipe(
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe({

        next: () => {

          this.activated = true;

          setTimeout(() => {

            this.router.navigate(['/login']);

          }, 3000);
        },

        error: (error) => {

          this.errorMessage =
            error.error?.message
            ?? "Impossible d'activer le compte.";
        }

      });
  }
}