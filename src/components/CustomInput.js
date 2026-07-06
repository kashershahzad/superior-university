import {Image, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';

import CustomText from './CustomText';
import Icons from './Icons';

import {COLORS} from '../utils/COLORS';
import i18n from '../language/i18n';
import fonts from '../assets/fonts';
import {Images} from '../assets/images';

const CustomInput = ({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType,
  multiline,
  maxLength,
  placeholderTextColor,
  editable,
  textAlignVertical,
  marginBottom,
  height = 58,
  autoCapitalize,
  error,
  isFocus,
  isBlur,
  width,
  onEndEditing,
  autoFocus,
  ref,
  borderRadius,
  marginTop,
  withLabel,
  isError,
  labelColor,
  borderColor,
  icon,
  iconName,
  iconFamily = 'Feather',
  rightIcon,
  rightIconName,
  rightIconFamily = 'Feather',
  onPress,
  eyeIconColor,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePass, setHidePass] = useState(true);

  const handleFocus = () => {
    setIsFocused(true);
    isFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    isBlur?.();
  };

  return (
    <View style={{width: width || '100%'}}>
      {withLabel && (
        <CustomText
          label={withLabel}
          marginBottom={8}
          color={labelColor || COLORS.black}
        />
      )}
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
        onPress={onPress}
        style={[
          styles.mainContainer,
          {
            marginBottom: error ? 5 : marginBottom || 20,
            marginTop,
            borderColor:
              error || isError
                ? COLORS.red
                : isFocused
                ? '#98A2B3'
                : borderColor,
            borderWidth: isFocused || error || isError ? 1 : 1,
            height: height ? height : multiline ? 180 : 56,
            width: '100%',
            borderRadius: borderRadius || 12,
            backgroundColor: isFocused ? '#FAFAFA' : '#FFFFFF',
          },
        ]}>
        {icon ? (
          <Image source={icon} style={styles.inputIcon} />
        ) : iconName ? (
          <Icons
            name={iconName}
            family={iconFamily}
            color={COLORS.primaryColor}
            size={20}
            style={styles.inputIcon}
          />
        ) : null}
        <TextInput
          ref={ref}
          placeholder={i18n.t(placeholder)}
          style={[
            styles.input,
            {
              flex: 1,
              paddingVertical: multiline ? 18 : 0,
            },
          ]}
          secureTextEntry={secureTextEntry ? (hidePass ? true : false) : false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          onEndEditing={onEndEditing}
          maxLength={maxLength}
          placeholderTextColor={placeholderTextColor || COLORS.inputLabel}
          editable={onPress ? false : editable}
          pointerEvents={onPress ? 'none' : 'auto'}
          textAlignVertical={multiline ? 'top' : textAlignVertical}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
        />

        {rightIcon ? (
          <Image source={rightIcon} style={styles.rightIcon} />
        ) : rightIconName ? (
          <Icons
            name={rightIconName}
            family={rightIconFamily}
            color={COLORS.primaryColor}
            size={20}
          />
        ) : null}

        {secureTextEntry && (
          <Icons
            name={!hidePass ? 'eye' : 'eye-off'}
            color={eyeIconColor || COLORS.gray}
            size={20}
            family="Feather"
            onPress={() => setHidePass(!hidePass)}
          />
        )}
      </TouchableOpacity>
      {error && (
        <CustomText
          label={error}
          color={COLORS.red}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={15}
        />
      )}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  input: {
    height: '100%',
    padding: 0,
    margin: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.black,
  },
  inputIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  },
  rightIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginLeft: 8,
  },
});
