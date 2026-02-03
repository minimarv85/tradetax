// app-tabs/IncomeScreen.tsx
// Add Income Screen

import { useState } from 'react';
import { View, ScrollView, Keyboard } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Dropdown,
  Surface,
  Snackbar,
} from 'react-native-paper';
import { saveTransaction } from '../app-lib/storage';
import { formatCurrency, calculateTaxLiability } from '../app-lib/tax';
import { INCOME_CATEGORIES } from '../app-types';
import { useTheme } from 'react-native-paper';

export default function IncomeScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(INCOME_CATEGORIES[0].id);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const theme = useTheme();

  const handleSave = async () => {
    const amountValue = parseFloat(amount);
    
    if (!amountValue || amountValue <= 0) {
      return;
    }

    await saveTransaction({
      type: 'income',
      amount: amountValue,
      category: selectedCategory,
      description: description || undefined,
      date: new Date().toISOString().split('T')[0],
    });

    // Reset form
    setAmount('');
    setDescription('');
    setShowSnackbar(true);
    Keyboard.dismiss();
  };

  const amountValue = parseFloat(amount) || 0;
  const taxPreview = calculateTaxLiability(amountValue);

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, backgroundColor: '#F5F5F5' }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Amount Input */}
      <Surface style={{ padding: 20, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="bodyMedium" style={{ marginBottom: 8, color: '#666' }}>
          Amount Received
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
        <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
          Category
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {INCOME_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              mode={selectedCategory === category.id ? 'contained' : 'outlined'}
              onPress={() => setSelectedCategory(category.id)}
              icon={category.icon}
              style={{ flex: 1, minWidth: '45%' }}
            >
              {category.name}
            </Button>
          ))}
        </View>
      </Surface>

      {/* Description (Optional) */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="bodyMedium" style={{ marginBottom: 8, color: '#666' }}>
          Description (optional)
        </Text>
        <TextInput
          mode="outlined"
          placeholder="Client name, project, etc."
          value={description}
          onChangeText={setDescription}
          style={{ backgroundColor: '#FFF' }}
        />
      </Surface>

      {/* Tax Preview */}
      {amountValue > 0 && (
        <Surface
          style={{
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
          }}
        >
          <Text variant="titleSmall" style={{ marginBottom: 8 }}>
            Tax Preview
          </Text>
          <Text variant="bodySmall" style={{ color: '#666', marginBottom: 4 }}>
            If this is your only income, set aside:
          </Text>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            {formatCurrency(taxPreview.setAsideAmount)}
          </Text>
          <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
            Based on {formatCurrency(amountValue)} at current tax rates
          </Text>
        </Surface>
      )}

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleSave}
        disabled={!amountValue}
        style={{ marginTop: 8, paddingVertical: 8 }}
        icon="check"
      >
        Save Income
      </Button>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
      >
        Income saved successfully!
      </Snackbar>
    </ScrollView>
  );
}
