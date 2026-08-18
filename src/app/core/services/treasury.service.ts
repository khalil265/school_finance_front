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
  TreasuryTransaction
} from '../../shared/models/treasury.model';


@Injectable({
  providedIn: 'root'
})
export class TreasuryService {

  private readonly apiUrl =
    `${environment.apiUrl}/treasury`;


  constructor(
    private readonly http: HttpClient
  ) {}


  transactions(
    establishmentId: string
  ): Observable<TreasuryTransaction[]> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<TreasuryTransaction[]>(
      `${this.apiUrl}/transactions`,
      {
        params
      }
    );
  }


  balance(
    establishmentId: string
  ): Observable<number> {

    const params =
      new HttpParams()
        .set('establishmentId', establishmentId);


    return this.http.get<number>(
      `${this.apiUrl}/balance`,
      {
        params
      }
    );
  }
}