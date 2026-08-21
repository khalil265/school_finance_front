import { Injectable } from '@angular/core';
import {
  PermissionAction,
  PermissionModule
} from '../../shared/models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  readonly actions: PermissionAction[] = [
    'VIEW',
    'CREATE',
    'EDIT',
    'DELETE',
    'APPROVE',
    'PAY',
    'EXPORT',
    'PRINT'
  ];

  readonly modules: PermissionModule[] = [

    {
      code: 'DASHBOARD',
      name: 'Tableau de bord',
      description: 'Indicateurs et situation financière',
      actions: [
        'VIEW',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'STUDENTS',
      name: 'Élèves',
      description: 'Gestion des élèves',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'PARENTS',
      name: 'Parents',
      description: 'Gestion des parents et responsables',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'CLASSES',
      name: 'Classes',
      description: 'Gestion des classes et niveaux',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'ACADEMIC_YEARS',
      name: 'Années académiques',
      description: 'Gestion des années scolaires',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE',
        'APPROVE',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'BILLING',
      name: 'Facturation',
      description: 'Gestion des factures et frais scolaires',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE',
        'APPROVE',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'PAYMENTS',
      name: 'Paiements',
      description: 'Encaissements et paiements élèves',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE',
        'APPROVE',
        'PAY',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'EXPENSES',
      name: 'Dépenses',
      description: 'Gestion des dépenses',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE',
        'APPROVE',
        'PAY',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'BUDGET',
      name: 'Budget',
      description: 'Préparation et suivi budgétaire',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE',
        'APPROVE',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'ACCOUNTING',
      name: 'Comptabilité',
      description: 'Opérations et suivi comptable',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE',
        'APPROVE',
        'PAY',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'REPORTS',
      name: 'Rapports',
      description: 'Rapports financiers et administratifs',
      actions: [
        'VIEW',
        'EXPORT',
        'PRINT'
      ]
    },

    {
      code: 'USERS',
      name: 'Utilisateurs',
      description: 'Gestion des comptes utilisateurs',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE'
      ]
    },

    {
      code: 'ROLES',
      name: 'Rôles',
      description: 'Gestion des rôles',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE'
      ]
    },

    {
      code: 'PERMISSIONS',
      name: 'Permissions',
      description: 'Gestion des permissions',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE'
      ]
    },

    {
      code: 'SETTINGS',
      name: 'Paramètres',
      description: 'Paramètres généraux',
      actions: [
        'VIEW',
        'CREATE',
        'EDIT',
        'DELETE'
      ]
    }
  ];

  permissionCode(
    module: string,
    action: PermissionAction
  ): string {
    return `${module}.${action}`;
  }
}
