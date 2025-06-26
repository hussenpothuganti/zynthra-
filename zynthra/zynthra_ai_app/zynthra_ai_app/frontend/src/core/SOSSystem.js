// SOSSystem.js - Enhanced SOS system with WhatsApp integration for Zynthra

import { NativeModules, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import zynthraAI from './ZynthraAI';

// Mock for native module that would handle location and messaging
const LocationModule = NativeModules.ZynthraLocationModule || {
  getCurrentLocation: () => new Promise(resolve => resolve({ latitude: 37.7749, longitude: -122.4194, accuracy: 10 })),
  startLocationUpdates: () => console.log('Location updates started'),
  stopLocationUpdates: () => console.log('Location updates stopped'),
};

const MessagingModule = NativeModules.ZynthraMessagingModule || {
  sendWhatsAppMessage: (to, message) => new Promise(resolve => resolve({ success: true, messageId: 'mock-id' })),
  shareWhatsAppLocation: (to, latitude, longitude, message) => 
    new Promise(resolve => resolve({ success: true, messageId: 'mock-id' })),
  makePhoneCall: (number) => console.log(`Would call ${number}`),
};

class SOSSystem {
  constructor() {
    this.isInitialized = false;
    this.isActive = false;
    this.locationUpdateInterval = null;
    this.emergencyContacts = [];
    this.sosMessage = "EMERGENCY: I need help! This is an automated alert from my Zynthra AI assistant.";
    this.locationSharingEnabled = true;
    this.autoCallEmergencyServices = false;
    this.emergencyNumber = '911'; // Default for US
    this.lastLocation = null;
    this.locationUpdateFrequency = 60000; // 1 minute
    this.notificationSent = false;
    this.activationTime = null;
  }

  // Initialize the SOS system
  async initialize() {
    try {
      // Request necessary permissions
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        ]);
        
        if (granted['android.permission.ACCESS_FINE_LOCATION'] !== PermissionsAndroid.RESULTS.GRANTED) {
          console.error('Location permission denied');
          return false;
        }
      }

      // Load emergency contacts
      const contacts = await AsyncStorage.getItem('zynthra_emergency_contacts');
      if (contacts) {
        this.emergencyContacts = JSON.parse(contacts);
      }
      
      // Load SOS settings
      const settings = await AsyncStorage.getItem('zynthra_sos_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.sosMessage = parsedSettings.message || this.sosMessage;
        this.locationSharingEnabled = parsedSettings.locationSharing !== undefined ? 
          parsedSettings.locationSharing : this.locationSharingEnabled;
        this.autoCallEmergencyServices = parsedSettings.autoCall !== undefined ?
          parsedSettings.autoCall : this.autoCallEmergencyServices;
        this.emergencyNumber = parsedSettings.emergencyNumber || this.emergencyNumber;
        this.locationUpdateFrequency = parsedSettings.updateFrequency || this.locationUpdateFrequency;
      }
      
      this.isInitialized = true;
      console.log('SOS system initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize SOS system:', error);
      return false;
    }
  }

  // Save emergency contacts to storage
  async saveEmergencyContacts() {
    try {
      await AsyncStorage.setItem('zynthra_emergency_contacts', JSON.stringify(this.emergencyContacts));
      return true;
    } catch (error) {
      console.error('Failed to save emergency contacts:', error);
      return false;
    }
  }

  // Save SOS settings to storage
  async saveSettings() {
    try {
      const settings = {
        message: this.sosMessage,
        locationSharing: this.locationSharingEnabled,
        autoCall: this.autoCallEmergencyServices,
        emergencyNumber: this.emergencyNumber,
        updateFrequency: this.locationUpdateFrequency
      };
      
      await AsyncStorage.setItem('zynthra_sos_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to save SOS settings:', error);
      return false;
    }
  }

  // Add emergency contact
  async addEmergencyContact(contact) {
    // Validate contact
    if (!contact.name || !contact.phone) {
      console.error('Invalid contact: name and phone are required');
      return false;
    }
    
    // Check if contact already exists
    const existingIndex = this.emergencyContacts.findIndex(c => c.phone === contact.phone);
    
    if (existingIndex >= 0) {
      // Update existing
      this.emergencyContacts[existingIndex] = {
        ...this.emergencyContacts[existingIndex],
        ...contact
      };
    } else {
      // Add new
      this.emergencyContacts.push({
        id: Date.now().toString(),
        ...contact,
        priority: contact.priority || this.emergencyContacts.length + 1
      });
    }
    
    // Sort by priority
    this.emergencyContacts.sort((a, b) => a.priority - b.priority);
    
    await this.saveEmergencyContacts();
    return true;
  }

  // Remove emergency contact
  async removeEmergencyContact(id) {
    const initialLength = this.emergencyContacts.length;
    this.emergencyContacts = this.emergencyContacts.filter(c => c.id !== id);
    
    if (this.emergencyContacts.length < initialLength) {
      // Recalculate priorities
      this.emergencyContacts.forEach((contact, index) => {
        contact.priority = index + 1;
      });
      
      await this.saveEmergencyContacts();
      return true;
    }
    
    return false;
  }

  // Update emergency contact priority
  async updateContactPriority(id, newPriority) {
    const contactIndex = this.emergencyContacts.findIndex(c => c.id === id);
    
    if (contactIndex < 0) {
      return false;
    }
    
    // Ensure priority is within valid range
    newPriority = Math.max(1, Math.min(newPriority, this.emergencyContacts.length));
    
    const contact = this.emergencyContacts[contactIndex];
    const oldPriority = contact.priority;
    
    // No change needed
    if (oldPriority === newPriority) {
      return true;
    }
    
    // Update priorities
    this.emergencyContacts.forEach(c => {
      if (c.id === id) {
        c.priority = newPriority;
      } else if (oldPriority < newPriority && c.priority > oldPriority && c.priority <= newPriority) {
        c.priority--;
      } else if (oldPriority > newPriority && c.priority < oldPriority && c.priority >= newPriority) {
        c.priority++;
      }
    });
    
    // Sort by priority
    this.emergencyContacts.sort((a, b) => a.priority - b.priority);
    
    await this.saveEmergencyContacts();
    return true;
  }

  // Set SOS message
  async setSOSMessage(message) {
    this.sosMessage = message;
    await this.saveSettings();
    return true;
  }

  // Set location sharing preference
  async setLocationSharing(enabled) {
    this.locationSharingEnabled = enabled;
    await this.saveSettings();
    return true;
  }

  // Set auto-call emergency services preference
  async setAutoCallEmergencyServices(enabled) {
    this.autoCallEmergencyServices = enabled;
    await this.saveSettings();
    return true;
  }

  // Set emergency number
  async setEmergencyNumber(number) {
    this.emergencyNumber = number;
    await this.saveSettings();
    return true;
  }

  // Set location update frequency
  async setLocationUpdateFrequency(milliseconds) {
    if (milliseconds < 10000) { // Minimum 10 seconds
      console.error('Update frequency must be at least 10000ms');
      return false;
    }
    
    this.locationUpdateFrequency = milliseconds;
    
    // Update running interval if active
    if (this.isActive && this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.startLocationUpdates();
    }
    
    await this.saveSettings();
    return true;
  }

  // Activate SOS
  async activate() {
    if (!this.isInitialized) {
      console.error('SOS system not initialized');
      return {
        success: false,
        error: 'System not initialized'
      };
    }
    
    if (this.isActive) {
      return {
        success: true,
        message: 'SOS already active'
      };
    }
    
    try {
      // Check if we have emergency contacts
      if (this.emergencyContacts.length === 0) {
        return {
          success: false,
          error: 'No emergency contacts configured',
          missingContacts: true
        };
      }
      
      // Get current location
      const location = await LocationModule.getCurrentLocation();
      this.lastLocation = location;
      
      // Start location updates
      this.startLocationUpdates();
      
      // Send initial notifications
      const notificationResults = await this.sendEmergencyNotifications();
      
      // Auto-call emergency services if configured
      if (this.autoCallEmergencyServices) {
        this.callEmergencyServices();
      }
      
      this.isActive = true;
      this.activationTime = new Date().toISOString();
      this.notificationSent = true;
      
      return {
        success: true,
        notificationsSent: notificationResults.successCount,
        notificationsFailed: notificationResults.failureCount,
        location: this.lastLocation
      };
    } catch (error) {
      console.error('Failed to activate SOS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Deactivate SOS
  async deactivate() {
    if (!this.isActive) {
      return {
        success: true,
        message: 'SOS not active'
      };
    }
    
    try {
      // Stop location updates
      this.stopLocationUpdates();
      
      // Send all-clear notifications
      if (this.notificationSent) {
        await this.sendAllClearNotifications();
      }
      
      this.isActive = false;
      this.notificationSent = false;
      this.activationTime = null;
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Failed to deactivate SOS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Start location updates
  startLocationUpdates() {
    // Start native location updates
    LocationModule.startLocationUpdates();
    
    // Set up interval for sending location updates
    this.locationUpdateInterval = setInterval(async () => {
      try {
        // Get current location
        const location = await LocationModule.getCurrentLocation();
        this.lastLocation = location;
        
        // Send location updates if significant change
        if (this.isSignificantLocationChange(this.lastLocation, location)) {
          this.sendLocationUpdates();
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }, this.locationUpdateFrequency);
  }

  // Stop location updates
  stopLocationUpdates() {
    // Stop native location updates
    LocationModule.stopLocationUpdates();
    
    // Clear interval
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  // Check if location change is significant
  isSignificantLocationChange(oldLocation, newLocation) {
    if (!oldLocation || !newLocation) {
      return true;
    }
    
    // Calculate distance (simple approximation)
    const latDiff = Math.abs(oldLocation.latitude - newLocation.latitude);
    const lonDiff = Math.abs(oldLocation.longitude - newLocation.longitude);
    
    // Consider significant if moved more than ~100 meters
    return (latDiff > 0.001 || lonDiff > 0.001);
  }

  // Send emergency notifications
  async sendEmergencyNotifications() {
    const results = {
      successCount: 0,
      failureCount: 0,
      details: []
    };
    
    // Send to each emergency contact
    for (const contact of this.emergencyContacts) {
      try {
        // Send message
        const messageResult = await MessagingModule.sendWhatsAppMessage(
          contact.phone,
          this.sosMessage
        );
        
        // Share location if enabled
        let locationResult = { success: true };
        if (this.locationSharingEnabled && this.lastLocation) {
          locationResult = await MessagingModule.shareWhatsAppLocation(
            contact.phone,
            this.lastLocation.latitude,
            this.lastLocation.longitude,
            "My current location"
          );
        }
        
        const success = messageResult.success && locationResult.success;
        
        results.details.push({
          contactId: contact.id,
          contactName: contact.name,
          success,
          messageId: messageResult.messageId
        });
        
        if (success) {
          results.successCount++;
        } else {
          results.failureCount++;
        }
      } catch (error) {
        console.error(`Error sending notification to ${contact.name}:`, error);
        
        results.details.push({
          contactId: contact.id,
          contactName: contact.name,
          success: false,
          error: error.message
        });
        
        results.failureCount++;
      }
    }
    
    return results;
  }

  // Send location updates
  async sendLocationUpdates() {
    if (!this.isActive || !this.notificationSent || !this.locationSharingEnabled || !this.lastLocation) {
      return {
        success: false,
        message: 'Cannot send location updates'
      };
    }
    
    const results = {
      successCount: 0,
      failureCount: 0,
      details: []
    };
    
    // Send to each emergency contact
    for (const contact of this.emergencyContacts) {
      try {
        const locationResult = await MessagingModule.shareWhatsAppLocation(
          contact.phone,
          this.lastLocation.latitude,
          this.lastLocation.longitude,
          "Location update"
        );
        
        results.details.push({
          contactId: contact.id,
          contactName: contact.name,
          success: locationResult.success,
          messageId: locationResult.messageId
        });
        
        if (locationResult.success) {
          results.successCount++;
        } else {
          results.failureCount++;
        }
      } catch (error) {
        console.error(`Error sending location update to ${contact.name}:`, error);
        
        results.details.push({
          contactId: contact.id,
          contactName: contact.name,
          success: false,
          error: error.message
        });
        
        results.failureCount++;
      }
    }
    
    return results;
  }

  // Send all-clear notifications
  async sendAllClearNotifications() {
    const results = {
      successCount: 0,
      failureCount: 0,
      details: []
    };
    
    const allClearMessage = "ALL CLEAR: I'm safe now. The emergency situation has been resolved.";
    
    // Send to each emergency contact
    for (const contact of this.emergencyContacts) {
      try {
        const messageResult = await MessagingModule.sendWhatsAppMessage(
          contact.phone,
          allClearMessage
        );
        
        results.details.push({
          contactId: contact.id,
          contactName: contact.name,
          success: messageResult.success,
          messageId: messageResult.messageId
        });
        
        if (messageResult.success) {
          results.successCount++;
        } else {
          results.failureCount++;
        }
      } catch (error) {
        console.error(`Error sending all-clear to ${contact.name}:`, error);
        
        results.details.push({
          contactId: contact.id,
          contactName: contact.name,
          success: false,
          error: error.message
        });
        
        results.failureCount++;
      }
    }
    
    return results;
  }

  // Call emergency services
  callEmergencyServices() {
    try {
      MessagingModule.makePhoneCall(this.emergencyNumber);
      return true;
    } catch (error) {
      console.error('Failed to call emergency services:', error);
      return false;
    }
  }

  // Get SOS status
  getStatus() {
    return {
      isActive: this.isActive,
      activationTime: this.activationTime,
      lastLocation: this.lastLocation,
      notificationSent: this.notificationSent,
      contactsCount: this.emergencyContacts.length
    };
  }

  // Clean up resources
  cleanup() {
    // Deactivate if active
    if (this.isActive) {
      this.deactivate();
    }
    
    this.isInitialized = false;
    console.log('SOS system cleaned up');
  }
}

// Export singleton instance
const sosSystem = new SOSSystem();
export default sosSystem;
