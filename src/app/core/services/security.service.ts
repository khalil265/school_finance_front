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
  AppUser,
  Permission,
  ResetPasswordRequest,
  Role,
  RoleCreateRequest,
  RoleUpdateRequest,
  UserCreateRequest,
  UserUpdateRequest
} from '../../shared/models/security.model';


@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  private readonly apiUrl =
    environment.apiUrl;


  constructor(
    private readonly http: HttpClient
  ) {}


  // ---- Users ----

  listUsers(
    establishmentId: string | null
  ): Observable<AppUser[]> {

    let params = new HttpParams();

    if (establishmentId) {

      params =
        params.set('establishmentId', establishmentId);
    }


    return this.http.get<AppUser[]>(
      `${this.apiUrl}/users`,
      {
        params
      }
    );
  }


  createUser(
    request: UserCreateRequest
  ): Observable<AppUser> {

    return this.http.post<AppUser>(
      `${this.apiUrl}/users`,
      request
    );
  }


  updateUser(
    id: string,
    request: UserUpdateRequest
  ): Observable<AppUser> {

    return this.http.put<AppUser>(
      `${this.apiUrl}/users/${id}`,
      request
    );
  }


  activateUser(
    id: string
  ): Observable<AppUser> {

    return this.http.post<AppUser>(
      `${this.apiUrl}/users/${id}/activate`,
      {}
    );
  }


  deactivateUser(
    id: string
  ): Observable<AppUser> {

    return this.http.post<AppUser>(
      `${this.apiUrl}/users/${id}/deactivate`,
      {}
    );
  }


  unlockUser(
    id: string
  ): Observable<AppUser> {

    return this.http.post<AppUser>(
      `${this.apiUrl}/users/${id}/unlock`,
      {}
    );
  }


  resetPassword(
    id: string,
    request: ResetPasswordRequest
  ): Observable<AppUser> {

    return this.http.post<AppUser>(
      `${this.apiUrl}/users/${id}/reset-password`,
      request
    );
  }


  // ---- Roles ----

  listRoles(): Observable<Role[]> {

    return this.http.get<Role[]>(
      `${this.apiUrl}/roles`
    );
  }


  createRole(
    request: RoleCreateRequest
  ): Observable<Role> {

    return this.http.post<Role>(
      `${this.apiUrl}/roles`,
      request
    );
  }


  updateRole(
    id: string,
    request: RoleUpdateRequest
  ): Observable<Role> {

    return this.http.put<Role>(
      `${this.apiUrl}/roles/${id}`,
      request
    );
  }


  // ---- Permissions ----

  listPermissions(): Observable<Permission[]> {

    return this.http.get<Permission[]>(
      `${this.apiUrl}/permissions`
    );
  }
}