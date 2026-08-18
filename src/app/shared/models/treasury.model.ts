export interface TreasuryTransaction {

  id: string;

  transactionNumber: string;

  transactionType: string;

  amount: number;

  paymentMethod: string;

  accountCode: string;

  externalReference: string | null;

  description: string | null;

  transactionDate: string;

  createdBy: string;
}