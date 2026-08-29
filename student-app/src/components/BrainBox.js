import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {setupFcmListeners} from '../utils/fcm';

const BrainBox = ({children}) => {
  const navigation = useNavigation();
  const token = useSelector(state => state.authConfig?.token);

  useEffect(() => {
    if (!token) {
      return undefined;
    }
    const cleanup = setupFcmListeners(navigation);
    return cleanup;
  }, [token, navigation]);

  return <View style={{flex: 1}}>{children}</View>;
};

export default BrainBox;
