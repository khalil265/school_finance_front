import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  SecurityService
} from '../../core/services/security.service';

import {
  AppContextService
} from '../../core/services/app-context.service';

import {
  AuthService
} from '../../core/auth/auth.service';

import {
  AppUser,
  Permission,
  Role
} from '../../shared/models/security.model';


@Component({
  selector: 'app-security',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl: './security.component.html',
  styleUrl: './security.component.css'
})
export class SecurityComponent implements OnInit {

  private readonly securityService =
    inject(SecurityService);

  private readonly appContext =
    inject(AppContextService);

  private readonly authService =
    inject(AuthService);

  private readonly fb =
    inject(FormBuilder);


  activeTab: 'users' | 'roles' = 'users';


  users: AppUser[] = [];

  roles: Role[] = [];

  permissions: Permission[] = [];

  permissionModules: string[] = [];


  userFormVisible = false;

  editingUser: AppUser | null = null;

  passwordFormVisible = false;

  passwordTargetUser: AppUser | null = null;

  newPassword = '';


  roleFormVisible = false;

  editingRole: Role | null = null;

  selectedPermissionIds = new Set<string>();


  loadingUsers = false;

  loadingRoles = false;

  loadingPermissions = false;

  saving = false;


  errorMessage = '';

  formError = '';

  successMessage = '';


  readonly userForm =
    this.fb.nonNullable.group({

      username: [
        '',
        [
          Validators.required
        ]
      ],

      email: [
        '',
        [
          Validators.email
        ]
      ],

      password: [''],

      firstName: [
        '',
        [
          Validators.required
        ]
      ],

      lastName: [
        '',
        [
          Validators.required
        ]
      ],

      phone: ['']

    });


  readonly roleForm =
    this.fb.nonNullable.group({

      code: [
        '',
        [
          Validators.required
        ]
      ],

      name: [
        '',
        [
          Validators.required
        ]
      ],

      description: ['']

    });


  get canManageUsers(): boolean {

    return this.authService
      .hasPermission('USER_UPDATE');
  }


  get canCreateUsers(): boolean {

    return this.authService
      .hasPermission('USER_CREATE');
  }


  get canManageRoles(): boolean {

    return this.authService
      .hasPermission('ROLE_MANAGE');
  }


  ngOnInit(): void {

    this.loadUsers();

    this.loadRoles();

    this.loadPermissions();
  }


  switchTab(
    tab: 'users' | 'roles'
  ): void {

    this.activeTab = tab;

    this.errorMessage = '';
  }


  loadUsers(): void {

    this.loadingUsers = true;

    this.errorMessage = '';


    this.securityService
      .listUsers(null)
      .pipe(
        finalize(() => {
          this.loadingUsers = false;
        })
      )
      .subscribe({

        next: users => {

          this.users = users;
        },

        error: error => {

          console.error(
            'Erreur chargement utilisateurs',
            error
          );

          this.errorMessage =
            'Impossible de charger les utilisateurs.';
        }

      });
  }


  loadRoles(): void {

    this.loadingRoles = true;


    this.securityService
      .listRoles()
      .pipe(
        finalize(() => {
          this.loadingRoles = false;
        })
      )
      .subscribe({

        next: roles => {

          this.roles = roles;
        },

        error: error => {

          console.error(
            'Erreur chargement roles',
            error
          );
        }

      });
  }


  loadPermissions(): void {

    this.loadingPermissions = true;


    this.securityService
      .listPermissions()
      .pipe(
        finalize(() => {
          this.loadingPermissions = false;
        })
      )
      .subscribe({

        next: permissions => {

          this.permissions = permissions;

          this.permissionModules =
            [
              ...new Set(
                permissions.map(p => p.module)
              )
            ].sort();
        },

        error: error => {

          console.error(
            'Erreur chargement permissions',
            error
          );
        }

      });
  }


  permissionsByModule(
    module: string
  ): Permission[] {

    return this.permissions.filter(
      p => p.module === module
    );
  }


  // ---- Users ----

  openCreateUserForm(): void {

    this.editingUser = null;

    this.formError = '';

    this.successMessage = '';

    this.userForm.reset({

      username: '',

      email: '',

      password: '',

      firstName: '',

      lastName: '',

      phone: ''

    });

    this.userForm.controls.password.addValidators([
      Validators.required,
      Validators.minLength(8)
    ]);

    this.userForm.controls.password.updateValueAndValidity();

    this.userForm.controls.username.enable();

    this.selectedPermissionIds = new Set<string>();

    this.userFormVisible = true;
  }


  openEditUserForm(
    user: AppUser
  ): void {

    this.editingUser = user;

    this.formError = '';

    this.successMessage = '';

    this.userForm.reset({

      username: user.username,

      email: user.email ?? '',

      password: '',

      firstName: user.firstName,

      lastName: user.lastName,

      phone: user.phone ?? ''

    });

    this.userForm.controls.password.clearValidators();

    this.userForm.controls.password.updateValueAndValidity();

    this.userForm.controls.username.disable();

    this.selectedPermissionIds =
      new Set(
        user.roles.map(r => r.id)
      );

    this.userFormVisible = true;
  }


  closeUserForm(): void {

    if (this.saving) {
      return;
    }

    this.userFormVisible = false;

    this.formError = '';
  }


  toggleRoleForUser(
    roleId: string
  ): void {

    if (this.selectedPermissionIds.has(roleId)) {

      this.selectedPermissionIds.delete(roleId);

    }
    else {

      this.selectedPermissionIds.add(roleId);
    }
  }


  submitUserForm(): void {

    this.formError = '';


    if (this.userForm.invalid) {

      this.userForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.userForm.getRawValue();

    const roleIds =
      Array.from(this.selectedPermissionIds);


    if (this.editingUser) {

      const request = {

        email:
          this.nullIfEmpty(value.email),

        firstName:
          value.firstName.trim(),

        lastName:
          value.lastName.trim(),

        phone:
          this.nullIfEmpty(value.phone),

        roleIds

      };


      this.securityService
        .updateUser(
          this.editingUser.id,
          request
        )
        .pipe(
          finalize(() => {
            this.saving = false;
          })
        )
        .subscribe({

          next: () => {

            this.successMessage =
              'Utilisateur modifie avec succes.';

            this.userFormVisible = false;

            this.loadUsers();
          },

          error: (error: HttpErrorResponse) => {

            this.handleFormError(error);
          }

        });

      return;
    }


    const request = {

      establishmentId:
        this.appContext.establishmentId(),

      username:
        value.username.trim(),

      email:
        this.nullIfEmpty(value.email),

      password:
        value.password,

      firstName:
        value.firstName.trim(),

      lastName:
        value.lastName.trim(),

      phone:
        this.nullIfEmpty(value.phone),

      roleIds

    };


    this.securityService
      .createUser(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: user => {

          this.successMessage =
            `Utilisateur "${user.username}" cree avec succes.`;

          this.userFormVisible = false;

          this.loadUsers();
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  toggleUserActive(
    user: AppUser
  ): void {

    const action =
      user.active
        ? this.securityService.deactivateUser(user.id)
        : this.securityService.activateUser(user.id);

    action.subscribe({

      next: () => {

        this.loadUsers();
      },

      error: error => {

        console.error(
          'Erreur changement statut utilisateur',
          error
        );

        this.errorMessage =
          "Impossible de changer le statut de l'utilisateur.";
      }

    });
  }


  unlockUser(
    user: AppUser
  ): void {

    this.securityService
      .unlockUser(user.id)
      .subscribe({

        next: () => {

          this.loadUsers();
        },

        error: error => {

          console.error(
            'Erreur deverrouillage utilisateur',
            error
          );

          this.errorMessage =
            "Impossible de deverrouiller l'utilisateur.";
        }

      });
  }


  openPasswordForm(
    user: AppUser
  ): void {

    this.passwordTargetUser = user;

    this.newPassword = '';

    this.formError = '';

    this.passwordFormVisible = true;
  }


  closePasswordForm(): void {

    if (this.saving) {
      return;
    }

    this.passwordFormVisible = false;

    this.passwordTargetUser = null;
  }


  submitPasswordForm(): void {

    if (!this.passwordTargetUser) {
      return;
    }


    if (
      !this.newPassword ||
      this.newPassword.length < 8
    ) {

      this.formError =
        'Le mot de passe doit contenir au moins 8 caracteres.';

      return;
    }


    this.saving = true;

    this.formError = '';


    this.securityService
      .resetPassword(
        this.passwordTargetUser.id,
        {
          newPassword: this.newPassword
        }
      )
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: () => {

          this.successMessage =
            'Mot de passe reinitialise avec succes.';

          this.passwordFormVisible = false;
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  // ---- Roles ----

  openCreateRoleForm(): void {

    this.editingRole = null;

    this.formError = '';

    this.successMessage = '';

    this.roleForm.reset({

      code: '',

      name: '',

      description: ''

    });

    this.roleForm.controls.code.enable();

    this.selectedPermissionIds = new Set<string>();

    this.roleFormVisible = true;
  }


  openEditRoleForm(
    role: Role
  ): void {

    this.editingRole = role;

    this.formError = '';

    this.successMessage = '';

    this.roleForm.reset({

      code: role.code,

      name: role.name,

      description: role.description ?? ''

    });

    this.roleForm.controls.code.disable();

    this.selectedPermissionIds =
      new Set(
        role.permissions.map(p => p.id)
      );

    this.roleFormVisible = true;
  }


  closeRoleForm(): void {

    if (this.saving) {
      return;
    }

    this.roleFormVisible = false;

    this.formError = '';
  }


  togglePermission(
    permissionId: string
  ): void {

    if (this.selectedPermissionIds.has(permissionId)) {

      this.selectedPermissionIds.delete(permissionId);

    }
    else {

      this.selectedPermissionIds.add(permissionId);
    }
  }


  submitRoleForm(): void {

    this.formError = '';


    if (this.roleForm.invalid) {

      this.roleForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    const value =
      this.roleForm.getRawValue();

    const permissionIds =
      Array.from(this.selectedPermissionIds);


    if (this.editingRole) {

      const request = {

        name:
          value.name.trim(),

        description:
          this.nullIfEmpty(value.description),

        permissionIds,

        active: true

      };


      this.securityService
        .updateRole(
          this.editingRole.id,
          request
        )
        .pipe(
          finalize(() => {
            this.saving = false;
          })
        )
        .subscribe({

          next: () => {

            this.successMessage =
              'Role modifie avec succes.';

            this.roleFormVisible = false;

            this.loadRoles();
          },

          error: (error: HttpErrorResponse) => {

            this.handleFormError(error);
          }

        });

      return;
    }


    const request = {

      code:
        value.code.trim(),

      name:
        value.name.trim(),

      description:
        this.nullIfEmpty(value.description),

      permissionIds

    };


    this.securityService
      .createRole(request)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({

        next: role => {

          this.successMessage =
            `Role "${role.name}" cree avec succes.`;

          this.roleFormVisible = false;

          this.loadRoles();
        },

        error: (error: HttpErrorResponse) => {

          this.handleFormError(error);
        }

      });
  }


  private handleFormError(
    error: HttpErrorResponse
  ): void {

    console.error(
      'Erreur enregistrement',
      error
    );


    if (error.status === 403) {

      this.formError =
        'Vous ne disposez pas des droits necessaires.';

      return;
    }


    if (error.status === 400 || error.status === 409) {

      this.formError =
        error.error?.message
        ?? 'Les informations saisies sont invalides.';

      return;
    }


    this.formError =
      "Impossible d'enregistrer.";
  }


  private nullIfEmpty(
    value: string | null | undefined
  ): string | null {

    if (
      value == null ||
      value.trim() === ''
    ) {

      return null;
    }

    return value.trim();
  }
}