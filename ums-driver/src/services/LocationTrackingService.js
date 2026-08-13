import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {endPoints} from './ENV';

const LOCATION_INTERVAL_MS = 5000;

// Play Services = real device GPS (fused). Do NOT call getCurrentPosition
// while watchPosition is active — that crashes Play Services (null listener).
Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'always',
  enableBackgroundLocationUpdates: true,
  locationProvider: 'playServices',
});

const GPS_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 30000,
  // Real devices need a short cache window while GPS cold-starts
  maximumAge: 10000,
  distanceFilter: 5,
  interval: LOCATION_INTERVAL_MS,
  fastestInterval: 3000,
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let watchId = null;
let lastPostedAt = 0;
let isPosting = false;
let lastFixAt = 0;
let watchStartedAt = 0;
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

const postLocationSilent = async coords => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('[GPS] skip post — no token');
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
    console.log(
      'Background location post error:',
      error?.response?.status || error?.message || error,
    );
  }
};

const handleGpsFix = coords => {
  if (coords?.latitude == null || coords?.longitude == null) {
    return;
  }

  lastFixAt = Date.now();
  emitLocation(coords);

  const now = Date.now();
  if (isPosting || now - lastPostedAt < LOCATION_INTERVAL_MS) {
    return;
  }

  lastPostedAt = now;
  isPosting = true;
  console.log('[GPS] posting', {
    lat: coords.latitude,
    lng: coords.longitude,
    accuracyM: coords.accuracy,
  });
  postLocationSilent(coords).finally(() => {
    isPosting = false;
  });
};

const startGpsWatch = () => {
  if (watchId != null) {
    console.log('[GPS] watch already running, id=', watchId);
    return;
  }

  console.log('[GPS] starting watchPosition (playServices)...');

  watchId = Geolocation.watchPosition(
    position => {
      console.log('[GPS] fix', {
        lat: position?.coords?.latitude,
        lng: position?.coords?.longitude,
        accuracyM: position?.coords?.accuracy,
      });
      handleGpsFix(position.coords);
    },
    error => {
      console.log('[GPS] watch error:', error?.code, error?.message);
    },
    GPS_OPTIONS,
  );

  watchStartedAt = Date.now();
  console.log('[GPS] watch started, id=', watchId);
};

const stopGpsWatch = () => {
  if (watchId != null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
  lastPostedAt = 0;
  lastFixAt = 0;
  watchStartedAt = 0;
  isPosting = false;
};

// Foreground service keeps the process alive; GPS still comes from watchPosition.
// If no fix for a while, restart the watch (cold GPS / provider stall).
const keepAliveTask = async () => {
  await new Promise(async () => {
    while (BackgroundService.isRunning()) {
      const now = Date.now();
      const stalled = lastFixAt > 0 && now - lastFixAt > 45000;
      const neverGotFix =
        lastFixAt === 0 && watchStartedAt > 0 && now - watchStartedAt > 45000;

      if (stalled || neverGotFix) {
        console.log('[GPS] no fix for 45s — restarting watch');
        if (watchId != null) {
          Geolocation.clearWatch(watchId);
          watchId = null;
        }
        watchStartedAt = 0;
        startGpsWatch();
      }

      await sleep(LOCATION_INTERVAL_MS);
    }
  });
};

const openSettingsAlert = () => {
  Alert.alert(
    'Location Permission Required',
    'Please allow location access (Always / Allow all the time) and turn ON Location / GPS in phone settings.',
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

  console.log('[GPS] permissions fine=', fine, 'coarse=', coarse);

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

    console.log('[GPS] background permission=', background);

    if (background !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log(
        '[GPS] background denied — foreground tracking will still run',
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

  try {
    startGpsWatch();

    if (!BackgroundService.isRunning()) {
      await BackgroundService.start(keepAliveTask, serviceOptions);
    }

    return true;
  } catch (error) {
    console.log('startLocationTracking error:', error?.message || error);
    stopGpsWatch();
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
    }
    return false;
  }
};

export const stopLocationTracking = async () => {
  stopGpsWatch();
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
};

export const isLocationTrackingRunning = () =>
  watchId != null || BackgroundService.isRunning();
