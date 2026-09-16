export interface PayExpenseRequest {

  paymentMethod: string;

  paymentReference: string | null;

  treasuryAccountCode: string;

  expenseAccountCode: string;

  expenseAccountName: string;

  notes: string | null;
}


export interface ExpensePaymentResponse {

  paymentId: string;

  paymentNumber: string;

  expenseId: string;

  expenseNumber: string;

  supplierName: string | null;

  amount: number;

  paymentMethod: string;

  paymentReference: string | null;

  paidAt: string;

  paidBy: string;

  expenseStatus: string;

  treasuryTransactionNumber: string | null;
}