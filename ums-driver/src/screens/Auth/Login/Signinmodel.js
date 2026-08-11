import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { CommonActions } from '@react-navigation/native';

import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import CustomCheckbox from '../../../components/CustomCheckBox';
import CountryPhoneInput from '../../../components/CountryPhoneInput';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { post } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';
import { setToken } from '../../../store/reducer/AuthConfig';
import { setUserData } from '../../../store/reducer/usersSlice';

import { COLORS } from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import { Images } from '../../../assets/images';
import GradientButton from '../../Main/Home/GradientButton';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const OutlineButton = ({ icon, title, onPress }) => (
  <TouchableOpacity
    style={styles.outlineButton}
    onPress={onPress}
    activeOpacity={0.7}>
    <Image source={icon} style={styles.outlineIcon} />
    <CustomText
      label={title}
      removeTranslation
      color={COLORS.primaryColor}
      fontFamily={fonts.semiBold}
      fontSize={14}
    />
  </TouchableOpacity>
);

const OrRow = () => (
  <View style={styles.orRow}>
    <View style={styles.orLine} />
    <Text style={styles.orText}>OR</Text>
    <View style={styles.orLine} />
  </View>
);

const Signinmodel = ({ visible, onClose, navigation }) => {

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState('student');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setMode('student');
      setLoading(false);
      setStudentId('');
      setEmail('');
      setPhone('');
      setPassword('');
    }
  }, [visible]);

  const handleClose = () => {
    setMode('student');
    onClose?.();
  };

  // const handleSignIn = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);
  //     navigation?.navigate('MainStack');
  //   }, 500);
  // };

  const handleSignIn = async () => {
    if (mode === 'student' && (!studentId || !password)) {
      ToastMessage('Please enter Student ID and Password', 'error');
      return;
    }

    if (mode === 'email' && (!email || !password)) {
      ToastMessage('Please enter Email and Password', 'error');
      return;
    }

    if (mode === 'phone' && (!phone || !password)) {
      ToastMessage('Please enter Phone and Password', 'error');
      return;
    }

    setLoading(true);
    try {
      let res;

      if (mode === 'student') {
        res = await post('auth/student/login', {
          student_id: studentId,
          password,
        });
      } else if (mode === 'email') {
        res = await post('auth/student/login/email', {
          email,
          password,
        });
      } else if (mode === 'phone') {
        res = await post('auth/student/login/phone', {
          phone,
          password,
        });
      }

      if (res?.data?.success) {
        console.log('Login response:', res.data);
        const token = res.data?.data?.token;
        const user = res.data?.data?.user;
        console.log('Login token:', token);
        if (token) {
          await AsyncStorage.setItem('token', token);
          dispatch(setToken(token));
          console.log('Token saved:', await AsyncStorage.getItem('token'));
        }
        if (user) {
          dispatch(setUserData(user));
        }

        ToastMessage(res.data?.message || 'Login successful.', 'success');
        handleClose();

        navigation?.getParent?.()?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainStack' }],
          }),
        );
      } else {
        ToastMessage(res?.data?.message || 'Login failed', 'error');
      }
    } catch (err) {
      console.log('Login error:', err);
      ToastMessage('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 14 }]}>
          <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}>
            <CustomText
              label="Sign In"
              removeTranslation
              fontSize={24}
              fontFamily={fonts.bold}
              color="#101828"
              textAlign="center"
              marginBottom={6}
            />
            <CustomText
              label="Sign in to your account"
              removeTranslation
              fontSize={14}
              fontFamily={fonts.medium}
              color="#475467"
              textAlign="center"
              marginBottom={24}
            />

            {mode === 'student' && (
              <>
                <CustomInput
                  withLabel="Student ID"
                  placeholder="Enter Your ID"
                  value={studentId}
                  onChangeText={setStudentId}
                  autoCapitalize="none"
                  borderColor="#98A2B3"
                  icon={Images.studentId}
                />
                <CustomInput
                  withLabel="Password"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  borderColor="#98A2B3"
                  icon={Images.password}
                  secureTextEntry
                  eyeIconColor={COLORS.primaryColor}
                />
              </>
            )}

            {mode === 'email' && (
              <>
                <CustomInput
                  withLabel="Email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  borderColor="#98A2B3"
                  iconName="mail"
                />
                <CustomInput
                  withLabel="Password"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  borderColor="#98A2B3"
                  icon={Images.password}
                  secureTextEntry
                  eyeIconColor={COLORS.primaryColor}
                />
              </>
            )}

            {mode === 'phone' && (
              <>
                <View style={styles.phoneWrap}>
                  <CountryPhoneInput
                    withLabel="Phone Number"
                    value={phone}
                    setValue={setPhone}
                    borderColor="#98A2B3"
                  />
                </View>
                <CustomInput
                  withLabel="Password"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  borderColor="#98A2B3"
                  icon={Images.password}
                  secureTextEntry
                  eyeIconColor={COLORS.primaryColor}
                />
              </>
            )}

            <View style={styles.rememberRow}>
              <View style={styles.rememberLeft}>
                <CustomCheckbox
                  value={rememberMe}
                  onValueChange={setRememberMe}
                />
                <CustomText
                  label="Remember Me"
                  removeTranslation
                  fontSize={13}
                  color="#393B41"
                  fontFamily={fonts.regular}
                />
              </View>
              <CustomText
                label="Forgot Password"
                removeTranslation
                fontSize={13}
                fontFamily={fonts.semiBold}
                color={COLORS.primaryColor}
                onPress={handleForgotPassword}
              />
            </View>

            <GradientButton
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              borderRadius={30}
              marginTop={8}
              marginBottom={32}
            />

            <OrRow />

            {mode !== 'email' && (
              <OutlineButton
                icon={Images.email2}
                title="Sign in With Email"
                onPress={() => setMode('email')}
              />
            )}
            {mode !== 'phone' && (
              <OutlineButton
                icon={Images.phone}
                title="Sign in With Phone"
                onPress={() => setMode('phone')}
              />
            )}
            {mode !== 'student' && (
              <OutlineButton
                icon={Images.studentId}
                title="Sign in With Student ID"
                onPress={() => setMode('student')}
              />
            )}

            <View style={styles.dualTextContainer}>
              <CustomText
                label="Don't have an account?"
                removeTranslation
                fontSize={12}
                fontFamily={fonts.medium}
                color="#393B41"
              />
              <CustomText
                label=" Sign up here"
                removeTranslation
                fontSize={12}
                fontFamily={fonts.medium}
                color={COLORS.primaryColor}
                onPress={handleClose}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal >
  );
};

export default Signinmodel;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 19, 33, 0.87)',
    justifyContent: 'flex-end',
  },
  content: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    alignSelf: 'stretch',
  },
  scrollContent: {
    width: '100%',
  },
  phoneWrap: {
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 24,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E7EC',
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#98A2B3',
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  dualTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.primaryColor,
    backgroundColor: COLORS.white,
    marginBottom: 12,
    gap: 10,
  },
  outlineIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});