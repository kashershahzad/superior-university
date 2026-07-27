import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Images } from '../../../assets/images';

const Splash = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.authConfig?.token);

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace(token ? 'MainStack' : 'AuthStack');
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