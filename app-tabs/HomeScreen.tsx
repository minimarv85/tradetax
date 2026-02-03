// app-tabs/HomeScreen.tsx
// Home Dashboard Screen

import { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Button,
  Surface,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { formatCurrency, getTaxSummary, getTransactions } from '../app-lib/storage';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../app-types';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    estimatedTax: 0,
    setAsidePerMonth: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const txs = await getTransactions();
    setTransactions(txs);
    setSummary(getTaxSummary(txs));
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#F5F5F5' }}>
      {/* Tax Summary Card */}
      <Card style={{ marginBottom: 16, elevation: 2 }}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            Tax Summary 2026
          </Text>
          
          {/* Set Aside Amount - Main Display */}
          <Surface
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: '#E3F2FD',
              marginBottom: 16,
            }}
          >
            <Text variant="bodySmall" style={{ color: '#666', marginBottom: 4 }}>
              Set aside for tax
            </Text>
            <Text variant="headlineLarge" style={{ color: '#0066CC', fontWeight: 'bold' }}>
              {formatCurrency(summary.estimatedTax)}
            </Text>
            <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
              {formatCurrency(summary.setAsidePerMonth)}/month remaining
            </Text>
          </Surface>

          {/* Financial Overview */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text variant="bodyMedium">Income</Text>
            <Text variant="bodyMedium" style={{ color: '#00A651', fontWeight: '600' }}>
              {formatCurrency(summary.totalIncome)}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text variant="bodyMedium">Expenses</Text>
            <Text variant="bodyMedium" style={{ color: '#B00020', fontWeight: '600' }}>
              {formatCurrency(summary.totalExpenses)}
            </Text>
          </View>
          
          <Divider style={{ marginVertical: 8 }} />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>Net Profit</Text>
            <Text variant="titleMedium" style={{ fontWeight: '600', color: summary.netProfit >= 0 ? '#00A651' : '#B00020' }}>
              {formatCurrency(summary.netProfit)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: '#666' }}>
        Quick Actions
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <Button
          mode="contained"
          icon="arrow-down"
          onPress={() => navigation.navigate('Income')}
          style={{ flex: 1 }}
        >
          Income
        </Button>
        <Button
          mode="contained"
          icon="arrow-up"
          onPress={() => navigation.navigate('Expenses')}
          style={{ flex: 1, backgroundColor: '#B00020' }}
        >
          Expense
        </Button>
      </View>

      {/* Recent Transactions */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: '#666' }}>
        Recent Transactions
      </Text>
      
      {recentTransactions.length === 0 ? (
        <Card style={{ padding: 24 }}>
          <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666' }}>
            No transactions yet.{'\n'}
            Tap Income or Expense to add your first one.
          </Text>
        </Card>
      ) : (
        recentTransactions.map((tx, index) => {
          const category = tx.type === 'income' 
            ? INCOME_CATEGORIES.find(c => c.id === tx.category)
            : EXPENSE_CATEGORIES.find(c => c.id === tx.category);
            
          return (
            <Card key={tx.id || index} style={{ marginBottom: 8 }}>
              <Card.Content style={{ paddingVertical: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: tx.type === 'income' ? '#E8F5E9' : '#FFEBEE',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <MaterialCommunityIcons
                        name={category?.icon || 'help-circle'}
                        size={20}
                        color={tx.type === 'income' ? '#00A651' : '#B00020'}
                      />
                    </View>
                    <View>
                      <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                        {category?.name || tx.category}
                      </Text>
                      <Text variant="bodySmall" style={{ color: '#666' }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text
                    variant="titleMedium"
                    style={{
                      fontWeight: '600',
                      color: tx.type === 'income' ? '#00A651' : '#B00020',
                    }}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}

      {/* Export Button */}
      <Button
        mode="outlined"
        icon="download"
        style={{ marginTop: 16, marginBottom: 32 }}
      >
        Export for Accountant
      </Button>
    </ScrollView>
  );
}
