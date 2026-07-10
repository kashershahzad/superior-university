import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import InboxScreen from '../screens/Main/Chat/InboxScreen';
import Notifications from '../screens/Main/Notifications';
import FeeVoucher from '../screens/Main/FeeVoucher';
import TabStack from './TabStack';
import GenerateCard from '../screens/Main/GenerateCard';
import Verification from '../screens/Main/Verification';
import Fees from '../screens/Main/Fees';

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
      <Stack.Screen name="FeeVoucher" component={FeeVoucher} />
      <Stack.Screen name="GenerateCard" component={GenerateCard} />
      <Stack.Screen name="Verification" component={Verification} />
      <Stack.Screen name="Fees" component={Fees} />
    </Stack.Navigator>
  );
};

export default MainStack;
