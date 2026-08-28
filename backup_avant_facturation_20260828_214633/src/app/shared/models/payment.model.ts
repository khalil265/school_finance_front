export interface PaymentAllocation {

  allocationId: string;

  chargeId: string;

  feeTypeCode: string;

  chargeLabel: string;

  dueDate: string;

  allocatedAmount: number;

  remainingAmount: number;
}


export interface Receipt {

  id: string;

  receiptNumber: string;

  verificationCode: string;

  amount: number;

  issuedAt: string;

  cancelled: boolean;
}


export interface Payment {

  id: string;

  paymentNumber: string;

  studentId: string;

  registrationNumber: string;

  studentName: string;

  academicYearId: string;

  amount: number;

  paymentMethod: string;

  status: string;

  transactionReference: string | null;

  notes: string | null;

  paidAt: string;

  receivedBy: string | null;

  accountBalance: number;

  allocations: PaymentAllocation[];

  receipt: Receipt | null;
}


export interface PaymentCreateRequest {

  studentId: string;

  academicYearId: string;

  amount: number;

  paymentMethod: string;

  transactionReference: string | null;

  notes: string | null;
}