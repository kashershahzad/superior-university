import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import React, {useEffect} from 'react';

//screens
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import Splash from '../screens/Main/Splash';
import i18n from '../language/i18n';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const isToken = useSelector(state => state.authConfig.token);

  const {language} = useSelector(state => state.users);

  useEffect(() => {
    if (language == 'en') {
      i18n.changeLanguage('en');
    } else {
      i18n.changeLanguage('dr');
    }
  }, []);
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      {/* {isToken ? (
        <>
          <Stack.Screen name="MainStack" component={MainStack} />
          <Stack.Screen name="AuthStack" component={AuthStack} />
        </>
      ) : (
        <>
          <Stack.Screen name="AuthStack" component={AuthStack} />
          <Stack.Screen name="MainStack" component={MainStack} />
        </>
      )} */}
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="MainStack" component={MainStack} />
      <Stack.Screen name="AuthStack" component={AuthStack} />
    </Stack.Navigator>
  );
};

export default RootNavigation;
