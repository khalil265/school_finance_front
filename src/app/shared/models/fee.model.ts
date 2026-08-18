export interface FeeType {

  id: string;

  establishmentId: string;

  establishmentName: string;

  code: string;

  name: string;

  category: string;

  frequency: string;

  description: string | null;

  mandatory: boolean;

  active: boolean;
}


export interface FeeTypeCreateRequest {

  establishmentId: string;

  code: string;

  name: string;

  category: string;

  frequency: string;

  description: string | null;

  mandatory: boolean;
}


export interface FeeStructure {

  id: string;

  establishmentId: string;

  academicYearId: string;

  academicYear: string;

  levelId: string;

  level: string;

  feeTypeId: string;

  feeTypeCode: string;

  feeTypeName: string;

  category: string;

  frequency: string;

  amount: number;

  installmentCount: number | null;

  firstDueDate: string | null;

  gracePeriodDays: number | null;

  active: boolean;
}


export interface FeeStructureCreateRequest {

  establishmentId: string;

  academicYearId: string;

  levelId: string;

  feeTypeId: string;

  amount: number;

  installmentCount: number | null;

  firstDueDate: string | null;

  gracePeriodDays: number | null;
}