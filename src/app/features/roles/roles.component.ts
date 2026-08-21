import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Role
} from '../../shared/models/role.model';

import {
  RoleService
} from '../../core/services/role.service';

@Component({
  selector: 'app-roles',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {

  private readonly roleService =
    inject(RoleService);

  roles: Role[] = [];

  showForm = false;

  editingRole: Role | null = null;

  form: Role = this.emptyRole();

  ngOnInit(): void {

    this.roleService
      .getRoles()
      .subscribe(roles => {
        this.roles = roles;
      });
  }

  emptyRole(): Role {
    return {
      id: '',
      name: '',
      code: '',
      description: '',
      active: true,
      permissions: []
    };
  }

  newRole(): void {

    this.editingRole = null;

    this.form = this.emptyRole();

    this.showForm = true;
  }

  editRole(role: Role): void {

    this.editingRole = role;

    this.form = {
      ...role,
      permissions: [
        ...role.permissions
      ]
    };

    this.showForm = true;
  }

  saveRole(): void {

    if (!this.form.name.trim()) {
      return;
    }

    if (!this.form.code.trim()) {
      return;
    }

    if (this.editingRole) {

      this.roleService.updateRole({
        ...this.form
      });

    } else {

      this.roleService.createRole({
        ...this.form,
        id: crypto.randomUUID()
      });

    }

    this.cancel();
  }

  deleteRole(role: Role): void {

    if (
      confirm(
        `Supprimer le rôle "${role.name}" ?`
      )
    ) {

      this.roleService.deleteRole(role.id);
    }
  }

  cancel(): void {

    this.showForm = false;

    this.editingRole = null;

    this.form = this.emptyRole();
  }
}
