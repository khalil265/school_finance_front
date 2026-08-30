export interface Expense {

  id: string;

  expenseNumber: string;

  establishmentId: string;

  supplierId: string | null;

  supplierName: string | null;

  expenseCategoryId: string | null;

  expenseCategoryCode: string | null;

  expenseCategoryName: string | null;

  subject: string;

  description: string | null;

  amount: number;

  currency: string;

  status: string;

  requestedBy: string | null;

  submittedAt: string | null;

  verifiedBy: string | null;

  verifiedAt: string | null;

  approvedBy: string | null;

  approvedAt: string | null;

  rejectedBy: string | null;

  rejectedAt: string | null;

  rejectionReason: string | null;

  paidAt: string | null;

  paymentReference: string | null;
}


export interface ExpenseCreateRequest {

  establishmentId: string;

  supplierId: string | null;

  expenseCategoryId: string;

  subject: string;

  description: string | null;

  amount: number;
}