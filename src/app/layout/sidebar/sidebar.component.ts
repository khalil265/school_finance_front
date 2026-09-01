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
      icon: '\u25A6',
      section: 'MENU PRINCIPAL'
    },
    {
      label: 'Eleves',
      route: '/students',
      icon: '\u265F'
    },
    {
      label: 'Facturation',
      route: '/billing',
      icon: '\u25A4'
    },
    {
      label: 'Paiements',
      route: '/payments',
      icon: '\u25C6'
    },
    {
      label: 'Frais',
      route: '/fees',
      icon: '$',
      permission: 'BUDGET_READ'
    },
    {
      label: 'Depenses',
      route: '/expenses',
      icon: '\u2197'
    },
    {
      label: 'Budget',
      route: '/budget',
      icon: '\u25A5'
    },
    {
      label: 'Tresorerie',
      route: '/treasury',
      icon: '\u25CE',
      section: 'COMPTABILITE',
      permission: 'ACCOUNTING_READ'
    },
    {
      label: 'Securite',
      route: '/security',
      icon: '\u25C8',
      permission: 'USER_READ'
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