import {
  Injectable,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import {
  Observable,
  tap
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  CurrentUser,
  LoginRequest,
  LoginResponse
} from './auth.models';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY =
    'school_finance_access_token';

  private readonly USER_KEY =
    'school_finance_user';

  private readonly EXPIRES_AT_KEY =
    'school_finance_expires_at';


  private readonly platformId =
    inject(PLATFORM_ID);

  private readonly browser =
    isPlatformBrowser(
      this.platformId
    );


  readonly currentUser =
    signal<CurrentUser | null>(
      this.loadUser()
    );


  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}


  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${environment.apiUrl}/auth/login`,
        request
      )
      .pipe(
        tap(response =>
          this.saveSession(response)
        )
      );
  }


  logout(): void {

    this.clearSession();

    this.router.navigate([
      '/login'
    ]);
  }


  getAccessToken(): string | null {

    if (!this.browser) {
      return null;
    }


    if (this.isTokenExpired()) {

      this.clearSession();

      return null;
    }


    return localStorage.getItem(
      this.TOKEN_KEY
    );
  }


  isAuthenticated(): boolean {

    return !!this.getAccessToken();
  }


  hasRole(
    role: string
  ): boolean {

    return (
      this.currentUser()
        ?.roles
        ?.includes(role)
      ?? false
    );
  }


  hasPermission(
    permission: string
  ): boolean {

    return (
      this.currentUser()
        ?.permissions
        ?.includes(permission)
      ?? false
    );
  }


  private saveSession(
    response: LoginResponse
  ): void {

    const user: CurrentUser = {

      username:
        response.username,

      roles:
        response.roles ?? [],

      permissions:
        response.permissions ?? []

    };


    if (!this.browser) {

      this.currentUser.set(user);

      return;
    }


    const expiresAt =
      Date.now()
      +
      response.expiresIn * 1000;


    localStorage.setItem(
      this.TOKEN_KEY,
      response.accessToken
    );


    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(user)
    );


    localStorage.setItem(
      this.EXPIRES_AT_KEY,
      expiresAt.toString()
    );


    this.currentUser.set(user);
  }


  private loadUser(): CurrentUser | null {

    if (!this.browser) {
      return null;
    }


    const raw =
      localStorage.getItem(
        this.USER_KEY
      );


    if (!raw) {
      return null;
    }


    try {

      return JSON.parse(
        raw
      ) as CurrentUser;

    }
    catch {

      this.clearSession();

      return null;
    }
  }


  private isTokenExpired(): boolean {

    if (!this.browser) {
      return true;
    }


    const expiresAt =
      localStorage.getItem(
        this.EXPIRES_AT_KEY
      );


    if (!expiresAt) {
      return true;
    }


    return (
      Date.now()
      >=
      Number(expiresAt)
    );
  }


  private clearSession(): void {

    if (this.browser) {

      localStorage.removeItem(
        this.TOKEN_KEY
      );

      localStorage.removeItem(
        this.USER_KEY
      );

      localStorage.removeItem(
        this.EXPIRES_AT_KEY
      );
    }


    this.currentUser.set(null);
  }
}