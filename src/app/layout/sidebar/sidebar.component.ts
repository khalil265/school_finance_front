import {
  Component,
  computed,
  inject
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  NgFor,
  NgIf
} from '@angular/common';

import {
  AuthService
} from '../../core/auth/auth.service';

import {
  MenuItem
} from '../../shared/models/menu-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive,
    NgFor,
    NgIf
  ],

  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  private readonly authService =
    inject(AuthService);


  private readonly allMenuItems: MenuItem[] = [

    {
      label: 'Tableau de bord',
      route: '/dashboard',
      icon: '▦',
      section: 'MENU PRINCIPAL'
    },

    {
      label: 'Élèves',
      route: '/students',
      icon: '♟'
    },

    {
      label: 'Facturation',
      route: '/billing',
      icon: '▤'
    },

    {
      label: 'Paiements',
      route: '/payments',
      icon: '◆'
    },

    {
      label: 'Dépenses',
      route: '/expenses',
      icon: '↗'
    },

    {
      label: 'Budget',
      route: '/budget',
      icon: '▥'
    },

    {
      label: 'Comptabilité',
      route: '/accounting',
      icon: '≡',
      section: 'COMPTABILITÉ',
      permission: 'ACCOUNTING_READ'
    },

    {
      label: 'Trésorerie',
      route: '/treasury',
      icon: '◎',
      permission: 'ACCOUNTING_READ'
    },

    {
      label: 'Caisse',
      route: '/cash',
      icon: '▣',
      permission: 'ACCOUNTING_READ'
    },

    {
      label: 'Rapprochement bancaire',
      route: '/bank-reconciliation',
      icon: '⇄',
      permission: 'BANK_READ'
    }

  ];


  readonly menuItems = computed(() => {

    const user =
      this.authService.currentUser();


    if (!user) {
      return [];
    }


    return this.allMenuItems.filter(
      item => {

        if (
          item.role &&
          !user.roles.includes(item.role)
        ) {

          return false;
        }


        if (
          item.permission &&
          !user.permissions.includes(item.permission)
        ) {

          return false;
        }


        return true;
      }
    );
  });


  showSection(
    index: number
  ): boolean {

    const items =
      this.menuItems();


    return !!items[index]?.section;
  }
}