import {
  Component,
  inject
} from '@angular/core';

import {
  AuthService
} from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,

  templateUrl:
    './header.component.html',

  styleUrl:
    './header.component.css'
})
export class HeaderComponent {

  private readonly authService =
    inject(AuthService);


  readonly currentUser =
    this.authService.currentUser;


  get initials(): string {

    const username =
      this.currentUser()?.username;

    if (!username) {
      return 'U';
    }

    return username
      .substring(0, 2)
      .toUpperCase();
  }


  get primaryRole(): string {

    return this.currentUser()
      ?.roles
      ?.at(0)
      ?? 'UTILISATEUR';
  }


  logout(): void {

    this.authService.logout();
  }
}