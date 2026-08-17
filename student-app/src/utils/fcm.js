import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules, PermissionsAndroid, Platform} from 'react-native';

import {post} from '../services/ApiRequest';

const DEVICE_ID_KEY = 'deviceId';
const FCM_TOKEN_KEY = 'fcmToken';
const FCM_APP_NAME = '[DEFAULT]';
const FCM_SENDER_ID = '404153261358';

const getOrCreateDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `${Platform.OS}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

const requestNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return status === PermissionsAndroid.RESULTS.GRANTED;
};

const getNativeMessagingModule = () => {
  const fromProxy =
    typeof global.__turboModuleProxy === 'function'
      ? global.__turboModuleProxy('NativeRNFBTurboMessaging')
      : null;
  if (fromProxy) {
    return fromProxy;
  }

  const RN = require('react-native');
  const registry = RN.TurboModuleRegistry;
  const getFn = registry?.get || registry?.default?.get;
  if (typeof getFn === 'function') {
    const fromRegistry = getFn('NativeRNFBTurboMessaging');
    if (fromRegistry) {
      return fromRegistry;
    }
  }

  return (
    NativeModules.NativeRNFBTurboMessaging ||
    NativeModules.RNFBMessagingModule ||
    null
  );
};

const getFcmTokenFromNative = async () => {
  const native = getNativeMessagingModule();
  if (!native) {
    throw new Error('FCM native module not found. Rebuild the Android app.');
  }

  const getToken = native.getToken?.bind(native);
  if (typeof getToken !== 'function') {
    throw new Error(
      `FCM getToken missing. keys=${Object.keys(native).join(',')}`,
    );
  }

  return getToken(FCM_APP_NAME, FCM_SENDER_ID);
};

export const registerFcmToken = async () => {
  try {
    console.log('[FCM] register start');
    const granted = await requestNotificationPermission();
    console.log('[FCM] permission granted:', granted);
    if (!granted) {
      return;
    }

    const fcmToken = await getFcmTokenFromNative();
    console.log('[FCM] token:', fcmToken);
    if (!fcmToken) {
      return;
    }

    await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    const deviceId = await getOrCreateDeviceId();
    console.log('[FCM] sending to API, device_id:', deviceId);

    const res = await post('student/fcm-token', {
      token: fcmToken,
      platform: Platform.OS,
      device_id: deviceId,
    });
    console.log('[FCM] register API:', res?.data);
  } catch (error) {
    console.log('[FCM] register error:', error);
  }
};
