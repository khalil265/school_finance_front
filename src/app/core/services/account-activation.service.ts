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
  AccountActivationCheck,
  ActivateAccountRequest
} from '../../shared/models/account-activation.model';


@Injectable({
  providedIn: 'root'
})
export class AccountActivationService {

  private readonly apiUrl =
    `${environment.apiUrl}/public/account`;


  constructor(
    private readonly http: HttpClient
  ) {}


  check(
    token: string
  ): Observable<AccountActivationCheck> {

    return this.http.get<AccountActivationCheck>(
      `${this.apiUrl}/activate/${token}`
    );
  }


  activate(
    request: ActivateAccountRequest
  ): Observable<void> {

    return this.http.post<void>(
      `${this.apiUrl}/activate`,
      request
    );
  }
}