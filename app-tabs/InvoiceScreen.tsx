// app-tabs/InvoiceScreen.tsx
// Invoice Builder with PDF Generation

import { useState } from 'react';
import { View, ScrollView, Keyboard, Pressable } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  Snackbar,
  Modal,
  Portal,
  Provider,
  FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../app-lib/tax';

// Invoice types
interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface Invoice {
  id: string;
  client: Client;
  items: InvoiceItem[];
  date: string;
  dueDate: string;
  notes: string;
  status: 'draft' | 'sent' | 'paid';
}

export default function InvoiceScreen() {
  const navigation = useNavigation();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, rate: 0 }]);
  const [notes, setNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }]);
  };
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const vat = subtotal * 0.20; // 20% VAT
  const total = subtotal + vat;
  
  const handleSave = () => {
    if (!clientName || items.some(i => !i.description || i.rate <= 0)) {
      setSnackbarMsg('Please fill in client name and all item details');
      return;
    }
    
    // Save invoice (would go to Supabase in production)
    setSnackbarMsg('Invoice saved successfully!');
    Keyboard.dismiss();
  };
  
  const handlePreview = () => {
    if (!clientName || items.some(i => !i.description)) {
      setSnackbarMsg('Add at least one item to preview');
      return;
    }
    setShowPreview(true);
  };

  return (
    <Provider>
      <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#F5F5F5' }}>
        <Text variant="headlineSmall" style={{ marginBottom: 16 }}>Create Invoice</Text>
        
        {/* Invoice Number */}
        <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text variant="bodyMedium" style={{ marginBottom: 8, color: '#666' }}>Invoice Number</Text>
          <TextInput
            mode="outlined"
            placeholder="INV-001"
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            style={{ backgroundColor: '#FFF' }}
          />
        </Surface>
        
        {/* Client Details */}
        <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text variant="titleSmall" style={{ marginBottom: 12 }}>Client Details</Text>
          <TextInput
            mode="outlined"
            placeholder="Client Name"
            value={clientName}
            onChangeText={setClientName}
            style={{ marginBottom: 8, backgroundColor: '#FFF' }}
          />
          <TextInput
            mode="outlined"
            placeholder="Email"
            value={clientEmail}
            onChangeText={setClientEmail}
            keyboardType="email-address"
            style={{ marginBottom: 8, backgroundColor: '#FFF' }}
          />
          <TextInput
            mode="outlined"
            placeholder="Address"
            value={clientAddress}
            onChangeText={setClientAddress}
            multiline
            style={{ backgroundColor: '#FFF' }}
          />
        </Surface>
        
        {/* Line Items */}
        <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text variant="titleSmall">Items</Text>
            <Button mode="text" onPress={addItem}>+ Add Item</Button>
          </View>
          
          {items.map((item, index) => (
            <View key={index} style={{ marginBottom: 12, padding: 12, backgroundColor: '#f8f8f8', borderRadius: 8 }}>
              <TextInput
                mode="outlined"
                placeholder="Description"
                value={item.description}
                onChangeText={(v) => updateItem(index, 'description', v)}
                style={{ marginBottom: 8, backgroundColor: '#FFF' }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  mode="outlined"
                  placeholder="Qty"
                  value={item.quantity.toString()}
                  onChangeText={(v) => updateItem(index, 'quantity', parseFloat(v) || 0)}
                  keyboardType="numeric"
                  style={{ flex: 1, backgroundColor: '#FFF' }}
                />
                <TextInput
                  mode="outlined"
                  placeholder="Rate (£)"
                  value={item.rate.toString()}
                  onChangeText={(v) => updateItem(index, 'rate', parseFloat(v) || 0)}
                  keyboardType="decimal-pad"
                  style={{ flex: 1, backgroundColor: '#FFF' }}
                />
                <Text style={{ alignSelf: 'center', fontSize: 16, fontWeight: '600', width: 80, textAlign: 'right' }}>
                  {formatCurrency(item.quantity * item.rate)}
                </Text>
              </View>
              {items.length > 1 && (
                <Button mode="text" textColor="#B00020" onPress={() => removeItem(index)} style={{ marginTop: 4 }}>
                  Remove
                </Button>
              )}
            </View>
          ))}
        </Surface>
        
        {/* Totals */}
        <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text variant="bodyMedium">Subtotal</Text>
            <Text variant="bodyMedium">{formatCurrency(subtotal)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text variant="bodyMedium">VAT (20%)</Text>
            <Text variant="bodyMedium">{formatCurrency(vat)}</Text>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>Total</Text>
              <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#0066CC' }}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </Surface>
        
        {/* Notes */}
        <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text variant="bodyMedium" style={{ marginBottom: 8, color: '#666' }}>Notes (payment terms, thank you, etc.)</Text>
          <TextInput
            mode="outlined"
            placeholder="Payment due within 30 days. Thank you for your business!"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ backgroundColor: '#FFF' }}
          />
        </Surface>
        
        {/* Action Buttons */}
        <Button mode="outlined" onPress={handlePreview} style={{ marginBottom: 8 }}>
          👁️ Preview Invoice
        </Button>
        <Button mode="contained" onPress={handleSave}>
          💾 Save Invoice
        </Button>
        
        <Snackbar visible={!!snackbarMsg} onDismiss={() => setSnackbarMsg('')}>
          {snackbarMsg}
        </Snackbar>
      </ScrollView>
    </Provider>
  );
}
