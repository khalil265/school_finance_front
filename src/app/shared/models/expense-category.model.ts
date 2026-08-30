export interface ExpenseCategory {

  id: string;

  establishmentId: string;

  code: string;

  name: string;

  description: string | null;

  active: boolean;
}


export interface ExpenseCategoryCreateRequest {

  establishmentId: string;

  code: string;

  name: string;

  description: string | null;
}