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
  ExpensePaymentResponse,
  PayExpenseRequest
} from '../../shared/models/expense-payment.model';


@Injectable({
  providedIn: 'root'
})
export class ExpensePaymentService {

  private readonly apiUrl =
    `${environment.apiUrl}/expenses`;


  constructor(
    private readonly http: HttpClient
  ) {}


  pay(
    expenseId: string,
    request: PayExpenseRequest
  ): Observable<ExpensePaymentResponse> {

    return this.http.post<ExpensePaymentResponse>(
      `${this.apiUrl}/${expenseId}/pay`,
      request
    );
  }
}