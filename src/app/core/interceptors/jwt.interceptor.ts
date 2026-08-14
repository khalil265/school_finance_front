import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  AuthService
} from '../auth/auth.service';


export const jwtInterceptor: HttpInterceptorFn = (
  request,
  next
) => {

  const authService =
    inject(AuthService);

  const router =
    inject(Router);

  const token =
    authService.getAccessToken();


  let authenticatedRequest =
    request;


  if (token) {

    authenticatedRequest =
      request.clone({

        setHeaders: {

          Authorization:
            `Bearer ${token}`

        }

      });
  }


  return next(
    authenticatedRequest
  ).pipe(

    catchError(
      (error: HttpErrorResponse) => {

        if (
          error.status === 401 &&
          !request.url.includes('/auth/login')
        ) {

          authService.logout();

          router.navigate([
            '/login'
          ]);
        }


        return throwError(
          () => error
        );
      }
    )

  );
};