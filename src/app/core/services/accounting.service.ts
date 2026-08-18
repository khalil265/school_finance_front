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
  AccountingAccount,
  AccountingAccountCreateRequest,
  AccountingAccountUpdateRequest,
  GeneralJournalLine,
  Ledger,
  TrialBalance
} from '../../shared/models/accounting.model';


@Injectable({
  providedIn: 'root'
})
export class AccountingService {

  private readonly apiUrl =
    `${environment.apiUrl}/accounting`;


  constructor(
    private readonly http: HttpClient
  ) {}


  listAccounts(
    establishmentId: string,
    accountType: string | null = null,
    activeOnly: boolean = true
  ): Observable<AccountingAccount[]> {

    let params =
      new HttpParams()
        .set('establishmentId', establishmentId)
        .set('activeOnly', activeOnly);

    if (accountType) {

      params =
        params.set('type', accountType);
    }


    return this.http.get<AccountingAccount[]>(
      `${this.apiUrl}/accounts`,
      {
        params
      }
    );
  }


  createAccount(
    request: AccountingAccountCreateRequest
  ): Observable<AccountingAccount> {

    return this.http.post<AccountingAccount>(
      `${this.apiUrl}/accounts`,
      request
    );
  }


  updateAccount(
    id: string,
    request: AccountingAccountUpdateRequest
  ): Observable<AccountingAccount> {

    return this.http.put<AccountingAccount>(
      `${this.apiUrl}/accounts/${id}`,
      request
    );
  }


  deactivateAccount(
    id: string
  ): Observable<AccountingAccount> {

    return this.http.post<AccountingAccount>(
      `${this.apiUrl}/accounts/${id}/deactivate`,
      {}
    );
  }


  journal(
    establishmentId: string,
    from: string | null,
    to: string | null
  ): Observable<GeneralJournalLine[]> {

    let params =
      new HttpParams()
        .set('establishmentId', establishmentId);

    if (from) {
      params = params.set('from', from);
    }

    if (to) {
      params = params.set('to', to);
    }


    return this.http.get<GeneralJournalLine[]>(
      `${this.apiUrl}/journal`,
      {
        params
      }
    );
  }


  ledger(
    establishmentId: string,
    accountCode: string,
    from: string | null,
    to: string | null
  ): Observable<Ledger> {

    let params =
      new HttpParams()
        .set('establishmentId', establishmentId)
        .set('accountCode', accountCode);

    if (from) {
      params = params.set('from', from);
    }

    if (to) {
      params = params.set('to', to);
    }


    return this.http.get<Ledger>(
      `${this.apiUrl}/ledger`,
      {
        params
      }
    );
  }


  trialBalance(
    establishmentId: string,
    from: string | null,
    to: string | null
  ): Observable<TrialBalance> {

    let params =
      new HttpParams()
        .set('establishmentId', establishmentId);

    if (from) {
      params = params.set('from', from);
    }

    if (to) {
      params = params.set('to', to);
    }


    return this.http.get<TrialBalance>(
      `${this.apiUrl}/trial-balance`,
      {
        params
      }
    );
  }
}