import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import InboxScreen from '../screens/Main/Chat/InboxScreen';
import Notifications from '../screens/Main/Notifications';
import FeeVoucher from '../screens/Main/FeeVoucher';
import TabStack from './TabStack';
import GenerateCard from '../screens/Main/GenerateCard';
import Verification from '../screens/Main/Verification';
import Fees from '../screens/Main/Fees';
import ChangePassword from '../screens/Main/Profile/ChangePassword';
import Help from '../screens/Main/Profile/Help';
import PersonalData from '../screens/Main/Profile/PersonalData';


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
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="Help" component={Help} />
      <Stack.Screen name="PersonalData" component={PersonalData} />
    </Stack.Navigator>
  );
};

export default MainStack;
