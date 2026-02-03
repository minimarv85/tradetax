// app-tabs/ExpensesScreen.tsx
// Add Expense Screen

import { useState } from 'react';
import { View, ScrollView, Keyboard } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  Snackbar,
} from 'react-native-paper';
import { saveTransaction } from '../app-lib/storage';
import { formatCurrency } from '../app-lib/tax';
import { EXPENSE_CATEGORIES } from '../app-types';

export default function ExpensesScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleSave = async () => {
    const amountValue = parseFloat(amount);
    
    if (!amountValue || amountValue <= 0) {
      return;
    }

    await saveTransaction({
      type: 'expense',
      amount: amountValue,
      category: selectedCategory,
      description: description || undefined,
      date: new Date().toISOString().split('T')[0],
    });

    // Reset form
    setAmount('');
    setDescription('');
    setSelectedCategory(EXPENSE_CATEGORIES[0].id);
    setShowSnackbar(true);
    Keyboard.dismiss();
  };

  const amountValue = parseFloat(amount) || 0;
  const category = EXPENSE_CATEGORIES.find(c => c.id === selectedCategory);
  const isDeductible = category?.isDeductible;

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: '#F5F5F5' }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Amount Input */}
      <Surface style={{ padding: 20, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="bodyMedium" style={{ marginBottom: 8, color: '#666' }}>
          Amount Spent
        </Text>
        <TextInput
          mode="outlined"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={{ backgroundColor: '#FFF' }}
          left={<TextInput.Affix text="£" />}
        />
      </Surface>

      {/* Category Selection */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
          Category
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              mode={selectedCategory === cat.id ? 'contained' : 'outlined'}
              onPress={() => setSelectedCategory(cat.id)}
              icon={cat.icon}
              style={{ flex: 1, minWidth: '45%' }}
            >
              {cat.name}
            </Button>
          ))}
        </View>
      </Surface>

      {/* Tax Deductible Badge */}
      {amountValue > 0 && (
        <Surface
          style={{
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            backgroundColor: isDeductible ? '#E8F5E9' : '#FFF3E0',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 24 }}>
            {isDeductible ? '✓' : '⚠'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
              {isDeductible ? 'Tax Deductible' : 'May Not Be Deductible'}
            </Text>
            <Text variant="bodySmall" style={{ color: '#666' }}>
              {isDeductible
                ? `This ${formatCurrency(amountValue)} reduces your taxable profit`
                : 'Check with your accountant if this is deductible'}
            </Text>
          </View>
        </Surface>
      )}

      {/* Description (Optional) */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="bodyMedium" style={{ marginBottom: 8, color: '#666' }}>
          Description (optional)
        </Text>
        <TextInput
          mode="outlined"
          placeholder="What was this for?"
          value={description}
          onChangeText={setDescription}
          style={{ backgroundColor: '#FFF' }}
        />
      </Surface>

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleSave}
        disabled={!amountValue}
        style={{ marginTop: 8, paddingVertical: 8, backgroundColor: '#B00020' }}
        icon="check"
      >
        Save Expense
      </Button>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
      >
        Expense saved successfully!
      </Snackbar>
    </ScrollView>
  );
}
