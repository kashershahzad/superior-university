import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import TabStack from './TabStack';
import ReviewAttendance from '../screens/Main/ReviewAttendance';
import PersonalData from '../screens/Main/Profile/PersonalData';
import ChangePassword from '../screens/Main/Profile/ChangePassword';
import Help from '../screens/Main/Profile/Help';
import AttendanceHistory from '../screens/Main/Profile/AttendanceHistory';
import AssignedRoutes from '../screens/Main/Profile/AssignedRoutes';

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
      <Stack.Screen name="ReviewAttendance" component={ReviewAttendance} />
      <Stack.Screen name="PersonalData" component={PersonalData} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="Help" component={Help} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
      <Stack.Screen name="AssignedRoutes" component={AssignedRoutes} />
    </Stack.Navigator>
  );
};

export default MainStack;
