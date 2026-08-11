import { NavigationContainer } from '@react-navigation/native';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import 'intl-pluralrules';

import SocketProvider from './src/components/SocketProvider';
import BrainBox from './src/components/BrainBox';

import { persistor, store } from './src/store';
import { COLORS } from './src/utils/COLORS';
import Navigation from './src/navigation';
import Splash from './src/screens/Main/Splash';
import i18n from './src/language/i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from './src/store/reducer/AuthConfig';
import { setUserData } from './src/store/reducer/usersSlice';

// const onBeforeLift = async () => {
//   const remember = await AsyncStorage.getItem('rememberMe');
//   if (remember !== 'true') {
//     await AsyncStorage.multiRemove(['token', 'refreshToken']);
//     store.dispatch(logout());
//     store.dispatch(setUserData({}));
//   }
// };

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <I18nextProvider i18n={i18n}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.primaryColor}
      />
      <Provider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}
        >
          {showSplash ? (
            <Splash onFinish={() => setShowSplash(false)} />
          ) : (
            <NavigationContainer>
              <SocketProvider>
                <BrainBox>
                  <Navigation />
                </BrainBox>
              </SocketProvider>
            </NavigationContainer>
          )}
        </PersistGate>
      </Provider>
    </I18nextProvider>
  );
};

export default App;
