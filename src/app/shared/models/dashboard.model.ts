export interface DashboardRecentTransaction {

  id: string;

  reference: string;

  type: 'INCOME' | 'EXPENSE' | string;

  description: string;

  amount: number;

  transactionDate: string;
}


export interface DashboardSummary {

  establishmentId: string;

  totalIncome: number;

  totalExpenses: number;

  budgetAmount: number;

  budgetCommitted: number;

  budgetConsumed: number;

  budgetAvailable: number;

  cashBalance: number;

  pendingExpenses: number;

  approvedExpenses: number;

  paidExpenses: number;

  recentTransactions: DashboardRecentTransaction[];
}