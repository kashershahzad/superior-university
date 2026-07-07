import {ActivityIndicator, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import React from 'react';

import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import {COLORS} from '../../../utils/COLORS';

const DEFAULT_GRADIENT = ['#BD65C0', '#913094', '#701A73'];

const GradientButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  height = 48,
  borderRadius = 24,
  marginTop,
  marginBottom,
  colors = DEFAULT_GRADIENT,
  fontSize = 15,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[styles.wrapper, {marginTop, marginBottom}]}>
      <LinearGradient
        colors={isDisabled ? [COLORS.authText, COLORS.authText] : colors}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={[styles.gradient, {height, borderRadius}]}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <CustomText
            label={title}
            color={COLORS.white}
            fontFamily={fonts.semiBold}
            fontSize={fontSize}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  gradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
