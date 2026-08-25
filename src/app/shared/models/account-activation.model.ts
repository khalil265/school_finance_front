export interface AccountActivationCheck {

  valid: boolean;

  username: string;

  firstName: string;

  expired: boolean;
}


export interface ActivateAccountRequest {

  token: string;

  password: string;
}