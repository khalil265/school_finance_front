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
  CashSession,
  CashSessionDetails,
  CloseCashSessionRequest,
  OpenCashSessionRequest
} from '../../shared/models/cash.model';


@Injectable({
  providedIn: 'root'
})
export class CashService {

  private readonly apiUrl =
    `${environment.apiUrl}/cash`;


  constructor(
    private readonly http: HttpClient
  ) {}


  open(
    request: OpenCashSessionRequest
  ): Observable<CashSession> {

    return this.http.post<CashSession>(
      `${this.apiUrl}/sessions/open`,
      request
    );
  }


  current(
    establishmentId: string,
    accountCode: string = '571000'
  ): Observable<CashSessionDetails> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId)
        .set('accountCode', accountCode);


    return this.http.get<CashSessionDetails>(
      `${this.apiUrl}/sessions/current`,
      {
        params
      }
    );
  }


  get(
    sessionId: string
  ): Observable<CashSessionDetails> {

    return this.http.get<CashSessionDetails>(
      `${this.apiUrl}/sessions/${sessionId}`
    );
  }


  list(
    establishmentId: string
  ): Observable<CashSession[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<CashSession[]>(
      `${this.apiUrl}/sessions`,
      {
        params
      }
    );
  }


  close(
    sessionId: string,
    request: CloseCashSessionRequest
  ): Observable<CashSessionDetails> {

    return this.http.post<CashSessionDetails>(
      `${this.apiUrl}/sessions/${sessionId}/close`,
      request
    );
  }
}