export interface Supplier {

  id: string;

  establishmentId: string;

  code: string;

  name: string;

  taxIdentifier: string | null;

  phone: string | null;

  email: string | null;

  address: string | null;

  bankName: string | null;

  bankAccount: string | null;

  active: boolean;
}


export interface SupplierCreateRequest {

  establishmentId: string;

  code: string;

  name: string;

  taxIdentifier: string | null;

  phone: string | null;

  email: string | null;

  address: string | null;

  bankName: string | null;

  bankAccount: string | null;
}