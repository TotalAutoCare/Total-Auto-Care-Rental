
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum RecurrenceType {
  NONE = 'NONE',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum Currency {
  AUD = 'AUD',
  USD = 'USD',
  BDT = 'BDT'
}

export const CurrencyMeta = {
  [Currency.AUD]: { symbol: '$', rate: 1.54, label: 'Australian Dollar' },
  [Currency.USD]: { symbol: '$', rate: 1, label: 'US Dollar' },
  [Currency.BDT]: { symbol: '৳', rate: 109.8, label: 'Bangladeshi Taka' },
};

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number; // Always stored in USD (base)
  recurrence?: RecurrenceType;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}
