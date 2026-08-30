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
  ExpenseCategory,
  ExpenseCategoryCreateRequest
} from '../../shared/models/expense-category.model';


@Injectable({
  providedIn: 'root'
})
export class ExpenseCategoryService {

  private readonly apiUrl =
    `${environment.apiUrl}/expense-categories`;


  constructor(
    private readonly http: HttpClient
  ) {}


  list(
    establishmentId: string
  ): Observable<ExpenseCategory[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<ExpenseCategory[]>(
      this.apiUrl,
      {
        params
      }
    );
  }


  create(
    request: ExpenseCategoryCreateRequest
  ): Observable<ExpenseCategory> {

    return this.http.post<ExpenseCategory>(
      this.apiUrl,
      request
    );
  }
}