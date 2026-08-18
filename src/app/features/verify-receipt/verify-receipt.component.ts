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
  ActivatedRoute
} from '@angular/router';

import {
  ReceiptVerificationService
} from '../../core/services/receipt-verification.service';

import {
  ReceiptVerification
} from '../../shared/models/receipt-verification.model';


@Component({
  selector: 'app-verify-receipt',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './verify-receipt.component.html',
  styleUrl: './verify-receipt.component.css'
})
export class VerifyReceiptComponent implements OnInit {

  private readonly verificationService =
    inject(ReceiptVerificationService);

  private readonly route =
    inject(ActivatedRoute);


  code = '';

  result: ReceiptVerification | null = null;

  loading = false;

  errorMessage = '';

  searched = false;


  ngOnInit(): void {

    const paramCode =
      this.route.snapshot.paramMap.get('code');

    if (paramCode) {

      this.code = paramCode;

      this.verify();
    }
  }


  verify(): void {

    if (!this.code.trim()) {

      this.errorMessage =
        'Veuillez saisir un code de verification.';

      return;
    }


    this.loading = true;

    this.errorMessage = '';

    this.result = null;

    this.searched = true;


    this.verificationService
      .verify(
        this.code.trim()
      )
      .subscribe({

        next: result => {

          this.result = result;

          this.loading = false;
        },

        error: () => {

          this.loading = false;

          this.errorMessage =
            'Code de verification invalide ou recu introuvable.';
        }

      });
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