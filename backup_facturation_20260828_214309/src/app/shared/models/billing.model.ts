export interface StudentCharge {

  id: string;

  studentAccountId: string;

  feeStructureId: string;

  feeTypeId: string;

  feeTypeCode: string;

  feeTypeName: string;

  installmentNumber: number | null;

  label: string;

  amount: number;

  paidAmount: number;

  discountAmount: number;

  remainingAmount: number;

  dueDate: string;

  gracePeriodDays: number | null;

  status: string;
}


export interface StudentFinancialSummary {

  studentAccountId: string;

  studentId: string;

  registrationNumber: string;

  studentName: string;

  academicYearId: string;

  academicYear: string;

  levelId: string | null;

  level: string | null;

  totalCharged: number;

  totalPaid: number;

  totalDiscount: number;

  balance: number;

  overdueChargeCount: number;

  status: string;

  charges: StudentCharge[];
}


export interface GenerateScheduleRequest {

  enrollmentId: string;
}


export interface ScheduleGenerationResponse {

  studentAccountId: string;

  studentId: string;

  registrationNumber: string;

  createdCharges: number;

  skippedCharges: number;

  totalCharged: number;

  balance: number;

  charges: StudentCharge[];
}