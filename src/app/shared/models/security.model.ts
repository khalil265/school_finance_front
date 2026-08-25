export interface Permission {

  id: string;

  code: string;

  name: string;

  module: string;

  description: string | null;
}


export interface RoleSummary {

  id: string;

  code: string;

  name: string;
}


export interface Role {

  id: string;

  code: string;

  name: string;

  description: string | null;

  systemRole: boolean;

  active: boolean;

  permissions: Permission[];
}


export interface RoleCreateRequest {

  code: string;

  name: string;

  description: string | null;

  permissionIds: string[];
}


export interface RoleUpdateRequest {

  name: string;

  description: string | null;

  permissionIds: string[];

  active: boolean | null;
}


export interface AppUser {

  id: string;

  establishmentId: string | null;

  establishmentName: string | null;

  username: string;

  email: string | null;

  firstName: string;

  lastName: string;

  phone: string | null;

  active: boolean;

  locked: boolean;

  lastLoginAt: string | null;

  roles: RoleSummary[];
}


export interface UserCreateRequest {

  establishmentId: string | null;

  username: string;

  email: string;

  firstName: string;

  lastName: string;

  phone: string | null;

  roleIds: string[];
}


export interface UserUpdateRequest {

  email: string | null;

  firstName: string;

  lastName: string;

  phone: string | null;

  roleIds: string[];
}


export interface ResetPasswordRequest {

  newPassword: string;
}