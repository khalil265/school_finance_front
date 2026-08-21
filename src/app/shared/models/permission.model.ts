export type PermissionAction =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'APPROVE'
  | 'PAY'
  | 'EXPORT'
  | 'PRINT';

export interface PermissionModule {
  code: string;
  name: string;
  description: string;
  actions: PermissionAction[];
}

export interface PermissionSelection {
  [permissionCode: string]: boolean;
}
