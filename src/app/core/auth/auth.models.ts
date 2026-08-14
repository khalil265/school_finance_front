export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  roles: string[];
  permissions: string[];
}

export interface CurrentUser {
  username: string;
  roles: string[];
  permissions: string[];
}