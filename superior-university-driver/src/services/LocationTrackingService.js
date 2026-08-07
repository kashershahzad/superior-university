import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {endPoints} from './ENV';

const LOCATION_INTERVAL_MS = 5000;

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'always',
  enableBackgroundLocationUpdates: true,
  locationProvider: 'auto',
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
      distanceFilter: 0,
    });
  });

const postLocationSilent = async coords => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return;
    }

    await axios.post(
      `${endPoints.BASE_URL}driver/location`,
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading ?? 0,
        speed: coords.speed ?? 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      },
    );
  } catch (error) {
    console.log('Background location post error:', error?.message || error);
  }
};

const trackingTask = async taskDataArguments => {
  const delay = taskDataArguments?.delay ?? LOCATION_INTERVAL_MS;

  await new Promise(async () => {
    while (BackgroundService.isRunning()) {
      try {
        const position = await getCurrentPosition();
        await postLocationSilent(position.coords);

        if (Platform.OS === 'android') {
          await BackgroundService.updateNotification({
            taskDesc: `Last update ${new Date().toLocaleTimeString()}`,
          });
        }
      } catch (error) {
        console.log('Location track error:', error?.message || error);
      }

      await sleep(delay);
    }
  });
};

const openSettingsAlert = () => {
  Alert.alert(
    'Location Permission Required',
    'Please allow location access (Always / Allow all the time) so we can share your live location while on duty.',
    [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Open Settings', onPress: () => Linking.openSettings()},
    ],
  );
};

const requestAndroidPermissions = async () => {
  if (Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }

  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message:
        'UMS Driver needs your location to share live bus position while on duty.',
      buttonPositive: 'OK',
      buttonNegative: 'Cancel',
    },
  );

  if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
    openSettingsAlert();
    return false;
  }

  if (Platform.Version >= 29) {
    const background = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      {
        title: 'Background Location',
        message:
          'Allow location access all the time so tracking continues when the app is in the background.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );

    if (background !== PermissionsAndroid.RESULTS.GRANTED) {
      openSettingsAlert();
      return false;
    }
  }

  return true;
};

const requestIosPermissions = () =>
  new Promise(resolve => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => {
        openSettingsAlert();
        resolve(false);
      },
    );
  });

export const requestLocationPermissions = async () => {
  if (Platform.OS === 'android') {
    return requestAndroidPermissions();
  }
  return requestIosPermissions();
};

const serviceOptions = {
  taskName: 'DriverLocationTracking',
  taskTitle: 'Location sharing active',
  taskDesc: 'Sharing live bus location with UMS',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#701A73',
  linkingURI: 'umdriver://duty',
  foregroundServiceType: ['location'],
  parameters: {
    delay: LOCATION_INTERVAL_MS,
  },
};

export const startLocationTracking = async () => {
  const granted = await requestLocationPermissions();
  if (!granted) {
    return false;
  }

  if (BackgroundService.isRunning()) {
    return true;
  }

  await BackgroundService.start(trackingTask, serviceOptions);
  return true;
};

export const stopLocationTracking = async () => {
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
};

export const isLocationTrackingRunning = () => BackgroundService.isRunning();
