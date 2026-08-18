import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  ReceiptVerification
} from '../../shared/models/receipt-verification.model';


@Injectable({
  providedIn: 'root'
})
export class ReceiptVerificationService {

  private readonly apiUrl =
    `${environment.apiUrl}/public/receipts`;


  constructor(
    private readonly http: HttpClient
  ) {}


  verify(
    verificationCode: string
  ): Observable<ReceiptVerification> {

    return this.http.get<ReceiptVerification>(
      `${this.apiUrl}/verify/${verificationCode}`
    );
  }
}