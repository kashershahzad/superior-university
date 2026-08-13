import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import { useDispatch } from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {CommonActions} from '@react-navigation/native';

import ImageFast from '../../../components/ImageFast';
import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import CustomCheckbox from '../../../components/CustomCheckBox';
import GradientButton from '../../Main/Home/GradientButton';

import {post} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {setToken} from '../../../store/reducer/AuthConfig';
import {setUserData} from '../../../store/reducer/usersSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import {Images} from '../../../assets/images';

const REMEMBER_KEYS = {
  flag: 'rememberMe',
  employeeId: 'rememberedEmployeeId',
  password: 'rememberedPassword',
};

const Signin = ({navigation}) => {
  const dispatch = useDispatch();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRememberedCredentials = async () => {
      try {
        const [flag, savedId, savedPassword] = await AsyncStorage.multiGet([
          REMEMBER_KEYS.flag,
          REMEMBER_KEYS.employeeId,
          REMEMBER_KEYS.password,
        ]);
        if (flag?.[1] === 'true') {
          setRememberMe(true);
          if (savedId?.[1]) setEmployeeId(savedId[1]);
          if (savedPassword?.[1]) setPassword(savedPassword[1]);
        }
      } catch (err) {
        console.log('Load remembered credentials error:', err);
      }
    };
    loadRememberedCredentials();
  }, []);

  const handleForgotPassword = () => {};

  const handleSignIn = async () => {
    if (!employeeId.trim() || !password.trim()) {
      ToastMessage('Please enter Employee ID and Password', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await post('auth/uni-staff/login', {
        employee_id: employeeId.trim(),
        password,
      });
      if (res?.error) return;
      if (res?.data?.success) {
        const token = res.data?.data?.token;
        const user = res.data?.data?.user;
        if (token) {
          await AsyncStorage.setItem('token', token);
          dispatch(setToken(token));
        }
        if (rememberMe) {
          await AsyncStorage.multiSet([
            [REMEMBER_KEYS.flag, 'true'],
            [REMEMBER_KEYS.employeeId, employeeId.trim()],
            [REMEMBER_KEYS.password, password],
          ]);
        } else {
          await AsyncStorage.multiRemove([
            REMEMBER_KEYS.flag,
            REMEMBER_KEYS.employeeId,
            REMEMBER_KEYS.password,
          ]);
        }
        if (user) dispatch(setUserData(user));
        ToastMessage(res.data?.message || 'Login successful.', 'success');
        navigation.getParent()?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'MainStack'}],
          }),
        );
      } else {
        console.log('Login failed:', res?.error);
      }
    } catch (err) {
      console.log('Uni staff login error:', err);
      ToastMessage('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
            onChangeText={setEmployeeId}
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
          {/* <CustomText
            label="Forgot Password"
            removeTranslation
            fontSize={12}
            fontFamily={fonts.regular}
            color={COLORS.primaryColor}
            onPress={handleForgotPassword}
          /> */}
        </View>

        <GradientButton
          title="Sign In"
          onPress={handleSignIn}
          marginTop={10}
          marginBottom={20}
          borderRadius={30}
          color="#ffffff"
          loading={loading}
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
