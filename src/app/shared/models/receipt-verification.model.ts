export interface ReceiptVerification {

  valid: boolean;

  verificationCode: string;

  receiptNumber: string;

  paymentNumber: string;

  establishment: string;

  amount: number;

  paymentMethod: string;

  paymentStatus: string;

  issuedAt: string;

  cancelled: boolean;
}