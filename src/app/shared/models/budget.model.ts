export interface Budget {

  id: string;

  establishmentId: string;

  academicYearId: string;

  academicYear: string;

  code: string;

  name: string;

  description: string | null;

  totalAmount: number;

  totalCommitted: number;

  totalConsumed: number;

  availableAmount: number;

  status: string;
}


export interface BudgetCreateRequest {

  establishmentId: string;

  academicYearId: string;

  code: string;

  name: string;

  description: string | null;
}


export interface BudgetLine {

  id: string;

  budgetId: string;

  code: string;

  name: string;

  description: string | null;

  allocatedAmount: number;

  committedAmount: number;

  consumedAmount: number;

  availableAmount: number;

  active: boolean;
}


export interface BudgetLineCreateRequest {

  code: string;

  name: string;

  description: string | null;

  allocatedAmount: number;
}