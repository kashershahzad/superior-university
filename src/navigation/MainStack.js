import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import InboxScreen from '../screens/Main/Chat/InboxScreen';
import Notifications from '../screens/Main/Notifications';
import TabStack from './TabStack';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        initialRouteName: 'TabStack',
      }}>
      <Stack.Screen name="TabStack" component={TabStack} />
      <Stack.Screen name="InboxScreen" component={InboxScreen} />
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
};

export default MainStack;
