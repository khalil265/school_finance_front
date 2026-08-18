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
  Expense,
  ExpenseCreateRequest
} from '../../shared/models/expense.model';


@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly apiUrl =
    `${environment.apiUrl}/expenses`;


  constructor(
    private readonly http: HttpClient
  ) {}


  list(
    establishmentId: string
  ): Observable<Expense[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<Expense[]>(
      this.apiUrl,
      {
        params
      }
    );
  }


  getById(
    id: string
  ): Observable<Expense> {

    return this.http.get<Expense>(
      `${this.apiUrl}/${id}`
    );
  }


  create(
    request: ExpenseCreateRequest
  ): Observable<Expense> {

    return this.http.post<Expense>(
      this.apiUrl,
      request
    );
  }


  submit(
    id: string
  ): Observable<Expense> {

    return this.http.post<Expense>(
      `${this.apiUrl}/${id}/submit`,
      {}
    );
  }


  verify(
    id: string
  ): Observable<Expense> {

    return this.http.post<Expense>(
      `${this.apiUrl}/${id}/verify`,
      {}
    );
  }


  approve(
    id: string
  ): Observable<Expense> {

    return this.http.post<Expense>(
      `${this.apiUrl}/${id}/approve`,
      {}
    );
  }


  reject(
    id: string,
    reason: string
  ): Observable<Expense> {

    return this.http.post<Expense>(
      `${this.apiUrl}/${id}/reject`,
      {
        reason
      }
    );
  }
}