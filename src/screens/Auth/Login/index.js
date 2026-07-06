import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import jwt_decode from 'jwt-decode';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import DualText from '../../../components/DualText';

import SocialIcon from './molecules/SocialIcon';

import { setLocation, setUserData } from '../../../store/reducer/usersSlice';
import { setToken } from '../../../store/reducer/AuthConfig';
import { ToastMessage } from '../../../utils/ToastMessage';
import GetLocation from '../../../utils/GetLocation';
import { regEmail } from '../../../utils/constants';
import { post } from '../../../services/ApiRequest';
import { COLORS } from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const Login = ({ navigation }) => {
  const dispatch = useDispatch();
  const locationData = GetLocation();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '735961848532-eibai22aakbj22nutl177d7au091vv1o.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  const init = {
    email: '',
    password: '',
  };
  const inits = {
    emailError: '',
    passwordError: '',
  };

  const [GoogleLoading, setGoogleLoading] = useState(false);
  const [AppleLoading, setAppleLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(inits);
  const [state, setState] = useState(init);

  const array = [
    {
      id: 1,
      placeholder: 'Email',
      value: state.email,
      onChange: text => setState({ ...state, email: text }),
      error: errors?.emailError,
      autoCapitalize: 'none',
      keyboardType: 'email-address',
    },
    {
      id: 2,
      placeholder: 'Password',
      value: state.password,
      onChange: text => setState({ ...state, password: text }),
      error: errors?.passwordError,
    },
  ];

  const onGoogleButtonPress = async () => {
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      const FCMTOKEN = await AsyncStorage.getItem('fcmToken');
      const body = {
        name: user?.user?.givenName + ' ' + user?.user?.familyName,
        email: user?.user?.email,
        fcmtoken: FCMTOKEN || '',
      };
      const response = await post('auth/social-login', body);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data?.token);
        dispatch(setToken(response.data?.token));
        dispatch(setUserData(response.data?.user));
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainStack' }],
        });
      }
    } catch (error) {
      console.log('===========error', error);
      ToastMessage(error?.response?.data?.message || 'Sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    // try {
    //   setLoading(true);
    //   const fcmToken = await AsyncStorage.getItem('fcmToken');
    //   const body = {
    //     email: state.email,
    //     password: state.password,
    //     fcmtoken: fcmToken ? fcmToken : '',
    //     type: 'customer',
    //   };
    //   const response = await post('auth', body);
    //   if (response.data?.token) {
    //     await AsyncStorage.setItem('token', response.data?.token);
    //     dispatch(setToken(response.data?.token));
    //     dispatch(setUserData(response.data?.user));
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainStack',
        },
      ],
    });
    //   }
    // } catch (error) {
    //   ToastMessage(error?.response?.data?.message);
    // } finally {
    //   setLoading(false);
    // }
  };

  const errorCheck = useMemo(() => {
    return () => {
      let newErrors = {};
      if (!state.email) newErrors.emailError = 'Please enter Email address';
      else if (!regEmail.test(state.email))
        newErrors.emailError = 'Please enter valid email';
      else if (!state.password)
        newErrors.passwordError = 'Please enter Password';
      else if (state.password.length < 8)
        newErrors.passwordError = 'Password must be 8 digits';
      setErrors(newErrors);
    };
  }, [state]);

  useEffect(() => {
    errorCheck();
  }, [errorCheck]);

  const onAppleButtonPress = async () => {
    setAppleLoading(true);
    const FCMTOKEN = await AsyncStorage.getItem('fcmToken');
    const appleData = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    if (appleData.identityToken) {
      let res;
      if (appleData.email == null || appleData.email == undefined) {
        res = jwt_decode(appleData.identityToken);
      } else {
        res = appleData;
      }
      try {
        const payload = {
          email: res?.email,
          fcmtoken: FCMTOKEN ? FCMTOKEN : '',
          name: res?.fullName?.familyName + res?.fullName?.givenName,
          type: 'customer',
        };
        const response = await post('auth/social-login', payload);
        if (response.data.token) {
          await AsyncStorage.setItem('token', response.data?.token);
          dispatch(setToken(response.data?.token));
          dispatch(setUserData(response.data?.user));
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'MainStack',
              },
            ],
          });
          setGoogleLoading(false);
        }
      } catch (error) {
        ToastMessage(error.response.data.message);
        setAppleLoading(false);
      }
    } else {
      ToastMessage('An error has occurred. Please try again later.');
      setAppleLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setLocation(locationData));
  }, [locationData]);

  return (
    <ScreenWrapper
      scrollEnabled
      backgroundColor={COLORS.white}
      statusBarColor={COLORS.white}
      footerUnScrollable={() => (
        <DualText
          title="Don’t have an account?"
          secondTitle=" Sign up"
          marginTop={16}
          marginBottom={20}
          onPress={() => navigation.navigate('Signup')}
        />
      )}
    >
      <CustomText
        label="Login to your Account"
        fontFamily={fonts.bold}
        fontSize={38}
        marginTop={40}
        marginBottom={30}
        lineHeight={60}
      />

      {array?.map(item => (
        <CustomInput
          key={item?.id}
          placeholder={item.placeholder}
          value={item.value}
          onChangeText={item.onChange}
          autoCapitalize={item.autoCapitalize}
          error={item.error}
          withLabel={item.withLabel}
          secureTextEntry={item.id === 2}
          mailIcon={item.id == 1}
          lockIcon={item.id == 2}
          keyboardType={item.keyboardType}
        />
      ))}
      <CustomText
        label="forgot Password?"
        fontFamily={fonts.semiBold}
        alignSelf="flex-end"
        marginBottom={25}
        marginTop={-10}
        onPress={() => navigation.navigate('ForgetPass')}
      />

      <CustomButton
        title="Sign in"
        onPress={handleLogin}
        loading={loading}
        disabled={Object.keys(errors).some(key => errors[key] !== '')}
        marginBottom={40}
      />
      <View style={styles.row}>
        <View style={styles.line} />
        <CustomText
          label="or continue with"
          alignSelf="center"
          fontFamily={fonts.semiBold}
          fontSize={16}
        />
        <View style={styles.line} />
      </View>
      <SocialIcon
        googlePress={onGoogleButtonPress}
        applePress={onAppleButtonPress}
        googleLoading={GoogleLoading}
        appleLoading={AppleLoading}
        indicatorColor
      />
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  line: {
    width: '28%',
    height: 1,
    backgroundColor: COLORS.border,
  },
});
