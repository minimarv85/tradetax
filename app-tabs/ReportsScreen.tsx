// app-tabs/ReportsScreen.tsx
// Financial Reports & Analytics

import { useState, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Surface,
  SegmentedButtons,
  ProgressBar,
} from 'react-native-paper';
import { formatCurrency } from '../app-lib/tax';
import { getTransactions } from '../app-lib/storage';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../app-types';

export default function ReportsScreen({ navigation }: { navigation: any }) {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useMemo(() => {
    getTransactions().then(setTransactions);
  }, []);
  
  // Filter by period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, period]);
  
  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [filteredTransactions]);
  
  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: number } = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      });
    
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category: EXPENSE_CATEGORIES.find(c => c.id === category)?.name || category,
        amount,
        percentage: totals.expenses > 0 ? (amount / totals.expenses) * 100 : 0,
      }));
  }, [filteredTransactions, totals.expenses]);
  
  // Income sources
  const incomeSources = useMemo(() => {
    const sources: { [key: string]: number } = {};
    
    filteredTransactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        sources[t.category] = (sources[t.category] || 0) + t.amount;
      });
    
    return Object.entries(sources)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category: INCOME_CATEGORIES.find(c => c.id === category)?.name || category,
        amount,
        percentage: totals.income > 0 ? (amount / totals.income) * 100 : 0,
      }));
  }, [filteredTransactions, totals.income]);
  
  // Daily average
  const dailyAverage = useMemo(() => {
    const days = Math.max(1, filteredTransactions.length);
    return totals.income / days;
  }, [totals.income, filteredTransactions.length]);
  
  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#F5F5F5' }}>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>Reports & Analytics</Text>
      
      {/* Period Selector */}
      <SegmentedButtons
        value={period}
        onValueChange={setPeriod}
        buttons={[
          { value: 'month', label: 'This Month' },
          { value: 'quarter', label: 'This Quarter' },
          { value: 'year', label: 'This Year' },
        ]}
        style={{ marginBottom: 24 }}
      />
      
      {/* Summary Cards */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <Surface style={{ flex: 1, padding: 16, borderRadius: 12 }}>
          <Text variant="bodySmall" style={{ color: '#666' }}>Total Income</Text>
          <Text variant="titleLarge" style={{ color: '#00A651', fontWeight: 'bold' }}>
            {formatCurrency(totals.income)}
          </Text>
        </Surface>
        <Surface style={{ flex: 1, padding: 16, borderRadius: 12 }}>
          <Text variant="bodySmall" style={{ color: '#666' }}>Total Expenses</Text>
          <Text variant="titleLarge" style={{ color: '#B00020', fontWeight: 'bold' }}>
            {formatCurrency(totals.expenses)}
          </Text>
        </Surface>
      </View>
      
      {/* Net Profit */}
      <Surface style={{ 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 24,
        backgroundColor: totals.net >= 0 ? '#E8F5E9' : '#FFEBEE'
      }}>
        <Text variant="bodyMedium" style={{ marginBottom: 4 }}>Net Profit</Text>
        <Text variant="headlineMedium" style={{ 
          fontWeight: 'bold',
          color: totals.net >= 0 ? '#00A651' : '#B00020' 
        }}>
          {totals.net >= 0 ? '' : '-'}{formatCurrency(Math.abs(totals.net))}
        </Text>
        <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
          £{dailyAverage.toFixed(2)} daily average
        </Text>
      </Surface>
      
      {/* Income Sources */}
      {incomeSources.length > 0 && (
        <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text variant="titleSmall" style={{ marginBottom: 12 }}>Income Sources</Text>
          
          {incomeSources.map((source, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodyMedium">{source.category}</Text>
                <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                  {formatCurrency(source.amount)} ({source.percentage.toFixed(1)}%)
                </Text>
              </View>
              <ProgressBar 
                progress={source.percentage / 100} 
                color="#00A651"
                style={{ height: 8, borderRadius: 4 }}
              />
            </View>
          ))}
        </Surface>
      )}
      
      {/* Expense Breakdown */}
      {categoryBreakdown.length > 0 && (
        <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text variant="titleSmall" style={{ marginBottom: 12 }}>Expense Breakdown</Text>
          
          {categoryBreakdown.map((item, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="bodyMedium">{item.category}</Text>
                <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                  {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                </Text>
              </View>
              <ProgressBar 
                progress={item.percentage / 100} 
                color="#B00020"
                style={{ height: 8, borderRadius: 4 }}
              />
            </View>
          ))}
        </Surface>
      )}
      
      {/* Top Spending Areas */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 24 }}>
        <Text variant="titleSmall" style={{ marginBottom: 12 }}>Top Spending Areas</Text>
        
        {categoryBreakdown.slice(0, 3).map((item, index) => (
          <View 
            key={index}
            style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingVertical: 8,
              borderBottomWidth: index < 2 ? 1 : 0,
              borderBottomColor: '#eee'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 16, 
                backgroundColor: '#FFEBEE',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 16 }}>{index + 1}</Text>
              </View>
              <Text variant="bodyMedium">{item.category}</Text>
            </View>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}
      </Surface>
      
      {/* Export Options */}
      <Text variant="titleSmall" style={{ marginBottom: 12, color: '#666' }}>Export Report</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button mode="outlined" icon="file-pdf-box" style={{ flex: 1 }}>
          PDF
        </Button>
        <Button mode="outlined" icon="file-delimited" style={{ flex: 1 }}>
          CSV
        </Button>
        <Button mode="outlined" icon="email" style={{ flex: 1 }}>
          Email
        </Button>
      </View>
    </ScrollView>
  );
}
