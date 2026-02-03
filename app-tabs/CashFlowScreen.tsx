// app-tabs/CashFlowScreen.tsx
// Cash Flow Forecast & Projections

import { useState, useEffect, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Surface,
  ProgressBar,
} from 'react-native-paper';
import { formatCurrency } from '../app-lib/tax';
import { getTransactions } from '../app-lib/storage';
import { Transaction } from '../app-types';

interface RecurringItem {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  startDate: string;
}

export default function CashFlowScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurring, setRecurring] = useState<RecurringItem[]>([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const txs = await getTransactions();
    setTransactions(txs);
    // Load recurring items
    const rec = await import('@react-native-async-storage/async-storage').then(mod => 
      mod.default.getItem('recurring_items').then(d => d ? JSON.parse(d) : [])
    );
    setRecurring(rec);
  };
  
  // Calculate monthly averages from historical data
  const monthlyAverages = useMemo(() => {
    const incomeByMonth: { [key: string]: number } = {};
    const expenseByMonth: { [key: string]: number } = {};
    
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (t.type === 'income') {
        incomeByMonth[month] = (incomeByMonth[month] || 0) + t.amount;
      } else {
        expenseByMonth[month] = (expenseByMonth[month] || 0) + t.amount;
      }
    });
    
    const months = Object.keys(incomeByMonth).length || 1;
    const avgIncome = Object.values(incomeByMonth).reduce((a, b) => a + b, 0) / months;
    const avgExpense = Object.values(expenseByMonth).reduce((a, b) => a + b, 0) / months;
    
    return { income: avgIncome, expense: avgExpense, months };
  }, [transactions]);
  
  // Project next 6 months
  const forecast = useMemo(() => {
    const months = [];
    const now = new Date();
    const recurringMonthly = recurring.filter(r => r.frequency === 'monthly');
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = monthDate.toISOString().substring(0, 7);
      
      const recurringIncome = recurringMonthly
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);
      
      const recurringExpense = recurringMonthly
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);
      
      // Project using historical average + recurring
      const projectedIncome = recurringIncome || monthlyAverages.income;
      const projectedExpense = recurringExpense || monthlyAverages.expense;
      
      months.push({
        month: monthDate.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        income: projectedIncome,
        expense: projectedExpense,
        net: projectedIncome - projectedExpense,
        isHistorical: i < 0,
      });
    }
    
    return months;
  }, [monthlyAverages, recurring]);
  
  // Year to date summary
  const ytd = useMemo(() => {
    const ytdDate = new Date().toISOString().split('T')[0].substring(0, 4) + '-01-01';
    const ytdTransactions = transactions.filter(t => t.date >= ytdDate);
    
    const ytdIncome = ytdTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const ytdExpense = ytdTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    return { income: ytdIncome, expense: ytdExpense, net: ytdIncome - ytdExpense };
  }, [transactions]);
  
  // End of year projection
  const eoyProjection = useMemo(() => {
    const monthsRemaining = 12 - new Date().getMonth();
    const avgMonthlyNet = (monthlyAverages.income - monthlyAverages.expense);
    
    return {
      projectedIncome: monthlyAverages.income * 12,
      projectedExpense: monthlyAverages.expense * 12,
      projectedNet: avgMonthlyNet * 12,
      monthsRemaining,
    };
  }, [monthlyAverages]);
  
  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#F5F5F5' }}>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>Cash Flow Forecast</Text>
      <Text variant="bodyMedium" style={{ color: '#666', marginBottom: 24 }}>
        Project your finances for the next 6 months
      </Text>
      
      {/* Year to Date */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="titleSmall" style={{ marginBottom: 12 }}>Year to Date ({new Date().getFullYear()})</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="bodyMedium">Income</Text>
          <Text variant="bodyMedium" style={{ color: '#00A651', fontWeight: '500' }}>
            {formatCurrency(ytd.income)}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="bodyMedium">Expenses</Text>
          <Text variant="bodyMedium" style={{ color: '#B00020', fontWeight: '500' }}>
            -{formatCurrency(ytd.expense)}
          </Text>
        </View>
        
        <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>Net Profit YTD</Text>
            <Text variant="titleLarge" style={{ 
              fontWeight: 'bold',
              color: ytd.net >= 0 ? '#00A651' : '#B00020' 
            }}>
              {ytd.net >= 0 ? '' : '-'}{formatCurrency(Math.abs(ytd.net))}
            </Text>
          </View>
        </View>
      </Surface>
      
      {/* 6 Month Forecast */}
      <Text variant="titleSmall" style={{ marginBottom: 12, color: '#666' }}>6 Month Forecast</Text>
      
      {forecast.map((month, index) => (
        <Surface key={index} style={{ 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 8,
          borderLeftWidth: 4,
          borderLeftColor: month.net >= 0 ? '#00A651' : '#B00020'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{month.month}</Text>
            <Text variant="titleMedium" style={{ 
              fontWeight: 'bold',
              color: month.net >= 0 ? '#00A651' : '#B00020' 
            }}>
              {month.net >= 0 ? '+' : ''}{formatCurrency(month.net)}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <ProgressBar 
                progress={month.income > 0 ? Math.min(month.net / month.income, 1) : 0} 
                color="#00A651"
              />
              <Text variant="bodySmall" style={{ color: '#00A651' }}>
                Income: {formatCurrency(month.income)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <ProgressBar 
                progress={month.expense > 0 ? Math.min(month.net / month.expense, 1) : 0} 
                color="#B00020"
              />
              <Text variant="bodySmall" style={{ color: '#B00020' }}>
                Expenses: {formatCurrency(month.expense)}
              </Text>
            </View>
          </View>
        </Surface>
      ))}
      
      {/* End of Year Projection */}
      <Surface style={{ 
        padding: 16, 
        borderRadius: 12, 
        marginTop: 16,
        backgroundColor: '#E3F2FD'
      }}>
        <Text variant="titleSmall" style={{ marginBottom: 12 }}>End of Year Projection</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="bodyMedium">Projected Annual Income</Text>
          <Text variant="bodyMedium" style={{ color: '#00A651', fontWeight: '500' }}>
            {formatCurrency(eoyProjection.projectedIncome)}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="bodyMedium">Projected Annual Expenses</Text>
          <Text variant="bodyMedium" style={{ color: '#B00020', fontWeight: '500' }}>
            -{formatCurrency(eoyProjection.projectedExpense)}
          </Text>
        </View>
        
        <View style={{ borderTopWidth: 1, borderTopColor: '#0066CC', paddingTop: 12, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>Projected Annual Profit</Text>
            <Text variant="headlineSmall" style={{ 
              fontWeight: 'bold',
              color: eoyProjection.projectedNet >= 0 ? '#00A651' : '#B00020' 
            }}>
              {eoyProjection.projectedNet >= 0 ? '' : '-'}{formatCurrency(Math.abs(eoyProjection.projectedNet))}
            </Text>
          </View>
        </View>
      </Surface>
      
      {/* Insights */}
      {monthlyAverages.income > 0 && (
        <Surface style={{ padding: 16, borderRadius: 12, marginTop: 16 }}>
          <Text variant="titleSmall" style={{ marginBottom: 12 }}>💡 Insights</Text>
          
          {monthlyAverages.income - monthlyAverages.expense < 0 ? (
            <Text variant="bodyMedium" style={{ color: '#666' }}>
              You're spending more than you earn. Consider reducing expenses or increasing income sources.
            </Text>
          ) : monthlyAverages.expense / monthlyAverages.income > 0.8 ? (
            <Text variant="bodyMedium" style={{ color: '#666' }}>
              Your expenses are 80% of income. Building a cash reserve might be challenging.
            </Text>
          ) : (
            <Text variant="bodyMedium" style={{ color: '#666' }}>
              You're maintaining a healthy profit margin. Consider investing surplus funds.
            </Text>
          )}
        </Surface>
      )}
    </ScrollView>
  );
}
