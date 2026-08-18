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
  BankStatement,
  BankStatementCreateRequest,
  BankStatementLine,
  BankStatementLineCreateRequest,
  ReconciliationCandidate
} from '../../shared/models/bank.model';


@Injectable({
  providedIn: 'root'
})
export class BankService {

  private readonly apiUrl =
    `${environment.apiUrl}/bank-reconciliation`;


  constructor(
    private readonly http: HttpClient
  ) {}


  listStatements(
    establishmentId: string
  ): Observable<BankStatement[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<BankStatement[]>(
      `${this.apiUrl}/statements`,
      {
        params
      }
    );
  }


  createStatement(
    request: BankStatementCreateRequest
  ): Observable<BankStatement> {

    return this.http.post<BankStatement>(
      `${this.apiUrl}/statements`,
      request
    );
  }


  closeStatement(
    statementId: string
  ): Observable<BankStatement> {

    return this.http.post<BankStatement>(
      `${this.apiUrl}/statements/${statementId}/close`,
      {}
    );
  }


  getLines(
    statementId: string
  ): Observable<BankStatementLine[]> {

    return this.http.get<BankStatementLine[]>(
      `${this.apiUrl}/statements/${statementId}/lines`
    );
  }


  addLine(
    statementId: string,
    request: BankStatementLineCreateRequest
  ): Observable<BankStatementLine> {

    return this.http.post<BankStatementLine>(
      `${this.apiUrl}/statements/${statementId}/lines`,
      request
    );
  }


  candidates(
    lineId: string
  ): Observable<ReconciliationCandidate[]> {

    return this.http.get<ReconciliationCandidate[]>(
      `${this.apiUrl}/lines/${lineId}/candidates`
    );
  }


  reconcile(
    lineId: string,
    accountingEntryLineId: string
  ): Observable<BankStatementLine> {

    return this.http.post<BankStatementLine>(
      `${this.apiUrl}/lines/${lineId}/reconcile`,
      {
        accountingEntryLineId
      }
    );
  }
}