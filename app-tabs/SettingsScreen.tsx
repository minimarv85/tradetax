// app-tabs/SettingsScreen.tsx
// Settings Screen

import { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Surface,
  Switch,
  Divider,
  TextInput,
} from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import {
  getTaxSettings,
  saveTaxSettings,
  clearAllData,
  exportToCSV,
} from '../app-lib/storage';
import { DEFAULT_TAX_SETTINGS } from '../app-types';

export default function SettingsScreen() {
  const [taxSettings, setTaxSettings] = useState(DEFAULT_TAX_SETTINGS);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getTaxSettings();
    setTaxSettings(settings);
  };

  const handleExportCSV = async () => {
    const csv = await exportToCSV();
    const uri = FileSystem.documentDirectory + 'tradetax_export.csv';
    await FileSystem.writeAsStringAsync(uri, csv);
    await shareAsync(uri, { UTI: '.csv', mimeType: 'text/csv' });
  };

  const handleResetData = async () => {
    await clearAllData();
    await saveTaxSettings(DEFAULT_TAX_SETTINGS);
    setTaxSettings(DEFAULT_TAX_SETTINGS);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#F5F5F5' }}>
      {/* Data Management */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: '#666' }}>
        Data
      </Text>
      
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 24 }}>
        <Button
          mode="outlined"
          icon="download"
          onPress={handleExportCSV}
          style={{ marginBottom: 12 }}
        >
          Export to CSV
        </Button>
        <Text variant="bodySmall" style={{ color: '#666', marginBottom: 12 }}>
          Download your transactions for your accountant
        </Text>
        
        <Divider style={{ marginVertical: 12 }} />
        
        <Button
          mode="outlined"
          icon="delete"
          onPress={handleResetData}
          textColor="#B00020"
        >
          Clear All Data
        </Button>
        <Text variant="bodySmall" style={{ color: '#666', marginTop: 8 }}>
          Delete all transactions (cannot be undone)
        </Text>
      </Surface>

      {/* Tax Settings */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: '#666' }}>
        Tax Settings
      </Text>
      
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 24 }}>
        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
          Tax thresholds (2026-27)
        </Text>
        
        <TextInput
          mode="outlined"
          label="Personal Allowance"
          value={taxSettings.personalAllowance.toString()}
          onChangeText={(v) =>
            setTaxSettings({ ...taxSettings, personalAllowance: parseFloat(v) || 0 })
          }
          keyboardType="number-pad"
          style={{ marginBottom: 12, backgroundColor: '#FFF' }}
        />
        
        <TextInput
          mode="outlined"
          label="Basic Rate Threshold"
          value={taxSettings.basicThreshold.toString()}
          onChangeText={(v) =>
            setTaxSettings({ ...taxSettings, basicThreshold: parseFloat(v) || 0 })
          }
          keyboardType="number-pad"
          style={{ marginBottom: 12, backgroundColor: '#FFF' }}
        />
        
        <TextInput
          mode="outlined"
          label="Higher Rate Threshold"
          value={taxSettings.higherThreshold.toString()}
          onChangeText={(v) =>
            setTaxSettings({ ...taxSettings, higherThreshold: parseFloat(v) || 0 })
          }
          keyboardType="number-pad"
          style={{ marginBottom: 12, backgroundColor: '#FFF' }}
        />
        
        <Button
          mode="contained"
          onPress={() => saveTaxSettings(taxSettings)}
          style={{ marginTop: 8 }}
        >
          Save Tax Settings
        </Button>
      </Surface>

      {/* Notifications */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: '#666' }}>
        Notifications
      </Text>
      
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="bodyMedium">Tax Reminders</Text>
            <Text variant="bodySmall" style={{ color: '#666' }}>
              Get notified before tax deadlines
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>
      </Surface>

      {/* About */}
      <Text variant="titleSmall" style={{ marginBottom: 8, color: '#666' }}>
        About
      </Text>
      
      <Surface style={{ padding: 16, borderRadius: 12 }}>
        <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
          TradeTax
        </Text>
        <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
          Version 1.0.0
        </Text>
        <Text variant="bodySmall" style={{ color: '#666', marginTop: 8 }}>
          Built with React Native + Expo{'\n'}
          Data stored locally on your device{'\n'}
          No subscription, no cloud sync, private by default
        </Text>
      </Surface>
    </ScrollView>
  );
}
