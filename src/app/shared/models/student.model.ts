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

  photoBase64: string | null;

  currentAcademicYearId: string | null;

  currentAcademicYearLabel: string | null;

  currentClassId: string | null;

  currentClassName: string | null;

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

  photoBase64: string | null;
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

  photoBase64: string | null;
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


export interface Enrollment {

  id: string;

  studentId: string;

  studentRegistrationNumber: string;

  academicYearId: string;

  academicYear: string;

  schoolClassId: string;

  schoolClass: string;

  level: string;

  classNumber: number | null;

  enrollmentDate: string;

  status: string;

  notes: string | null;
}


export interface EnrollmentRequest {

  academicYearId: string;

  schoolClassId: string;

  classNumber: number | null;

  enrollmentDate: string | null;

  notes: string | null;
}