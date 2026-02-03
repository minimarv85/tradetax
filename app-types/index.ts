// app-types/index.ts
// Type definitions for TradeTax app

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  icon: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  isDeductible: boolean;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface TaxSettings {
  personalAllowance: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;
  basicThreshold: number;
  higherThreshold: number;
}

export const INCOME_CATEGORIES: IncomeCategory[] = [
  { id: 'client', name: 'Client Payment', icon: 'briefcase' },
  { id: 'sale', name: 'Sale', icon: 'cart' },
  { id: 'refund', name: 'Refund', icon: 'rotate-left' },
  { id: 'other', name: 'Other', icon: 'dots-horizontal' },
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'materials', name: 'Materials', icon: 'tools', isDeductible: true },
  { id: 'travel', name: 'Travel', icon: 'car', isDeductible: true },
  { id: 'equipment', name: 'Equipment', icon: 'hammer-wrench', isDeductible: true },
  { id: 'meals', name: 'Meals', icon: 'food', isDeductible: true },
  { id: 'office', name: 'Office', icon: 'desk', isDeductible: true },
  { id: 'utilities', name: 'Utilities', icon: 'lightning-bolt', isDeductible: true },
  { id: 'insurance', name: 'Insurance', icon: 'shield-check', isDeductible: true },
  { id: 'professional', name: 'Professional', icon: 'account-tie', isDeductible: true },
  { id: 'other', name: 'Other', icon: 'dots-horizontal', isDeductible: false },
];

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  personalAllowance: 12570,
  basicRate: 0.20,
  higherRate: 0.40,
  additionalRate: 0.45,
  basicThreshold: 50270,
  higherThreshold: 125140,
};
