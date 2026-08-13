import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {endPoints} from './ENV';

const LOCATION_INTERVAL_MS = 5000;

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'always',
  enableBackgroundLocationUpdates: true,
  locationProvider: 'playServices',
});

const GPS_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 25000,
  maximumAge: 0,
  distanceFilter: 0,
  interval: LOCATION_INTERVAL_MS,
  fastestInterval: 2000,
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let watchId = null;
const locationListeners = new Set();

const emitLocation = coords => {
  locationListeners.forEach(listener => {
    try {
      listener(coords);
    } catch (error) {
      console.log('Location listener error:', error?.message || error);
    }
  });
};

export const subscribeLocationUpdates = listener => {
  locationListeners.add(listener);
  return () => locationListeners.delete(listener);
};

const getCurrentPosition = (highAccuracy = true) =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      ...GPS_OPTIONS,
      enableHighAccuracy: highAccuracy,
      timeout: highAccuracy ? 25000 : 15000,
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

const handleGpsFix = coords => {
  console.log('[GPS] fix', {
    lat: coords.latitude,
    lng: coords.longitude,
    accuracyM: coords.accuracy,
  });
  emitLocation(coords);
  postLocationSilent(coords);
};

const startGpsWatch = () => {
  if (watchId != null) {
    return;
  }

  watchId = Geolocation.watchPosition(
    position => handleGpsFix(position.coords),
    error => {
      console.log('GPS watch error:', error?.code, error?.message);
      getCurrentPosition(false)
        .then(position => handleGpsFix(position.coords))
        .catch(fallbackError => {
          console.log(
            'GPS fallback error:',
            fallbackError?.code,
            fallbackError?.message,
          );
        });
    },
    GPS_OPTIONS,
  );

  getCurrentPosition(true)
    .then(position => handleGpsFix(position.coords))
    .catch(error => {
      console.log('GPS first fix error:', error?.code, error?.message);
      return getCurrentPosition(false).then(position =>
        handleGpsFix(position.coords),
      );
    })
    .catch(error => {
      console.log('GPS network fallback error:', error?.code, error?.message);
    });
};

const stopGpsWatch = () => {
  if (watchId != null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
};

const keepAliveTask = async () => {
  await new Promise(async () => {
    while (BackgroundService.isRunning()) {
      await sleep(LOCATION_INTERVAL_MS);
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

  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);

  const fine =
    results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
    PermissionsAndroid.RESULTS.GRANTED;
  const coarse =
    results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
    PermissionsAndroid.RESULTS.GRANTED;

  if (!fine && !coarse) {
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
      console.log(
        'Background location not granted — foreground GPS will still run.',
      );
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

  startGpsWatch();

  if (!BackgroundService.isRunning()) {
    await BackgroundService.start(keepAliveTask, serviceOptions);
  }

  return true;
};

export const stopLocationTracking = async () => {
  stopGpsWatch();
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
};

export const isLocationTrackingRunning = () =>
  watchId != null || BackgroundService.isRunning();
