import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Role } from '../../shared/models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly rolesSubject =
    new BehaviorSubject<Role[]>([
      {
        id: '1',
        name: 'Administrateur',
        code: 'ADMIN',
        description: 'Accès complet à toutes les fonctionnalités.',
        active: true,
        permissions: ['*']
      },
      {
        id: '2',
        name: 'Direction',
        code: 'DIRECTION',
        description: 'Accès aux informations financières et aux rapports.',
        active: true,
        permissions: [
          'DASHBOARD.VIEW',
          'STUDENTS.VIEW',
          'PAYMENTS.VIEW',
          'EXPENSES.VIEW',
          'EXPENSES.APPROVE',
          'BUDGET.VIEW',
          'REPORTS.VIEW',
          'REPORTS.EXPORT'
        ]
      },
      {
        id: '3',
        name: 'Comptable',
        code: 'ACCOUNTANT',
        description: 'Gestion financière et comptable.',
        active: true,
        permissions: [
          'DASHBOARD.VIEW',
          'BILLING.VIEW',
          'BILLING.CREATE',
          'PAYMENTS.VIEW',
          'PAYMENTS.CREATE',
          'PAYMENTS.PAY',
          'EXPENSES.VIEW',
          'EXPENSES.CREATE',
          'EXPENSES.EDIT',
          'ACCOUNTING.VIEW',
          'ACCOUNTING.CREATE',
          'REPORTS.VIEW',
          'REPORTS.EXPORT'
        ]
      },
      {
        id: '4',
        name: 'Agent',
        code: 'AGENT',
        description: 'Accès opérationnel limité.',
        active: true,
        permissions: [
          'DASHBOARD.VIEW',
          'STUDENTS.VIEW',
          'PAYMENTS.VIEW',
          'PAYMENTS.CREATE',
          'BILLING.VIEW'
        ]
      }
    ]);

  getRoles(): Observable<Role[]> {
    return this.rolesSubject.asObservable();
  }

  createRole(role: Role): void {
    const roles = this.rolesSubject.value;

    this.rolesSubject.next([
      ...roles,
      role
    ]);
  }

  updateRole(role: Role): void {
    const roles = this.rolesSubject.value.map(item =>
      item.id === role.id ? role : item
    );

    this.rolesSubject.next(roles);
  }

  deleteRole(id: string): void {
    this.rolesSubject.next(
      this.rolesSubject.value.filter(role => role.id !== id)
    );
  }
}
