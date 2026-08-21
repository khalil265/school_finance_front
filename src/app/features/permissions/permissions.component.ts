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
  PermissionAction,
  PermissionModule
} from '../../shared/models/permission.model';

import {
  PermissionService
} from '../../core/services/permission.service';

import {
  Role
} from '../../shared/models/role.model';

import {
  RoleService
} from '../../core/services/role.service';

@Component({
  selector: 'app-permissions',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent implements OnInit {

  readonly permissionService =
    inject(PermissionService);

  private readonly roleService =
    inject(RoleService);

  modules: PermissionModule[] = [];

  roles: Role[] = [];

  selectedRole: Role | null = null;

  selectedPermissions =
    new Set<string>();

  ngOnInit(): void {

    this.modules =
      this.permissionService.modules;

    this.roleService
      .getRoles()
      .subscribe(roles => {

        this.roles = roles;

        if (!this.selectedRole && roles.length) {
          this.selectRole(roles[0]);
        }
      });
  }

  selectRole(role: Role): void {

    this.selectedRole = role;

    this.selectedPermissions =
      new Set(role.permissions);
  }

  permissionCode(
    module: PermissionModule,
    action: PermissionAction
  ): string {

    return this.permissionService
      .permissionCode(module.code, action);
  }

  hasPermission(
    module: PermissionModule,
    action: PermissionAction
  ): boolean {

    if (this.selectedPermissions.has('*')) {
      return true;
    }

    return this.selectedPermissions.has(
      this.permissionCode(module, action)
    );
  }

  togglePermission(
    module: PermissionModule,
    action: PermissionAction
  ): void {

    if (!this.selectedRole) {
      return;
    }

    const code =
      this.permissionCode(module, action);

    if (this.selectedPermissions.has(code)) {
      this.selectedPermissions.delete(code);
    } else {
      this.selectedPermissions.add(code);
    }

    this.persistPermissions();
  }

  toggleModule(
    module: PermissionModule
  ): void {

    if (!this.selectedRole) {
      return;
    }

    const allSelected =
      module.actions.every(action =>
        this.hasPermission(module, action)
      );

    module.actions.forEach(action => {

      const code =
        this.permissionCode(
          module,
          action
        );

      if (allSelected) {
        this.selectedPermissions.delete(code);
      } else {
        this.selectedPermissions.add(code);
      }

    });

    this.persistPermissions();
  }

  toggleAction(
    action: PermissionAction
  ): void {

    if (!this.selectedRole) {
      return;
    }

    const modules =
      this.modules.filter(module =>
        module.actions.includes(action)
      );

    const allSelected =
      modules.every(module =>
        this.hasPermission(module, action)
      );

    modules.forEach(module => {

      const code =
        this.permissionCode(
          module,
          action
        );

      if (allSelected) {
        this.selectedPermissions.delete(code);
      } else {
        this.selectedPermissions.add(code);
      }

    });

    this.persistPermissions();
  }

  allSelected(
    module: PermissionModule
  ): boolean {

    return module.actions.every(action =>
      this.hasPermission(module, action)
    );
  }

  actionSelected(
    action: PermissionAction
  ): boolean {

    const modules =
      this.modules.filter(module =>
        module.actions.includes(action)
      );

    return modules.length > 0 &&
      modules.every(module =>
        this.hasPermission(module, action)
      );
  }

  selectAll(): void {

    if (!this.selectedRole) {
      return;
    }

    this.selectedPermissions.clear();

    this.modules.forEach(module => {

      module.actions.forEach(action => {

        this.selectedPermissions.add(
          this.permissionCode(
            module,
            action
          )
        );

      });

    });

    this.persistPermissions();
  }

  clearAll(): void {

    if (!this.selectedRole) {
      return;
    }

    this.selectedPermissions.clear();

    this.persistPermissions();
  }

  save(): void {

    if (!this.selectedRole) {
      return;
    }

    this.roleService.updateRole({
      ...this.selectedRole,
      permissions: [
        ...this.selectedPermissions
      ]
    });

    alert(
      'Les permissions du rôle ont été enregistrées.'
    );
  }

  private persistPermissions(): void {

    if (!this.selectedRole) {
      return;
    }

    this.selectedRole = {
      ...this.selectedRole,
      permissions: [
        ...this.selectedPermissions
      ]
    };
  }

  availableActions(
    module: PermissionModule
  ): PermissionAction[] {

    return module.actions;
  }

  actionLabel(
    action: PermissionAction
  ): string {

    const labels: Record<
      PermissionAction,
      string
    > = {

      VIEW: 'Voir',
      CREATE: 'Créer',
      EDIT: 'Modifier',
      DELETE: 'Supprimer',
      APPROVE: 'Approuver',
      PAY: 'Payer',
      EXPORT: 'Exporter',
      PRINT: 'Imprimer'

    };

    return labels[action];
  }
}


