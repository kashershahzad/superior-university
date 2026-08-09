import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {CommonActions} from '@react-navigation/native';

import ImageFast from '../../../components/ImageFast';
import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import CustomCheckbox from '../../../components/CustomCheckBox';
import GradientButton from '../../Main/Home/GradientButton';

import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import {Images} from '../../../assets/images';

const normalizeEmployeeId = value => {
  const raw = value.trim().toUpperCase().replace(/[\s-]/g, '');
  const match = raw.match(/^(DRV)(\d{4})(\d{3})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return value.trim().toUpperCase();
};

const Signin = ({navigation}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = () => {
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'MainStack'}],
      }),
    );
  };

  const handleForgotPassword = () => {};

  return (
    <ScreenWrapper
      backgroundColor="#FAFAFF"
      paddingHorizontal={30}
      statusBarColor={COLORS.white}
      scrollEnabled>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={25}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ImageFast source={Images.signin_img} style={styles.logo} />
          <CustomText
            label="Sign In"
            fontSize={20}
            marginTop={5}
            fontFamily={fonts.semiBold}
          />
          <CustomText
            label="Sign in to your account"
            fontSize={12}
            marginTop={5}
            fontFamily={fonts.medium}
            color="#393B41"
          />
        </View>

        <View style={styles.form}>
          <CustomInput
            placeholder="Enter Your ID"
            value={employeeId}
            onChangeText={text => setEmployeeId(normalizeEmployeeId(text))}
            autoCapitalize="characters"
            withLabel="Employee ID"
            labelColor="#475467"
            borderColor="#98A2B3"
            icon={Images.studentId}
          />

          <CustomInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            withLabel="Password"
            labelColor="#475467"
            borderColor="#98A2B3"
            icon={Images.password}
            secureTextEntry
            eyeIconColor={COLORS.primaryColor}
          />
        </View>

        <View style={styles.rememberRow}>
          <View style={styles.rememberLeft}>
            <CustomCheckbox
              value={rememberMe}
              onValueChange={setRememberMe}
              checkedBgColor="#F4F3FF"
              tickColor={COLORS.primaryColor}
            />
            <CustomText
              label="Remember Me"
              removeTranslation
              fontSize={12}
              color="#000"
              fontFamily={fonts.regular}
            />
          </View>
          <CustomText
            label="Forgot Password"
            removeTranslation
            fontSize={12}
            fontFamily={fonts.regular}
            color={COLORS.primaryColor}
            onPress={handleForgotPassword}
          />
        </View>

        <GradientButton
          title="Sign In"
          onPress={handleSignIn}
          marginTop={10}
          marginBottom={20}
          borderRadius={30}
          color="#ffffff"
        />
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
};

export default Signin;

const styles = StyleSheet.create({
  logo: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  header: {
    alignItems: 'center',
    marginTop: '88',
    marginBottom: 30,
  },
  form: {
    marginTop: 10,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 48,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
