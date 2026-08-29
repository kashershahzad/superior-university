/**
 * @format
 */

import {AppRegistry, InteractionManager} from 'react-native';

import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

const setupBackgroundMessaging = () => {
  try {
    const {NativeModules} = require('react-native');
    const hasNative =
      NativeModules.NativeRNFBTurboMessaging ||
      NativeModules.RNFBMessagingModule;

    if (!hasNative) {
      console.log(
        '[FCM] Native module not found. Rebuild the app: npx react-native run-android',
      );
      return;
    }

    const {getApp} = require('@react-native-firebase/app');
    const {
      getMessaging,
      setBackgroundMessageHandler,
    } = require('@react-native-firebase/messaging');

    const messaging = getMessaging(getApp());
    setBackgroundMessageHandler(messaging, async remoteMessage => {
      console.log(
        '[FCM] background message:',
        remoteMessage?.messageId,
        remoteMessage?.notification?.title,
      );
    });
  } catch (error) {
    console.log('[FCM] background handler setup failed:', error);
  }
};

InteractionManager.runAfterInteractions(setupBackgroundMessaging);
