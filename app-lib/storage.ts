// app-lib/storage.ts
// Local storage utilities using AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TaxSettings, DEFAULT_TAX_SETTINGS } from '../app-types';

const TRANSACTIONS_KEY = '@transactions';
const TAX_SETTINGS_KEY = '@tax_settings';

export async function saveTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  const transactions = await getTransactions();
  
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };
  
  const updatedTransactions = [newTransaction, ...transactions];
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
  
  return newTransaction;
}

export async function getTransactions(): Promise<Transaction[]> {
  const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function deleteTransaction(id: string): Promise<void> {
  const transactions = await getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
  const transactions = await getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  
  if (index === -1) return null;
  
  const updated = { ...transactions[index], ...updates };
  transactions[index] = updated;
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  
  return updated;
}

export async function getTaxSettings(): Promise<TaxSettings> {
  const data = await AsyncStorage.getItem(TAX_SETTINGS_KEY);
  return data ? JSON.parse(data) : DEFAULT_TAX_SETTINGS;
}

export async function saveTaxSettings(settings: TaxSettings): Promise<void> {
  await AsyncStorage.setItem(TAX_SETTINGS_KEY, JSON.stringify(settings));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(TRANSACTIONS_KEY);
  await AsyncStorage.removeItem(TAX_SETTINGS_KEY);
}

export async function exportToCSV(): Promise<string> {
  const transactions = await getTransactions();
  
  const header = 'Date,Type,Category,Description,Amount\n';
  const rows = transactions.map((t) =>
    `${t.date},${t.type},${t.category},${t.description || ''},${t.amount}`
  );
  
  return header + rows.join('\n');
}
