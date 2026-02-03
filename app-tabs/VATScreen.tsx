// app-tabs/VATScreen.tsx
// VAT Calculator for UK Businesses

import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  SegmentedButtons,
} from 'react-native-paper';
import { formatCurrency } from '../app-lib/tax';

export default function VATScreen() {
  const [vatType, setVatType] = useState<'standard' | 'flatrate'>('standard');
  const [turnover, setTurnover] = useState('');
  const [purchases, setPurchases] = useState('');
  const [flatRatePercent, setFlatRatePercent] = useState('12'); // Default flat rate
  
  const turnoverValue = parseFloat(turnover) || 0;
  const purchasesValue = parseFloat(purchases) || 0;
  const flatRateValue = parseFloat(flatRatePercent) || 12;
  
  // Standard VAT Scheme (20%)
  const standardOutputVAT = turnoverValue * 0.20;
  const standardInputVAT = purchasesValue * 0.20;
  const standardNetVAT = standardOutputVAT - standardInputVAT;
  
  // Flat Rate Scheme
  const flatRateVAT = turnoverValue * (flatRateValue / 100);
  const flatRateInputVAT = purchasesValue * 0.20; // Can reclaim VAT on capital goods over £2
  const flatRateNetVAT = flatRateVAT - flatRateInputVAT;
  const flatRateSavings = standardNetVAT - flatRateNetVAT;
  
  const isVatRegistered = turnoverValue >= 85000;

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#F5F5F5' }}>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>VAT Calculator</Text>
      <Text variant="bodyMedium" style={{ color: '#666', marginBottom: 24 }}>
        Calculate your VAT liability under different schemes
      </Text>
      
      {/* Registration Check */}
      <Surface style={{ 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 16,
        backgroundColor: isVatRegistered ? '#FFF3E0' : '#E8F5E9'
      }}>
        <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
          {isVatRegistered 
            ? '⚠️ You exceed the VAT threshold (£85,000)' 
            : '✓ Below VAT registration threshold'}
        </Text>
        <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
          {isVatRegistered 
            ? 'Registration is mandatory when turnover exceeds £85,000' 
            ? 'Registration is voluntary until you reach the threshold'}
        </Text>
      </Surface>
      
      {/* Input Section */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="titleSmall" style={{ marginBottom: 16 }}>Your Figures</Text>
        
        <TextInput
          mode="outlined"
          label="Taxable Turnover (VAT inclusive)"
          value={turnover}
          onChangeText={setTurnover}
          keyboardType="decimal-pad"
          placeholder="0.00"
          left={<TextInput.Affix text="£" />}
          style={{ marginBottom: 12, backgroundColor: '#FFF' }}
        />
        
        <TextInput
          mode="outlined"
          label="VAT on Purchases"
          value={purchases}
          onChangeText={setPurchases}
          keyboardType="decimal-pad"
          placeholder="0.00"
          left={<TextInput.Affix text="£" />}
          style={{ backgroundColor: '#FFF' }}
        />
      </Surface>
      
      {/* Standard Rate Scheme */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="titleSmall" style={{ marginBottom: 12 }}>Standard Rate Scheme (20%)</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="bodyMedium">Output VAT (Sales)</Text>
          <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{formatCurrency(standardOutputVAT)}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="bodyMedium">Input VAT (Purchases)</Text>
          <Text variant="bodyMedium" style={{ color: '#00A651' }}>-{formatCurrency(standardInputVAT)}</Text>
        </View>
        
        <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>Net VAT Due</Text>
            <Text variant="titleLarge" style={{ 
              fontWeight: 'bold', 
              color: standardNetVAT > 0 ? '#B00020' : '#00A651' 
            }}>
              {standardNetVAT > 0 ? formatCurrency(standardNetVAT) : `Refund: ${formatCurrency(Math.abs(standardNetVAT))}`}
            </Text>
          </View>
        </View>
      </Surface>
      
      {/* Flat Rate Scheme */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="titleSmall" style={{ marginBottom: 12 }}>Flat Rate Scheme</Text>
        
        <TextInput
          mode="outlined"
          label="Flat Rate % (varies by sector)"
          value={flatRatePercent}
          onChangeText={setFlatRatePercent}
          keyboardType="numeric"
          style={{ marginBottom: 12, backgroundColor: '#FFF' }}
        />
        <Text variant="bodySmall" style={{ color: '#666', marginBottom: 12 }}>
          Common rates: 12% (consulting), 14.5% (IT), 10% (construction)
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="bodyMedium">VAT Due (Flat Rate)</Text>
          <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{formatCurrency(flatRateVAT)}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="bodyMedium">VAT on Capital Goods</Text>
          <Text variant="bodyMedium" style={{ color: '#00A651' }}>-{formatCurrency(flatRateInputVAT)}</Text>
        </View>
        
        <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>Net VAT Due</Text>
            <Text variant="titleLarge" style={{ 
              fontWeight: 'bold', 
              color: flatRateNetVAT > 0 ? '#B00020' : '#00A651' 
            }}>
              {flatRateNetVAT > 0 ? formatCurrency(flatRateNetVAT) : `Refund: ${formatCurrency(Math.abs(flatRateNetVAT))}`}
            </Text>
          </View>
        </View>
      </Surface>
      
      {/* Comparison */}
      {standardNetVAT !== flatRateNetVAT && (
        <Surface style={{ 
          padding: 16, 
          borderRadius: 12, 
          marginBottom: 24,
          borderLeftWidth: 4,
          borderLeftColor: flatRateSavings > 0 ? '#00A651' : '#B00020'
        }}>
          <Text variant="titleSmall" style={{ marginBottom: 8 }}>
            {flatRateSavings > 0 ? '💰 Flat Rate Saves You' : '⚠️ Standard Rate Saves You'}
          </Text>
          <Text variant="headlineSmall" style={{ 
            color: flatRateSavings > 0 ? '#00A651' : '#B00020',
            fontWeight: 'bold'
          }}>
            {formatCurrency(Math.abs(flatRateSavings))} per VAT period
          </Text>
          <Text variant="bodySmall" style={{ color: '#666', marginTop: 8 }}>
            {flatRateSavings > 0 
              ? 'You keep the difference as a cash flow benefit!'
              : 'Standard rate may be better for your business.'}
          </Text>
        </Surface>
      )}
      
      {/* VAT Return Dates */}
      <Surface style={{ padding: 16, borderRadius: 12 }}>
        <Text variant="titleSmall" style={{ marginBottom: 12 }}>Upcoming VAT Return Dates</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          <View>
            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>31 March 2026</Text>
            <Text variant="bodySmall" style={{ color: '#666' }}>Quarter 4 2025 return due</Text>
          </View>
          <Text variant="bodyMedium" style={{ color: '#B00020', fontWeight: '500' }}>Due Soon</Text>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }}>
          <View>
            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>7 May 2026</Text>
            <Text variant="bodySmall" style={{ color: '#666' }}>Payment on Account</Text>
          </View>
          <Text variant="bodyMedium" style={{ color: '#666' }}>~{formatCurrency(standardNetVAT / 2)}</Text>
        </View>
      </Surface>
    </ScrollView>
  );
}
