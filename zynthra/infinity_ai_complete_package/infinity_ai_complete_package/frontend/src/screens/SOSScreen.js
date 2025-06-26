import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Linking,
  Platform,
  PermissionsAndroid,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, Circle } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useSelector, useDispatch } from 'react-redux';
import { updateLocation, sendSOS, cancelSOS } from '../store/actions/sosActions';
import { RippleButton } from '../components/RippleButton';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';

const SOSScreen = () => {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();
  const dispatch = useDispatch();
  const { location, sosActive, loading, emergencyContacts } = useSelector(state => state.sos);
  
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  
  useEffect(() => {
    requestLocationPermission();
    
    const locationInterval = setInterval(() => {
      if (hasLocationPermission) {
        getCurrentLocation();
      }
    }, 30000); // Update location every 30 seconds
    
    return () => clearInterval(locationInterval);
  }, [hasLocationPermission]);
  
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      setHasLocationPermission(status === 'granted');
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: t('location_permission_title'),
          message: t('location_permission_message'),
          buttonNeutral: t('ask_me_later'),
          buttonNegative: t('cancel'),
          buttonPositive: t('ok')
        }
      );
      setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    }
    
    if (hasLocationPermission) {
      getCurrentLocation();
    }
  };
  
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        dispatch(updateLocation({ latitude, longitude }));
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  
  const handleSOS = () => {
    if (sosActive) {
      Alert.alert(
        t('cancel_sos_title'),
        t('cancel_sos_message'),
        [
          {
            text: t('no'),
            style: 'cancel'
          },
          {
            text: t('yes'),
            onPress: () => dispatch(cancelSOS())
          }
        ]
      );
    } else {
      Alert.alert(
        t('activate_sos_title'),
        t('activate_sos_message'),
        [
          {
            text: t('cancel'),
            style: 'cancel'
          },
          {
            text: t('activate'),
            onPress: () => dispatch(sendSOS(location))
          }
        ]
      );
    }
  };
  
  const callEmergencyServices = () => {
    let phoneNumber = '';
    
    if (Platform.OS === 'android') {
      phoneNumber = 'tel:911';
    } else {
      phoneNumber = 'telprompt:911';
    }
    
    Linking.openURL(phoneNumber);
  };
  
  const renderEmergencyContacts = () => {
    if (emergencyContacts.length === 0) {
      return (
        <View style={styles.emptyContactsContainer}>
          <Text style={[styles.emptyContactsText, { color: colors.textSecondary }]}>
            {t('no_emergency_contacts')}
          </Text>
          <TouchableOpacity 
            style={[styles.addContactButton, { borderColor: colors.primary }]}
          >
            <Text style={[styles.addContactText, { color: colors.primary }]}>
              {t('add_emergency_contacts')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.contactsContainer}>
        <Text style={[styles.contactsTitle, { color: colors.text }]}>
          {t('emergency_contacts')}
        </Text>
        
        {emergencyContacts.map(contact => (
          <TouchableOpacity 
            key={contact.id} 
            style={[styles.contactItem, { borderBottomColor: 'rgba(0,0,0,0.05)' }]}
            onPress={() => Linking.openURL(`tel:${contact.phone}`)}
          >
            <View style={[styles.contactAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.contactInitial, { color: colors.primary }]}>
                {contact.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
              <Text style={[styles.contactRelation, { color: colors.textSecondary }]}>
                {contact.relation}
              </Text>
            </View>
            <Icon name="phone" size={20} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('emergency_sos')}</Text>
      </View>
      
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            followsUserLocation
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
            />
            <Circle
              center={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
              radius={100}
              fillColor="rgba(74, 20, 140, 0.2)"
              strokeColor="rgba(74, 20, 140, 0.5)"
            />
          </MapView>
        ) : (
          <View style={[styles.loadingContainer, { backgroundColor: colors.cardBackground }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('getting_location')}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.emergencyCallButton, { backgroundColor: '#E53935' }]}
          onPress={callEmergencyServices}
        >
          <Icon name="phone" size={24} color="#FFFFFF" />
          <Text style={styles.emergencyCallText}>{t('call_emergency_services')}</Text>
        </TouchableOpacity>
        
        <RippleButton
          onPress={handleSOS}
          style={[
            styles.sosButton,
            { backgroundColor: sosActive ? '#E53935' : '#4A148C' }
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Icon 
                name={sosActive ? "close-circle-outline" : "alert-circle-outline"} 
                size={32} 
                color="#FFFFFF" 
              />
              <Text style={styles.sosButtonText}>
                {sosActive ? t('cancel_sos') : t('activate_sos')}
              </Text>
            </>
          )}
        </RippleButton>
        
        <Card style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>{t('sos_info_title')}</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('sos_info_description')}
          </Text>
        </Card>
      </View>
      
      {renderEmergencyContacts()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  actionsContainer: {
    padding: 16,
  },
  emergencyCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  emergencyCallText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sosButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  infoCard: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactsContainer: {
    padding: 16,
  },
  contactsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInitial: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactRelation: {
    fontSize: 12,
  },
  emptyContactsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContactsText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  addContactButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 4,
  },
  addContactText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SOSScreen;
