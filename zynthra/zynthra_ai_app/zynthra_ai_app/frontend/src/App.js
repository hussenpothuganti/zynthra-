// App.js - Main application component for Zynthra AI

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  ActivityIndicator,
  Image,
  TouchableOpacity
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

// Core modules
import zynthraAI from './core/ZynthraAI';
import voiceCommandSystem from './core/VoiceCommandSystem';
import eCommerceIntegration from './core/ECommerceIntegration';
import sosSystem from './core/SOSSystem';

// Screens
import HomeScreen from './screens/HomeScreen';
import SOSScreen from './screens/SOSScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';

// Theme and styles
import { lightTheme, darkTheme } from './styles/themes';
import { globalStyles } from './styles/global';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main stack navigator
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

// Tab navigator
const MainTabs = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SOS') {
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          } else if (route.name === 'Shopping') {
            iconName = focused ? 'cart' : 'cart-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.cardBackground,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="SOS" component={SOSScreen} />
      <Tab.Screen name="Shopping" component={ShoppingScreen} />
    </Tab.Navigator>
  );
};

// App component
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Initialize all systems
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Zynthra AI core
        const aiInitialized = await zynthraAI.initialize();
        if (!aiInitialized) {
          throw new Error('Failed to initialize Zynthra AI core');
        }
        
        // Initialize voice command system
        const voiceInitialized = await voiceCommandSystem.initialize();
        if (!voiceInitialized) {
          console.warn('Voice command system initialization failed, continuing without voice features');
        }
        
        // Initialize e-commerce integration
        const ecommerceInitialized = await eCommerceIntegration.initialize();
        if (!ecommerceInitialized) {
          console.warn('E-commerce integration initialization failed, continuing without shopping features');
        }
        
        // Initialize SOS system
        const sosInitialized = await sosSystem.initialize();
        if (!sosInitialized) {
          console.warn('SOS system initialization failed, continuing without emergency features');
        }
        
        // Start wake word detection if voice system initialized
        if (voiceInitialized) {
          voiceCommandSystem.startWakeWordDetection();
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSystems();

    // Cleanup on unmount
    return () => {
      if (voiceCommandSystem.isInitialized) {
        voiceCommandSystem.cleanup();
      }
      if (sosSystem.isInitialized) {
        sosSystem.cleanup();
      }
    };
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Image
            source={require('./assets/images/zynthra_logo.png')}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingIndicator} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Initializing Zynthra AI...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Error screen
  if (error) {
    return (
      <SafeAreaProvider>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Icon name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
            Initialization Error
          </Text>
          <Text style={[styles.errorMessage, { color: theme.colors.text }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => window.location.reload()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    );
  }

  // Main app
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer
        theme={{
          dark: colorScheme === 'dark',
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.cardBackground,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.notification,
          },
        }}
      >
        <MainStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingLogo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  loadingIndicator: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
