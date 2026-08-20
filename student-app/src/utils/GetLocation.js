import {Alert, Linking, Platform, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {useEffect, useState} from 'react';

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs your location to track the bus.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return new Promise(resolve => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false),
    );
  });
};

const getPosition = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
      },
    );
  });

export const getCurrentCoords = async () => {
  const allowed = await requestLocationPermission();
  if (!allowed) {
    throw new Error('Location permission denied');
  }

  const position = await getPosition();
  return position.coords;
};

const GetLocation = () => {
  const [locationData, setLocationData] = useState({});

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocationData({
          latitude,
          longitude,
        });
      },
      error => {
        console.error('Geolocation Error:', error.message);
        Alert.alert('Error', 'Unable to get your location. Please try again.');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const requestAndroidPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
      } else {
        showPermissionAlert();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const requestIosPermission = () => {
    Geolocation.requestAuthorization(
      () => {
        getLocation();
      },
      error => {
        console.error('iOS permission error:', error);
        showPermissionAlert();
      },
    );
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      await requestAndroidPermission();
    } else {
      requestIosPermission();
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      'Permission Required',
      'Please allow location permission in Settings.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => Linking.openSettings()},
      ],
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return locationData;
};

export default GetLocation;
