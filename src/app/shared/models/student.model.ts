export interface Student {

  id: string;

  establishmentId: string;

  establishmentName: string;

  registrationNumber: string;

  firstName: string;

  lastName: string;

  gender: string;

  dateOfBirth: string | null;

  placeOfBirth: string | null;

  nationality: string | null;

  phone: string | null;

  email: string | null;

  address: string | null;

  guardianName: string | null;

  guardianPhone: string | null;

  guardianEmail: string | null;

  status: string;

  createdAt: string;

  updatedAt: string;
}


export interface StudentCreateRequest {

  establishmentId: string;

  registrationNumber: string;

  firstName: string;

  lastName: string;

  gender: string;

  dateOfBirth: string | null;

  placeOfBirth: string | null;

  nationality: string | null;

  phone: string | null;

  email: string | null;

  address: string | null;

  guardianName: string | null;

  guardianPhone: string | null;

  guardianEmail: string | null;
}


export interface StudentUpdateRequest {

  firstName: string;

  lastName: string;

  gender: string;

  dateOfBirth: string | null;

  placeOfBirth: string | null;

  nationality: string | null;

  phone: string | null;

  email: string | null;

  address: string | null;

  guardianName: string | null;

  guardianPhone: string | null;

  guardianEmail: string | null;

  status: string;
}


export interface StudentPage {

  content: Student[];

  totalElements: number;

  totalPages: number;

  size: number;

  number: number;

  first: boolean;

  last: boolean;

  numberOfElements: number;
}