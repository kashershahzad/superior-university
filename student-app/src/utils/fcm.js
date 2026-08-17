import AsyncStorage from '@react-native-async-storage/async-storage';
import {PermissionsAndroid, Platform, TurboModuleRegistry} from 'react-native';

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

const getFcmTokenFromNative = async () => {
  const native = TurboModuleRegistry.get('NativeRNFBTurboMessaging');
  if (!native) {
    throw new Error('FCM native module not found. Rebuild the Android app.');
  }
  if (typeof native.getToken !== 'function') {
    throw new Error('FCM native getToken is missing.');
  }
  return native.getToken(FCM_APP_NAME, FCM_SENDER_ID);
};

export const registerFcmToken = async () => {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log('Notification permission not granted');
      return;
    }

    const fcmToken = await getFcmTokenFromNative();
    if (!fcmToken) {
      console.log('FCM token not available');
      return;
    }

    await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    const deviceId = await getOrCreateDeviceId();

    const res = await post('student/fcm-token', {
      token: fcmToken,
      platform: Platform.OS,
      device_id: deviceId,
    });
    console.log('FCM register:', res?.data);
  } catch (error) {
    console.log('FCM register error:', error);
  }
};
