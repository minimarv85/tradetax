// app-lib/supabase.ts
// Supabase client configuration
// Note: Replace these with your actual Supabase credentials

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database functions
export async function createTransaction(transaction: {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
}) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select();
  
  if (error) throw error;
  return data;
}

export async function getTransactions(filters?: {
  type?: string;
  startDate?: string;
  endDate?: string;
}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function updateTransaction(id: string, updates: {
  amount?: number;
  category?: string;
  description?: string;
}) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
}
