import { inject } from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../auth/auth.service';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const permission =
    route.data['permission'] as string | undefined;

  const role =
    route.data['role'] as string | undefined;


  if (!authService.isAuthenticated()) {

    return router.createUrlTree([
      '/login'
    ]);
  }


  if (
    permission &&
    !authService.hasPermission(permission)
  ) {

    return router.createUrlTree([
      '/forbidden'
    ]);
  }


  if (
    role &&
    !authService.hasRole(role)
  ) {

    return router.createUrlTree([
      '/forbidden'
    ]);
  }


  return true;
};