// app-tabs/MileageScreen.tsx
// Mileage Tracker for Business Travel

import { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  SegmentedButtons,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MileageTrip {
  id: string;
  date: string;
  purpose: string;
  startLocation: string;
  endLocation: string;
  miles: number;
  rate: number;
  isBusiness: boolean;
}

const MILEAGE_RATES = {
  car: 0.45,  // 45p per mile first 10,000
  motorcycle: 0.24,
  bicycle: 0.20,
  van: 0.27,
};

export default function MileageScreen() {
  const [trips, setTrips] = useState<MileageTrip[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [miles, setMiles] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  
  useEffect(() => {
    loadTrips();
  }, []);
  
  const loadTrips = async () => {
    const data = await AsyncStorage.getItem('mileage_trips');
    if (data) {
      setTrips(JSON.parse(data));
    }
  };
  
  const saveTrips = async (newTrips: MileageTrip[]) => {
    await AsyncStorage.setItem('mileage_trips', JSON.stringify(newTrips));
    setTrips(newTrips);
  };
  
  const handleSave = async () => {
    const milesValue = parseFloat(miles);
    if (!milesValue || milesValue <= 0 || !purpose) return;
    
    const isBusiness = true; // Simplified for now
    
    const newTrip: MileageTrip = {
      id: Date.now().toString(),
      date,
      purpose,
      startLocation,
      endLocation,
      miles: milesValue,
      rate: MILEAGE_RATES[vehicleType as keyof typeof MILEAGE_RATES],
      isBusiness,
    };
    
    const newTrips = [newTrip, ...trips];
    saveTrips(newTrips);
    
    // Reset form
    setPurpose('');
    setStartLocation('');
    setEndLocation('');
    setMiles('');
  };
  
  const handleDelete = (id: string) => {
    const newTrips = trips.filter(t => t.id !== id);
    saveTrips(newTrips);
  };
  
  // Calculate totals
  const totalMiles = trips.reduce((sum, t) => sum + t.miles, 0);
  const totalBusinessMiles = trips.filter(t => t.isBusiness).reduce((sum, t) => sum + t.miles, 0);
  const totalDeduction = trips.filter(t => t.isBusiness).reduce((sum, t) => sum + (t.miles * t.rate), 0);
  
  // Group by month
  const tripsByMonth: { [key: string]: MileageTrip[] } = {};
  trips.forEach(trip => {
    const month = trip.date.substring(0, 7);
    if (!tripsByMonth[month]) tripsByMonth[month] = [];
    tripsByMonth[month].push(trip);
  });
  
  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#F5F5F5' }}>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>Mileage Tracker</Text>
      <Text variant="bodyMedium" style={{ color: '#666', marginBottom: 24 }}>
        Track business mileage and calculate tax deductions
      </Text>
      
      {/* Summary Card */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" style={{ color: '#666' }}>Total Miles</Text>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>{totalMiles.toFixed(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" style={{ color: '#666' }}>Tax Deduction</Text>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: '#00A651' }}>
              £{totalDeduction.toFixed(0)}
            </Text>
          </View>
        </View>
      </Surface>
      
      {/* Add Trip Form */}
      <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text variant="titleSmall" style={{ marginBottom: 12 }}>Log Trip</Text>
        
        <TextInput
          mode="outlined"
          label="Date"
          value={date}
          onChangeText={setDate}
          style={{ marginBottom: 12, backgroundColor: '#FFF' }}
        />
        
        <TextInput
          mode="outlined"
          label="Purpose (e.g., Client meeting, Site visit)"
          value={purpose}
          onChangeText={setPurpose}
          style={{ marginBottom: 12, backgroundColor: '#FFF' }}
        />
        
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <TextInput
            mode="outlined"
            label="From"
            value={startLocation}
            onChangeText={setStartLocation}
            style={{ flex: 1, backgroundColor: '#FFF' }}
          />
          <TextInput
            mode="outlined"
            label="To"
            value={endLocation}
            onChangeText={setEndLocation}
            style={{ flex: 1, backgroundColor: '#FFF' }}
          />
        </View>
        
        <TextInput
          mode="outlined"
          label="Miles"
          value={miles}
          onChangeText={setMiles}
          keyboardType="decimal-pad"
          style={{ marginBottom: 12, backgroundColor: '#FFF' }}
        />
        
        <Text variant="bodySmall" style={{ marginBottom: 8, color: '#666' }}>Vehicle Type</Text>
        <SegmentedButtons
          value={vehicleType}
          onValueChange={setVehicleType}
          buttons={[
            { value: 'car', label: 'Car (45p)' },
            { value: 'van', label: 'Van (27p)' },
            { value: 'motorcycle', label: 'Bike (24p)' },
          ]}
          style={{ marginBottom: 16 }}
        />
        
        <Button mode="contained" onPress={handleSave}>
          Add Trip
        </Button>
      </Surface>
      
      {/* Recent Trips */}
      <Text variant="titleSmall" style={{ marginBottom: 12, color: '#666' }}>Recent Trips</Text>
      
      {Object.entries(tripsByMonth).slice(0, 3).map(([month, monthTrips]) => (
        <View key={month} style={{ marginBottom: 16 }}>
          <Text variant="bodyMedium" style={{ fontWeight: '500', marginBottom: 8, color: '#0066CC' }}>
            {new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </Text>
          {monthTrips.slice(0, 5).map(trip => (
            <Surface key={trip.id} style={{ padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{trip.purpose}</Text>
                  <Text variant="bodySmall" style={{ color: '#666' }}>
                    {trip.date} • {trip.miles.toFixed(1)} miles
                  </Text>
                </View>
                <Text variant="bodyMedium" style={{ fontWeight: '600', color: '#00A651', marginRight: 12 }}>
                  £{(trip.miles * trip.rate).toFixed(2)}
                </Text>
                <Button mode="text" textColor="#B00020" onPress={() => handleDelete(trip.id)}>
                  ×
                </Button>
              </View>
            </Surface>
          ))}
        </View>
      ))}
      
      {trips.length === 0 && (
        <Surface style={{ padding: 24, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: '#666' }}>No trips logged yet</Text>
        </Surface>
      )}
    </ScrollView>
  );
}
