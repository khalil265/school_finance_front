import { Routes } from '@angular/router';

import {
  authGuard
} from './core/guards/auth.guard';

import {
  permissionGuard
} from './core/guards/permission.guard';


import {
  LoginComponent
} from './features/login/login.component';

import {
  ForbiddenComponent
} from './features/forbidden/forbidden.component';

import {
  MainLayoutComponent
} from './layout/main-layout/main-layout.component';


import {
  DashboardComponent
} from './features/dashboard/dashboard.component';

import {
  StudentsComponent
} from './features/students/students.component';

import {
  BillingComponent
} from './features/billing/billing.component';

import {
  PaymentsComponent
} from './features/payments/payments.component';


import {
  FeesComponent
} from './features/fees/fees.component';

import {
  ExpensesComponent
} from './features/expenses/expenses.component';

import {
  BudgetComponent
} from './features/budget/budget.component';

import {
  AccountingComponent
} from './features/accounting/accounting.component';

import {
  TreasuryComponent
} from './features/treasury/treasury.component';

import {
  CashComponent
} from './features/cash/cash.component';

import {
  BankReconciliationComponent
} from './features/bank-reconciliation/bank-reconciliation.component';


import {
  SecurityComponent
} from './features/security/security.component';


export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent
  },


  {
    path: 'forbidden',
    component: ForbiddenComponent
  },


  {
    path: '',
    component: MainLayoutComponent,

    canActivate: [
      authGuard
    ],

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },


      {
        path: 'dashboard',
        component: DashboardComponent
      },


      {
        path: 'students',
        component: StudentsComponent
      },


      {
        path: 'billing',
        component: BillingComponent
      },


      {
        path: 'payments',
        component: PaymentsComponent
      },


      {
        path: 'fees',
        component: FeesComponent
      },


      {
        path: 'expenses',
        component: ExpensesComponent
      },


      {
        path: 'budget',
        component: BudgetComponent
      },


      {
        path: 'accounting',

        component:
          AccountingComponent,

        canActivate: [
          permissionGuard
        ],

        data: {
          permission:
            'ACCOUNTING_READ'
        }
      },


      {
        path: 'treasury',

        component:
          TreasuryComponent,

        canActivate: [
          permissionGuard
        ],

        data: {
          permission:
            'ACCOUNTING_READ'
        }
      },


      {
        path: 'cash',

        component:
          CashComponent,

        canActivate: [
          permissionGuard
        ],

        data: {
          permission:
            'ACCOUNTING_READ'
        }
      },


      {
        path:
          'bank-reconciliation',

        component:
          BankReconciliationComponent,

        canActivate: [
          permissionGuard
        ],

        data: {
          permission:
            'BANK_READ'
        }
      }

    ]
  },


      {
        path: 'security',

        component:
          SecurityComponent,

        canActivate: [
          permissionGuard
        ],

        data: {
          permission:
            'USER_READ'
        }
      },


  {
    path: '**',
    redirectTo: ''
  }

];