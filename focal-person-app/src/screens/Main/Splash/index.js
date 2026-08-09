import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';

import { Images } from '../../../assets/images';

const Splash = ({ onFinish }) => {
  useEffect(() => {
    const t = setTimeout(() => {
      onFinish?.();
    }, 2500);

    return () => clearTimeout(t);
  }, [onFinish]);

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
