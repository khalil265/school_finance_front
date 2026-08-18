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
  Budget,
  BudgetCreateRequest,
  BudgetLine,
  BudgetLineCreateRequest
} from '../../shared/models/budget.model';


@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private readonly apiUrl =
    `${environment.apiUrl}/budgets`;


  constructor(
    private readonly http: HttpClient
  ) {}


  list(
    establishmentId: string
  ): Observable<Budget[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<Budget[]>(
      this.apiUrl,
      {
        params
      }
    );
  }


  getById(
    id: string
  ): Observable<Budget> {

    return this.http.get<Budget>(
      `${this.apiUrl}/${id}`
    );
  }


  create(
    request: BudgetCreateRequest
  ): Observable<Budget> {

    return this.http.post<Budget>(
      this.apiUrl,
      request
    );
  }


  activate(
    id: string
  ): Observable<Budget> {

    return this.http.post<Budget>(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }


  getLines(
    budgetId: string
  ): Observable<BudgetLine[]> {

    return this.http.get<BudgetLine[]>(
      `${this.apiUrl}/${budgetId}/lines`
    );
  }


  addLine(
    budgetId: string,
    request: BudgetLineCreateRequest
  ): Observable<BudgetLine> {

    return this.http.post<BudgetLine>(
      `${this.apiUrl}/${budgetId}/lines`,
      request
    );
  }
}