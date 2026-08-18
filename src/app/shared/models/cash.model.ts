export interface CashSession {

  id: string;

  establishmentId: string;

  sessionNumber: string;

  accountCode: string;

  status: string;

  openingBalance: number;

  totalInflows: number;

  totalOutflows: number;

  theoreticalBalance: number;

  physicalBalance: number | null;

  differenceAmount: number | null;

  openedAt: string;

  openedBy: string;

  closedAt: string | null;

  closedBy: string | null;

  closingNotes: string | null;
}


export interface CashMovement {

  accountingEntryLineId: string;

  accountingEntryId: string;

  entryNumber: string;

  entryDate: string;

  journalCode: string;

  description: string | null;

  accountCode: string;

  direction: string;

  inflow: number;

  outflow: number;

  runningBalance: number;
}


export interface CashSessionDetails {

  session: CashSession;

  movements: CashMovement[];
}


export interface OpenCashSessionRequest {

  establishmentId: string;

  accountCode: string | null;

  openingBalance: number;
}


export interface CloseCashSessionRequest {

  physicalBalance: number;

  notes: string | null;
}