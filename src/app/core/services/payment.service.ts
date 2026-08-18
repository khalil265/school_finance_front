import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  Payment,
  PaymentCreateRequest,
  Receipt
} from '../../shared/models/payment.model';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly apiUrl =
    environment.apiUrl;


  constructor(
    private readonly http: HttpClient
  ) {}


  create(
    request: PaymentCreateRequest
  ): Observable<Payment> {

    return this.http.post<Payment>(
      `${this.apiUrl}/payments`,
      request
    );
  }


  getById(
    id: string
  ): Observable<Payment> {

    return this.http.get<Payment>(
      `${this.apiUrl}/payments/${id}`
    );
  }


  getStudentPayments(
    studentId: string,
    academicYearId: string
  ): Observable<Payment[]> {

    const params =
      new HttpParams()
        .set('academicYearId', academicYearId);


    return this.http.get<Payment[]>(
      `${this.apiUrl}/payments/student/${studentId}`,
      {
        params
      }
    );
  }


  getReceipt(
    id: string
  ): Observable<Receipt> {

    return this.http.get<Receipt>(
      `${this.apiUrl}/receipts/${id}`
    );
  }


  downloadReceiptPdf(
    receiptId: string
  ): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/receipts/${receiptId}/pdf`,
      {
        responseType: 'blob'
      }
    );
  }
}