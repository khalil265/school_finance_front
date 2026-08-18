export interface AccountingAccount {

  id: string;

  establishmentId: string;

  code: string;

  name: string;

  accountType: string;

  parentId: string | null;

  parentCode: string | null;

  parentName: string | null;

  description: string | null;

  postingAllowed: boolean;

  systemAccount: boolean;

  active: boolean;
}


export interface AccountingAccountCreateRequest {

  establishmentId: string;

  code: string;

  name: string;

  accountType: string;

  parentId: string | null;

  description: string | null;

  postingAllowed: boolean | null;
}


export interface AccountingAccountUpdateRequest {

  name: string;

  description: string | null;

  postingAllowed: boolean | null;

  active: boolean | null;
}


export interface GeneralJournalLine {

  entryId: string;

  entryNumber: string;

  entryDate: string;

  journalCode: string;

  description: string | null;

  lineNumber: number;

  accountCode: string;

  accountName: string;

  direction: string;

  debit: number;

  credit: number;
}


export interface LedgerLine {

  entryId: string;

  entryNumber: string;

  entryDate: string;

  journalCode: string;

  description: string | null;

  direction: string;

  debit: number;

  credit: number;

  runningBalance: number;
}


export interface Ledger {

  accountCode: string;

  accountName: string;

  totalDebit: number;

  totalCredit: number;

  balance: number;

  balanceNature: string;

  lines: LedgerLine[];
}


export interface TrialBalanceLine {

  accountCode: string;

  accountName: string;

  accountType: string;

  totalDebit: number;

  totalCredit: number;

  debitBalance: number;

  creditBalance: number;
}


export interface TrialBalance {

  totalDebit: number;

  totalCredit: number;

  totalDebitBalance: number;

  totalCreditBalance: number;

  balanced: boolean;

  accounts: TrialBalanceLine[];
}