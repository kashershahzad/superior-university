import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CommonActions, useFocusEffect } from '@react-navigation/native';

import ImageFast from '../../../components/ImageFast';
import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import CustomCheckbox from '../../../components/CustomCheckBox';
import DualText from '../../../components/DualText';
import CountryPhoneInput from '../../../components/CountryPhoneInput';
import { post } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setToken } from '../../../store/reducer/AuthConfig';

import { COLORS } from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import { Images } from '../../../assets/images';
import Signinmodel from '../Login/Signinmodel';
import SelectRoute from './SelectRoute';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const initialForm = {
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  studentId: '',
  fullName: '',
  program: '',
  semester: '',
  route: '',
  busNumber: '',
  routeId: null,
};

const Signup = ({ navigation }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signinModelVisible, setSigninModelVisible] = useState(false);
  const [routeModalVisible, setRouteModalVisible] = useState(false);

  const handleSelectRoute = (route) => {
    updateField('route', route.name);
    updateField('routeId', Number(route.id));
    updateField('busNumber', route.busNumber);
    setRouteModalVisible(false);
  };

  const handleSigninModel = () => {
    setSigninModelVisible(true);
  };

  const updateField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setStep(1);
    }, []),
  );

  // const handleNext = useCallback(() => {
  //   setStep(2);
  // }, []);

  const handleNext = useCallback(async () => {
    if (!form.studentId || !form.fullName || !form.program || !form.semester || !form.routeId) {
      ToastMessage('Please fill all student details', 'error');
      return;
    }
    if (!agreed) {
      ToastMessage('Please accept terms & conditions', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        student_id: form.studentId,
        name: form.fullName,
        program: form.program,
        semester: form.semester,
        route_id: form.routeId,
        terms: agreed,
      };

      const res = await post('auth/register/validate', payload);

      if (res?.data?.success && res?.data?.data?.valid) {
        updateField('route', res.data.data.route?.name || form.route);
        updateField('busNumber', res.data.data.bus?.bus_number || form.busNumber);
        ToastMessage(res.data.message || 'Step 1 validated.', 'success');
        setStep(2);
      } else {
        ToastMessage(res?.data?.message || 'Validation failed', 'error');
      }
    } catch (err) {
      console.log('Step1 validate error:', err);
    } finally {
      setLoading(false);
    }
  }, [form, agreed, updateField]);

  // const handleSignUp = useCallback(() => {
  //   setLoading(true);
  //   setTimeout(() => setLoading(false), 500);
  //   navigation.getParent()?.dispatch(
  //     CommonActions.reset({
  //       index: 0,
  //       routes: [{ name: 'MainStack' }],
  //     }),
  //   );
  // }, []);

  const handleSignUp = useCallback(async () => {
    if (!form.email || !form.phone || !form.password || !form.confirmPassword) {
      ToastMessage('Please fill all fields', 'error');
      return;
    }
  
    if (form.password !== form.confirmPassword) {
      ToastMessage('Passwords do not match', 'error');
      return;
    }
  
    if (!agreed) {
      ToastMessage('Please accept terms & conditions', 'error');
      return;
    }
  
    setLoading(true);
    try {
      const payload = {
        student_id: form.studentId,
        name: form.fullName,
        program: form.program,
        semester: form.semester,
        route_id: form.routeId,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.confirmPassword,
        terms: agreed,
      };
  
      const res = await post('auth/register', payload);
  
      if (res?.data?.success) {
        const token = res.data?.data?.token; // important: data.token
  
        if (token) {
          await AsyncStorage.setItem('token', token);
          dispatch(setToken(token));
        }
  
        ToastMessage(res.data?.message || 'Registration successful.', 'success');
  
        navigation.getParent()?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainStack' }],
          }),
        );
      } else {
        ToastMessage(res?.data?.message || 'Registration failed', 'error');
      }
    } catch (err) {
      console.log('Register error:', err);
      ToastMessage('Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [form, agreed, dispatch, navigation]);

  const renderStudentCardFields = () => (
    <>
      <CustomInput
        placeholder="Enter Your ID"
        value={form.studentId}
        onChangeText={text => updateField('studentId', text)}
        autoCapitalize="none"
        withLabel="Student ID"
        borderColor="#98A2B3"
        icon={Images.studentId}
      />

      <CustomInput
        placeholder="Enter Your Full Name"
        value={form.fullName}
        onChangeText={text => updateField('fullName', text)}
        withLabel="Full Name"
        borderColor="#98A2B3"
        iconName="user"
      />

      <CustomInput
        placeholder="Enter Program"
        value={form.program}
        onChangeText={text => updateField('program', text)}
        withLabel="Program"
        borderColor="#98A2B3"
        icon={Images.program}
      />

      <CustomInput
        placeholder="Enter Semester"
        value={form.semester}
        onChangeText={text => updateField('semester', text)}
        withLabel="Semester"
        borderColor="#98A2B3"
        icon={Images.semester}
        keyboardType="numeric"
      />

      <CustomInput
        placeholder="Select your Route"
        value={form.route}
        withLabel="Select Route"
        borderColor="#98A2B3"
        icon={Images.route}
        rightIconName="chevron-right"
        onPress={() => setRouteModalVisible(true)}
      />

      <CustomInput
        placeholder="Bus No"
        value={form.busNumber}
        withLabel="Bus Number (auto)"
        borderColor="#98A2B3"
        icon={Images.busIcon}
        editable={false}
      />
    </>
  );

  const renderEmailFields = () => (
    <>
      <CustomInput
        placeholder="yourservo@uni.com"
        value={form.email}
        onChangeText={text => updateField('email', text)}
        autoCapitalize="none"
        withLabel="Email"
        borderColor="#98A2B3"
        iconName="mail"
        keyboardType="email-address"
      />

      <CountryPhoneInput
        withLabel="Phone Number"
        value={form.phone}
        setValue={text => updateField('phone', text)}
      />

      <CustomInput
        placeholder="Password"
        value={form.password}
        onChangeText={text => updateField('password', text)}
        withLabel="Password"
        borderColor="#98A2B3"
        icon={Images.password}
        secureTextEntry
        eyeIconColor={COLORS.primaryColor}
      />

      <CustomInput
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChangeText={text => updateField('confirmPassword', text)}
        withLabel="Confirm Password"
        borderColor="#98A2B3"
        icon={Images.password}
        secureTextEntry
        eyeIconColor={COLORS.primaryColor}
      />
    </>
  );

  const isStudentStep = step === 1;

  return (
    <ScreenWrapper
      backgroundColor="#FAFAFA"
      paddingHorizontal={30}
      statusBarColor={COLORS.white}
      scrollEnabled
      footerUnScrollable={() =>
        !isStudentStep ? (
          <View style={styles.dualTextContainer}>
            <CustomText
              label="Already have an account?"
              fontSize={12}
              fontFamily={fonts.medium}
              color="#393B41"
            />
            <CustomText
              label=" Sign in here"
              fontSize={12}
              fontFamily={fonts.medium}
              color={COLORS.primaryColor}
              onPress={handleSigninModel}
            />
          </View>
        ) : null
      }
    >
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={25}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <ImageFast source={Images.signin_img} style={styles.logo} />
          <CustomText
            label="Registration"
            fontSize={20}
            marginTop={5}
            fontFamily={fonts.semiBold}
          />
          <CustomText
            label={
              isStudentStep
                ? 'Enter Your Student Details'
                : 'Register Using Your Credentials'
            }
            fontSize={14}
            marginTop={5}
            fontFamily={fonts.regular}
            color="#393B41"
          />
        </View>

        <View style={styles.form}>
          {isStudentStep ? renderStudentCardFields() : renderEmailFields()}
        </View>

        <View style={[styles.termsRow, isStudentStep ? { marginBottom: 10 } : { marginBottom: 36 }]}>
          <CustomCheckbox value={agreed} onValueChange={setAgreed} />
          <Text style={styles.termsText}>
            I agree with{' '}
            <Text style={styles.termsLink}>terms & conditions</Text>
            {' and '}
            <Text style={styles.termsLink}>privacy policy</Text>
          </Text>
        </View>

        <CustomButton
          title={isStudentStep ? 'Next' : 'Sign Up'}
          onPress={isStudentStep ? handleNext : handleSignUp}
          loading={loading}
          marginTop={10}
          marginBottom={20}
          borderRadius={30}
          color='#ffffff'
        />

        {isStudentStep && (
          <View style={styles.dualTextContainer}>
            <CustomText
              label="Already have an account?"
              fontSize={12}
              fontFamily={fonts.medium}
              color="#393B41"
            />
            <CustomText
              label=" Sign in here"
              fontSize={12}
              fontFamily={fonts.medium}
              color={COLORS.primaryColor}
              onPress={handleSigninModel}
            />
          </View>
        )}

        <Signinmodel
          visible={signinModelVisible}
          onClose={() => setSigninModelVisible(false)}
          navigation={navigation}
        />

        <SelectRoute
          visible={routeModalVisible}
          onClose={() => setRouteModalVisible(false)}
          selectedRoute={form.route}
          onSelectRoute={handleSelectRoute}
        />
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
};

export default Signup;

const styles = StyleSheet.create({
  logo: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  header: {
    alignItems: 'center',
    marginTop: '20%',
    marginBottom: 30,
  },
  form: {
    marginTop: 10,
  },
  dualText: {
    width: '100%',
    backgroundColor: 'red',
  },
  dualTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
    color: '#393B41',
    fontFamily: fonts.regular,
  },
  termsLink: {
    fontSize: 12,
    color: COLORS.primaryColor,
    fontFamily: fonts.semiBold,
  },
});
