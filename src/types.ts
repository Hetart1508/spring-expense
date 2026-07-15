export interface User {
  id: number;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  createdAt: string;
}

export type PaymentMethod = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "OTHER";

export interface Transaction {
  id: number;
  name: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: Category;
  transactionDate: string;
  description: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface HighestCategoryInfo {
  categoryName: string;
  amount: number;
}

export interface CategoryExpenseSummary {
  categoryName: string;
  amount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalTransactionCount: number;
  incomeTransactionCount: number;
  expenseTransactionCount: number;
  highestExpenseCategory: HighestCategoryInfo;
  highestIncomeCategory: HighestCategoryInfo;
  categoryWiseExpenses: CategoryExpenseSummary[];
  monthlySummary: MonthlyTrend[];
  recentTransactions: Transaction[];
}

export interface PaginatedTransactions {
  content: Transaction[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  sortBy: string;
  sortDirection: string;
}
