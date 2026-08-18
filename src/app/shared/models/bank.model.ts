export interface BankStatement {

  id: string;

  establishmentId: string;

  statementReference: string;

  bankName: string;

  bankAccountNumber: string | null;

  accountCode: string;

  startDate: string;

  endDate: string;

  openingBalance: number;

  closingBalance: number;

  status: string;
}


export interface BankStatementCreateRequest {

  establishmentId: string;

  statementReference: string;

  bankName: string;

  bankAccountNumber: string | null;

  accountCode: string;

  startDate: string;

  endDate: string;

  openingBalance: number;

  closingBalance: number;
}


export interface BankStatementLine {

  id: string;

  bankStatementId: string;

  transactionDate: string;

  bankReference: string | null;

  description: string;

  direction: string;

  amount: number;

  status: string;

  accountingEntryLineId: string | null;

  accountingEntryNumber: string | null;

  accountCode: string | null;

  accountingAmount: number | null;

  differenceAmount: number | null;

  reconciledAt: string | null;

  reconciledBy: string | null;
}


export interface BankStatementLineCreateRequest {

  transactionDate: string;

  bankReference: string | null;

  description: string;

  direction: string;

  amount: number;
}


export interface ReconciliationCandidate {

  accountingEntryLineId: string;

  accountingEntryId: string;

  entryNumber: string;

  entryDate: string;

  accountCode: string;

  accountName: string;

  direction: string;

  amount: number;

  description: string | null;
}