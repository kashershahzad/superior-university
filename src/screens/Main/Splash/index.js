import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import RNBootSplash from 'react-native-bootsplash';

import { Images } from '../../../assets/images';

const Splash = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.authConfig?.token);

  useEffect(() => {
    // default / native splash hide
    RNBootSplash.hide({ fade: false });

    const t = setTimeout(() => {
      // testing: hamesha MainStack
      navigation.replace(token ? 'MainStack' : 'AuthStack');
      // ya temporary: navigation.replace('MainStack');
    }, 2500);

    return () => clearTimeout(t);
  }, [navigation, token]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Image
        source={Images.splash}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});