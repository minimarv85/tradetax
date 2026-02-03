// App.js
// TradeTax - UK Sole Trader Finance App
// Built with React Native + Expo

import { useState, useEffect } from 'react';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  PaperProvider,
  MD3LightTheme,
} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import HomeScreen from './app-tabs/HomeScreen';
import IncomeScreen from './app-tabs/IncomeScreen';
import ExpensesScreen from './app-tabs/ExpensesScreen';
import SettingsScreen from './app-tabs/SettingsScreen';

// Theme
const theme = {
  ...MD3LightTheme,
  colors: {
    primary: '#0066CC',
    secondary: '#00A651',
    error: '#B00020',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1C1B1F',
    onSurface: '#1C1B1F',
  },
};

// Navigation
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  switch (route.name) {
                    case 'Home':
                      iconName = focused ? 'home' : 'home-outline';
                      break;
                    case 'Income':
                      iconName = focused ? 'arrow-down-bold' : 'arrow-down-bold-outline';
                      break;
                    case 'Expenses':
                      iconName = focused ? 'arrow-up-bold' : 'arrow-up-bold-outline';
                      break;
                    case 'Settings':
                      iconName = focused ? 'cog' : 'cog-outline';
                      break;
                  }

                  return (
                    <MaterialCommunityIcons
                      name={iconName}
                      size={size}
                      color={color}
                    />
                  );
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: '#FFFFFF',
              })}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Home', headerTitle: 'TradeTax' }}
              />
              <Tab.Screen
                name="Income"
                component={IncomeScreen}
                options={{ title: 'Income', headerTitle: 'Add Income' }}
              />
              <Tab.Screen
                name="Expenses"
                component={ExpensesScreen}
                options={{ title: 'Expenses', headerTitle: 'Add Expense' }}
              />
              <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings', headerTitle: 'Settings' }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
