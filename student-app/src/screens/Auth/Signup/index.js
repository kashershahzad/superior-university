import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  Dimensions,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { CommonActions, useFocusEffect } from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import CustomDropDown from '../../../components/CustomDropDown';
import CountryPhoneInput from '../../../components/CountryPhoneInput';
import { post, get } from '../../../services/ApiRequest';
import { registerFcmToken } from '../../../utils/fcm';
import { ToastMessage } from '../../../utils/ToastMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setToken } from '../../../store/reducer/AuthConfig';
import { setUserData } from '../../../store/reducer/usersSlice';

import { COLORS } from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import { Images } from '../../../assets/images';
import Signinmodel from '../Login/Signinmodel';
import SelectRoute from './SelectRoute';
import SelectStop from './SelectStop';
import SelectProgram from './SelectProgram';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const EXTRA_SCROLL = 80;

const ROLE_OPTIONS = [
  {_id: 'teacher', title: 'Teacher'},
  {_id: 'student', title: 'Student'},
];

const initialForm = {
  role: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  studentId: '',
  fullName: '',
  program: '',
  programId: null,
  semester: '',
  department: '',
  designation: '',
  route: '',
  stop: '',
  busNumber: '',
  routeId: null,
  stopId: null,
  busId: null,
};

const Signup = ({ navigation }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [signinModelVisible, setSigninModelVisible] = useState(false);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [programModalVisible, setProgramModalVisible] = useState(false);

  const studentIdRef = useRef(null);
  const fullNameRef = useRef(null);
  const semesterRef = useRef(null);
  const departmentRef = useRef(null);
  const designationRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const scrollViewRef = useRef(null);
  const keyboardTopYRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, e => {
      keyboardTopYRef.current =
        typeof e.endCoordinates?.screenY === 'number'
          ? e.endCoordinates.screenY
          : null;
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      keyboardTopYRef.current = null;
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const scrollInputIntoView = useCallback(input => {
    const node = input?.current ?? input;
    if (!node || typeof node.measureInWindow !== 'function') {
      return;
    }

    requestAnimationFrame(() => {
      node.measureInWindow((_x, y, _width, height) => {
        const scroller = scrollViewRef.current;
        const keyboardTopY = keyboardTopYRef.current;
        if (!scroller || keyboardTopY == null) {
          return;
        }

        const windowHeight = Dimensions.get('window').height;
        const overlap = Math.max(0, windowHeight - keyboardTopY);
        const visibleBottom = windowHeight - overlap - EXTRA_SCROLL;
        const overflow = y + height - visibleBottom;
        if (overflow <= 0) {
          return;
        }

        const nextY = Math.max(0, scrollOffsetRef.current + overflow);
        if (typeof scroller.scrollToPosition === 'function') {
          scroller.scrollToPosition(0, nextY, true);
          return;
        }
        if (typeof scroller.scrollTo === 'function') {
          scroller.scrollTo({ y: nextY, animated: true });
        }
      });
    });
  }, []);

  const focusNext = useCallback(
    nextRef => {
      nextRef?.current?.focus();
      setTimeout(() => {
        scrollInputIntoView(nextRef.current);
      }, 80);
    },
    [scrollInputIntoView],
  );

  const handleFieldFocus = useCallback(() => {
    setTimeout(() => {
      const current = TextInput.State.currentlyFocusedInput?.();
      scrollInputIntoView(current);
    }, 80);
  }, [scrollInputIntoView]);

  const handleSelectRoute = route => {
    Keyboard.dismiss();
    setForm(prev => ({
      ...prev,
      route: route.name,
      routeId: Number(route.id),
      // Route change → reset stop/bus so user picks again
      stop: '',
      stopId: null,
      busId: null,
      busNumber: '',
    }));
    setRouteModalVisible(false);
  };

  const handleSelectStop = async stop => {
    Keyboard.dismiss();
    const routeId = form.routeId;
    updateField('stop', stop.name);
    updateField('stopId', Number(stop.id));
    updateField('busNumber', '');
    updateField('busId', null);
    setStopModalVisible(false);

    if (!routeId) return;
    try {
      const res = await get(`routes/${routeId}/buses`);
      if (res?.data?.success) {
        const autoBus = res.data.data?.auto_bus || res.data.data?.buses?.[0];
        if (autoBus) {
          updateField('busId', Number(autoBus.id));
          updateField(
            'busNumber',
            autoBus.bus_number || autoBus.display_name || '',
          );
        }
      }
    } catch (err) {
      console.log('Auto bus fetch error:', err);
    }
  };

  const openStopModal = () => {
    Keyboard.dismiss();
    if (!form.routeId) {
      ToastMessage('Please select a route first', 'error');
      return;
    }
    setStopModalVisible(true);
  };

  const handleSelectProgram = program => {
    Keyboard.dismiss();
    setForm(prev => ({
      ...prev,
      program: program.name,
      programId: program.id != null ? program.id : null,
    }));
    setProgramModalVisible(false);
  };

  const handleSigninModel = () => {
    setSigninModelVisible(true);
  };

  const updateField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const isTeacher = form.role === 'teacher';

  const getApiErrorMessage = res =>
    res?.error?.message ||
    res?.error?.data?.message ||
    res?.data?.message ||
    'Something went wrong';

  const buildStep1Payload = useCallback(() => {
    const base = {
      role: form.role,
      student_id: form.studentId,
      name: form.fullName,
      route_id: form.routeId,
      stop_id: form.stopId,
      ...(form.busId ? {bus_id: form.busId} : {}),
      terms: true,
    };

    if (isTeacher) {
      return {
        ...base,
        department: form.department,
        designation: form.designation,
      };
    }

    return {
      ...base,
      program: form.program,
      semester: form.semester,
    };
  }, [form, isTeacher]);

  const buildRegisterPayload = useCallback(() => {
    const base = {
      role: form.role,
      student_id: form.studentId,
      name: form.fullName,
      route_id: form.routeId,
      stop_id: form.stopId,
      ...(form.busId ? {bus_id: form.busId} : {}),
      email: form.email,
      phone: form.phone,
      password: form.password,
      password_confirmation: form.confirmPassword,
      terms: true,
    };

    if (isTeacher) {
      return {
        ...base,
        department: form.department,
        designation: form.designation,
      };
    }

    return {
      ...base,
      program: form.program,
      semester: form.semester,
    };
  }, [form, isTeacher]);

  useFocusEffect(
    useCallback(() => {
      setStep(1);
    }, []),
  );

  // const handleNext = useCallback(() => {
  //   setStep(2);
  // }, []);

  const handleNext = useCallback(async () => {
    if (!form.role) {
      ToastMessage('Please select a role', 'error');
      return;
    }

    const missingTeacherFields =
      !form.studentId ||
      !form.fullName ||
      !form.department ||
      !form.designation ||
      !form.routeId ||
      !form.stopId;

    const missingStudentFields =
      !form.studentId ||
      !form.fullName ||
      !form.program ||
      !form.semester ||
      !form.routeId ||
      !form.stopId;

    if (isTeacher ? missingTeacherFields : missingStudentFields) {
      ToastMessage(
        isTeacher
          ? 'Please fill all teacher details'
          : 'Please fill all student details',
        'error',
      );
      return;
    }

    setLoading(true);
    try {
      const payload = buildStep1Payload();

      const res = await post('auth/register/validate', payload);
      console.log('payload', payload);
      console.log('res', res);

      if (res?.error) {
        return;
      }

      if (res?.data?.success && res?.data?.data?.valid) {
        updateField('route', res.data.data.route?.name || form.route);
        updateField(
          'busNumber',
          res.data.data.bus?.bus_number || form.busNumber,
        );
        if (res.data.data.stop?.name) {
          updateField('stop', res.data.data.stop.name);
        }
        if (res.data.data.stop?.id) {
          updateField('stopId', Number(res.data.data.stop.id));
        }
        if (res.data.data.bus?.id) {
          updateField('busId', Number(res.data.data.bus.id));
        }
        ToastMessage(res.data.message || 'Step 1 validated.', 'success');
        setStep(2);
      } else {
        ToastMessage(getApiErrorMessage(res), 'error');
      }
    } catch (err) {
      console.log('Step1 validate error:', err);
    } finally {
      setLoading(false);
    }
  }, [form, isTeacher, buildStep1Payload, updateField]);

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

    setLoading(true);
    try {
      const payload = buildRegisterPayload();

      const res = await post('auth/register', payload);
      console.log('register', res);

      if (res?.error) {
        return;
      }

      if (res?.data?.success) {
        const token = res.data?.data?.token; // important: data.token
        const user = res.data?.data?.user;

        if (token) {
          await AsyncStorage.setItem('token', token);
          dispatch(setToken(token));
        }

        if (user) {
          dispatch(setUserData({...user, role: user.role || form.role}));
        } else if (form.role) {
          dispatch(setUserData({role: form.role}));
        }

        await registerFcmToken();

        ToastMessage(
          res.data?.message || 'Registration successful.',
          'success',
        );

        navigation.getParent()?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainStack' }],
          }),
        );
      } else {
        ToastMessage(getApiErrorMessage(res), 'error');
      }
    } catch (err) {
      console.log('Register error:', err);
      ToastMessage('Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [form, buildRegisterPayload, dispatch, navigation]);

  const renderRoleDropdown = () => (
    <CustomDropDown
      data={ROLE_OPTIONS}
      value={ROLE_OPTIONS.find(item => item._id === form.role)?.title || ''}
      setValue={option => {
        const nextRole = option?._id || option;
        setForm(prev => ({
          ...prev,
          role: nextRole,
          program: '',
          programId: null,
          semester: '',
          department: '',
          designation: '',
        }));
      }}
      placeholder="Select Role"
      withLabel="Role"
      borderColor="#98A2B3"
      iconName="users"
      marginBottom={20}
    />
  );

  const renderTeacherFields = () => (
    <>
      <CustomInput
        ref={studentIdRef}
        placeholder="Enter Teacher ID"
        value={form.studentId}
        onChangeText={text => updateField('studentId', text)}
        autoCapitalize="none"
        withLabel="Teacher ID"
        borderColor="#98A2B3"
        icon={Images.studentId}
        returnKeyType="next"
        blurOnSubmit={false}
        isFocus={handleFieldFocus}
        onSubmitEditing={() => focusNext(fullNameRef)}
      />

      <CustomInput
        ref={fullNameRef}
        placeholder="Enter Full Name"
        value={form.fullName}
        onChangeText={text => updateField('fullName', text)}
        withLabel="Full Name"
        borderColor="#98A2B3"
        iconName="user"
        returnKeyType="next"
        blurOnSubmit={false}
        isFocus={handleFieldFocus}
        onSubmitEditing={() => focusNext(departmentRef)}
      />

      <CustomInput
        ref={departmentRef}
        placeholder="Enter Department"
        value={form.department}
        onChangeText={text => updateField('department', text)}
        withLabel="Department"
        borderColor="#98A2B3"
        icon={Images.program}
        returnKeyType="next"
        blurOnSubmit={false}
        isFocus={handleFieldFocus}
        onSubmitEditing={() => focusNext(designationRef)}
      />

      <CustomInput
        ref={designationRef}
        placeholder="Enter Designation"
        value={form.designation}
        onChangeText={text => updateField('designation', text)}
        withLabel="Designation"
        borderColor="#98A2B3"
        icon={Images.semester}
        returnKeyType="next"
        isFocus={handleFieldFocus}
        onSubmitEditing={() => {
          Keyboard.dismiss();
          setRouteModalVisible(true);
        }}
      />
    </>
  );

  const renderStudentFields = () => (
    <>
      <CustomInput
        ref={studentIdRef}
        placeholder="Enter Your ID"
        value={form.studentId}
        onChangeText={text => updateField('studentId', text)}
        autoCapitalize="none"
        withLabel="Student ID"
        borderColor="#98A2B3"
        icon={Images.studentId}
        returnKeyType="next"
        blurOnSubmit={false}
        isFocus={handleFieldFocus}
        onSubmitEditing={() => focusNext(fullNameRef)}
      />

      <CustomInput
        ref={fullNameRef}
        placeholder="Enter Your Full Name"
        value={form.fullName}
        onChangeText={text => updateField('fullName', text)}
        withLabel="Full Name"
        borderColor="#98A2B3"
        iconName="user"
        returnKeyType="next"
        blurOnSubmit={false}
        isFocus={handleFieldFocus}
        onSubmitEditing={() => {
          Keyboard.dismiss();
          setProgramModalVisible(true);
        }}
      />

      <CustomInput
        placeholder="Select your Program"
        value={form.program}
        withLabel="Program"
        borderColor="#98A2B3"
        icon={Images.program}
        rightIconName="chevron-right"
        onPress={() => {
          Keyboard.dismiss();
          setProgramModalVisible(true);
        }}
      />

      <CustomInput
        ref={semesterRef}
        placeholder="Enter Semester"
        value={form.semester}
        onChangeText={text => updateField('semester', text)}
        withLabel="Semester"
        borderColor="#98A2B3"
        icon={Images.semester}
        keyboardType="default"
        returnKeyType="next"
        isFocus={handleFieldFocus}
        onSubmitEditing={() => {
          Keyboard.dismiss();
          setRouteModalVisible(true);
        }}
      />
    </>
  );

  const renderRouteFields = () => (
    <>
      <CustomInput
        placeholder="Select your Route"
        value={form.route}
        withLabel="Select Route"
        borderColor="#98A2B3"
        icon={Images.route}
        rightIconName="chevron-right"
        onPress={() => {
          Keyboard.dismiss();
          setRouteModalVisible(true);
        }}
      />

      <CustomInput
        placeholder="Select your Stop"
        value={form.stop}
        withLabel="Select Stop"
        borderColor="#98A2B3"
        icon={Images.route}
        rightIconName="chevron-right"
        onPress={openStopModal}
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

  const renderDetailsFields = () => (
    <>
      {renderRoleDropdown()}
      {!form.role ? null : isTeacher ? renderTeacherFields() : renderStudentFields()}
      {form.role ? renderRouteFields() : null}
    </>
  );

  const renderEmailFields = () => (
    <>
      <CustomInput
        ref={emailRef}
        placeholder="yourservo@uni.com"
        value={form.email}
        onChangeText={text => updateField('email', text)}
        autoCapitalize="none"
        withLabel="Email"
        borderColor="#98A2B3"
        iconName="mail"
        keyboardType="email-address"
        returnKeyType="next"
        blurOnSubmit={false}
        isFocus={handleFieldFocus}
        onSubmitEditing={() => focusNext(phoneRef)}
      />

      <CountryPhoneInput
        ref={phoneRef}
        withLabel="Phone Number"
        value={form.phone}
        setValue={text => updateField('phone', text)}
        returnKeyType="next"
        blurOnSubmit={false}
        isFocus={handleFieldFocus}
        onSubmitEditing={() => focusNext(passwordRef)}
      />

      <CustomInput
        ref={passwordRef}
        placeholder="Password"
        value={form.password}
        onChangeText={text => updateField('password', text)}
        withLabel="Password"
        borderColor="#98A2B3"
        icon={Images.password}
        secureTextEntry
        eyeIconColor={COLORS.primaryColor}
        returnKeyType="next"
        blurOnSubmit={false}
        isFocus={handleFieldFocus}
        onSubmitEditing={() => focusNext(confirmPasswordRef)}
      />

      <CustomInput
        ref={confirmPasswordRef}
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChangeText={text => updateField('confirmPassword', text)}
        withLabel="Confirm Password"
        borderColor="#98A2B3"
        icon={Images.password}
        secureTextEntry
        eyeIconColor={COLORS.primaryColor}
        returnKeyType="done"
        isFocus={handleFieldFocus}
        onSubmitEditing={handleSignUp}
      />
    </>
  );

  const isStudentStep = step === 1;

  return (
    <ScreenWrapper
      backgroundColor="#FAFAFA"
      paddingHorizontal={30}
      statusBarColor={COLORS.white}
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
        ref={scrollViewRef}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={EXTRA_SCROLL}
        extraHeight={EXTRA_SCROLL}
        keyboardOpeningTime={0}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={e => {
          scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
        }}
      >
        <View style={styles.header}>
          <Image source={Images.signin_img} style={styles.logo} />
          <CustomText
            label="Registration"
            fontSize={20}
            marginTop={5}
            fontFamily={fonts.semiBold}
          />
          <CustomText
            label={
              isStudentStep
                ? isTeacher
                  ? 'Enter Your Teacher Details'
                  : 'Enter Your Student Details'
                : 'Register Using Your Credentials'
            }
            fontSize={14}
            marginTop={5}
            fontFamily={fonts.regular}
            color="#393B41"
          />
        </View>

        <View style={styles.form}>
          {isStudentStep ? renderDetailsFields() : renderEmailFields()}
        </View>

        <CustomButton
          title={isStudentStep ? 'Next' : 'Sign Up'}
          onPress={isStudentStep ? handleNext : handleSignUp}
          loading={loading}
          marginTop={isStudentStep ? 10 : 36}
          marginBottom={20}
          borderRadius={30}
          color="#ffffff"
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

        <SelectStop
          visible={stopModalVisible}
          onClose={() => setStopModalVisible(false)}
          routeId={form.routeId}
          selectedStopId={form.stopId}
          listType="stops"
          onSelectStop={handleSelectStop}
        />

        <SelectProgram
          visible={programModalVisible}
          onClose={() => setProgramModalVisible(false)}
          selectedProgramId={form.programId}
          selectedProgram={form.program}
          onSelectProgram={handleSelectProgram}
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
    marginBottom: 60,
  },
});
