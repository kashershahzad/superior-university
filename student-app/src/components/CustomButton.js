import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import React from 'react';

import CustomText from './CustomText';

import {COLORS} from '../utils/COLORS';
import fonts from '../assets/fonts';

const CustomButton = ({
  onPress,
  title,
  disabled,
  loading,
  customStyle,
  customText,
  marginBottom,
  marginTop,
  backgroundColor,
  color,
  width = '100%',
  height = 54,
  borderRadius = 8,
  justifyContent = 'center',
  alignItems = 'center',
  flexDirection = 'row',
  alignSelf = 'center',
  fontSize,
  indicatorColor,
  marginRight,
  borderWidth,
  borderColor,
  fontFamily,
  loadingSize,
  mainStyle,
}) => {
  const isDisabled = !!(loading || disabled);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        mainStyle,
        {
          backgroundColor: disabled
            ? COLORS.authText
            : backgroundColor || COLORS.primaryColor,
          marginTop,
          marginBottom,
          marginRight,
          width,
          height,
          borderRadius,
          flexDirection,
          alignItems,
          justifyContent,
          alignSelf,
          borderWidth,
          borderColor,
          opacity: isDisabled && loading ? 0.9 : 1,
        },
        customStyle,
      ]}>
      {loading ? (
        <ActivityIndicator
          size={loadingSize || 25}
          color={indicatorColor ? COLORS.primaryColor : COLORS.white}
        />
      ) : (
        <View pointerEvents="none">
          <CustomText
            textStyle={customText}
            label={title}
            removeTranslation
            color={color || COLORS.white}
            fontFamily={fontFamily || fonts.semiBold}
            fontSize={fontSize || 15}
            lineHeight={22}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
  },
});
