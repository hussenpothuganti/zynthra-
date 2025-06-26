import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { useTranslation } from 'react-i18next';
import './i18n';

// Screens
import HomeScreen from './screens/HomeScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import SOSScreen from './screens/SOSScreen';
import CareerScreen from './screens/CareerScreen';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';

// Redux
import { Provider } from 'react-redux';
import store from './store';

// Theme
import { ThemeProvider } from './theme/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    // Initialize TTS
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultVoice('com.apple.ttsbundle.Samantha-compact');
    
    // Initialize Voice Recognition
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  
  const onSpeechStart = () => {
    console.log('Speech started');
  };
  
  const onSpeechEnd = () => {
    console.log('Speech ended');
  };
  
  const onSpeechResults = (e) => {
    console.log('Speech results:', e.value);
  };
  
  const MainTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Challenges') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            } else if (route.name === 'SOS') {
              iconName = focused ? 'alert-circle' : 'alert-circle-outline';
            } else if (route.name === 'Career') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'Chat') {
              iconName = focused ? 'message-text' : 'message-text-outline';
            }
            
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4A148C',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('home') }} />
        <Tab.Screen name="Challenges" component={ChallengesScreen} options={{ title: t('challenges') }} />
        <Tab.Screen name="SOS" component={SOSScreen} options={{ title: t('sos') }} />
        <Tab.Screen name="Career" component={CareerScreen} options={{ title: t('career') }} />
        <Tab.Screen name="Chat" component={ChatScreen} options={{ title: t('chat') }} />
      </Tab.Navigator>
    );
  };
  
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <Stack.Navigator>
            <Stack.Screen 
              name="Main" 
              component={MainTabs} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ 
                title: t('settings'),
                headerStyle: {
                  backgroundColor: '#4A148C',
                },
                headerTintColor: '#FFFFFF',
              }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
