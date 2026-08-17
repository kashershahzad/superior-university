import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useEffect, useRef, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import {COLORS} from '../../../utils/COLORS';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';
import CustomInput from '../../../components/CustomInput';
import {get, put} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  badge_number: '',
  shift_start: '',
  shift_end: '',
};

const PersonalData = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [form, setForm] = useState(EMPTY_FORM);
  const [updating, setUpdating] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const badgeRef = useRef(null);
  const shiftStartRef = useRef(null);
  const shiftEndRef = useRef(null);
  const scrollRef = useRef(null);
  const fieldY = useRef({});
  const focusedField = useRef(null);
  const keyboardVisible = useRef(false);

  const scrollToField = key => {
    if (key === 'shift_end') {
      scrollRef.current?.scrollToEnd({animated: true});
      return;
    }
    const y = fieldY.current[key];
    if (y == null) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, y - 12),
      animated: true,
    });
  };

  const handleFieldFocus = key => {
    focusedField.current = key;
    if (keyboardVisible.current) {
      scrollToField(key);
      return;
    }
    setTimeout(() => scrollToField(key), Platform.OS === 'ios' ? 80 : 280);
  };

  const syncForm = data => {
    setForm({
      name: data?.name || '',
      email: data?.email || '',
      phone: data?.phone || '',
      badge_number: data?.badge_number || '',
      shift_start: data?.shift_start || '',
      shift_end: data?.shift_end || '',
    });
  };

  const updateField = (key, value) => {
    setForm(prev => ({...prev, [key]: value}));
  };

  const fetchPersonalData = async () => {
    try {
      const res = await get('uni-staff/profile/personal-data');

      if (res?.error) return;

      if (res?.data?.success) {
        syncForm(res.data.data);
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to load personal data',
          'error',
        );
      }
    } catch (err) {
      console.log('Personal data error:', err);
      ToastMessage('Failed to load personal data', 'error');
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchPersonalData();
  }, [isFocused]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      keyboardVisible.current = true;
      setKeyboardHeight(e.endCoordinates?.height || 280);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardVisible.current = false;
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!keyboardHeight || !focusedField.current) return;
    const timer = setTimeout(() => scrollToField(focusedField.current), 80);
    return () => clearTimeout(timer);
  }, [keyboardHeight]);

  const handleUpdate = async () => {
    if (updating) return;

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      ToastMessage('Please fill name, email and phone', 'error');
      return;
    }

    setUpdating(true);
    try {
      const res = await put('uni-staff/profile/personal-data', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        badge_number: form.badge_number.trim(),
        shift_start: form.shift_start.trim() || null,
        shift_end: form.shift_end.trim() || null,
      });

      if (res?.error) return;

      if (res?.data?.success) {
        syncForm(res.data.data);
        ToastMessage(
          res.data?.message || 'Personal data updated.',
          'success',
        );
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to update personal data',
          'error',
        );
      }
    } catch (err) {
      console.log('Update personal data error:', err);
      ToastMessage('Failed to update personal data', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="transparent"
      translucent
      footerUnScrollable={() => {
        return (
          <View style={styles.footerContainer}>
            <GradientButton
              title="Update"
              loading={updating}
              onPress={handleUpdate}
            />
          </View>
        );
      }}
      headerUnScrollable={() => {
        return (
          <View
            style={[
              styles.headerWrapper,
              {marginTop: -insets.top, paddingTop: insets.top},
            ]}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.backButton}
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                    return;
                  }
                  navigation.navigate('Profile');
                }}>
                <ImageFast
                  source={Images.backArrow}
                  style={{width: 18, height: 18}}
                />
              </TouchableOpacity>
              <CustomText
                label="Personal Data"
                fontSize={16}
                fontFamily={fonts.bold}
                color="#101828"
              />
            </View>
          </View>
        );
      }}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.container,
            {paddingBottom: keyboardHeight > 0 ? keyboardHeight + 24 : 24},
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View
            onLayout={e => {
              fieldY.current.name = e.nativeEvent.layout.y;
            }}>
            <CustomInput
              ref={nameRef}
              placeholder="Enter Your Full Name"
              value={form.name}
              onChangeText={text => updateField('name', text)}
              withLabel="Full Name"
              borderColor="#98A2B3"
              iconName="user"
              returnKeyType="next"
              blurOnSubmit={false}
              isFocus={() => handleFieldFocus('name')}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>

          <View
            onLayout={e => {
              fieldY.current.email = e.nativeEvent.layout.y;
            }}>
            <CustomInput
              ref={emailRef}
              placeholder="Enter Email"
              value={form.email}
              onChangeText={text => updateField('email', text)}
              withLabel="Email"
              borderColor="#98A2B3"
              icon={Images.email}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              isFocus={() => handleFieldFocus('email')}
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          </View>

          <View
            onLayout={e => {
              fieldY.current.phone = e.nativeEvent.layout.y;
            }}>
            <CustomInput
              ref={phoneRef}
              placeholder="Enter Phone"
              value={form.phone}
              onChangeText={text => updateField('phone', text)}
              withLabel="Phone"
              borderColor="#98A2B3"
              icon={Images.phone}
              keyboardType="phone-pad"
              returnKeyType="next"
              blurOnSubmit={false}
              isFocus={() => handleFieldFocus('phone')}
              onSubmitEditing={() => badgeRef.current?.focus()}
            />
          </View>

          <View
            onLayout={e => {
              fieldY.current.badge_number = e.nativeEvent.layout.y;
            }}>
            <CustomInput
              ref={badgeRef}
              placeholder="Enter Badge Number"
              value={form.badge_number}
              onChangeText={text => updateField('badge_number', text)}
              withLabel="Badge Number"
              borderColor="#98A2B3"
              icon={Images.semester}
              returnKeyType="next"
              blurOnSubmit={false}
              isFocus={() => handleFieldFocus('badge_number')}
              onSubmitEditing={() => shiftStartRef.current?.focus()}
            />
          </View>

          <View
            onLayout={e => {
              fieldY.current.shift_start = e.nativeEvent.layout.y;
            }}>
            <CustomInput
              ref={shiftStartRef}
              placeholder="Shift Start (HH:MM)"
              value={form.shift_start}
              onChangeText={text => updateField('shift_start', text)}
              withLabel="Shift Start"
              borderColor="#98A2B3"
              icon={Images.semester}
              returnKeyType="next"
              blurOnSubmit={false}
              isFocus={() => handleFieldFocus('shift_start')}
              onSubmitEditing={() => shiftEndRef.current?.focus()}
            />
          </View>

          <View
            onLayout={e => {
              fieldY.current.shift_end = e.nativeEvent.layout.y;
            }}>
            <CustomInput
              ref={shiftEndRef}
              placeholder="Shift End (HH:MM)"
              value={form.shift_end}
              onChangeText={text => updateField('shift_end', text)}
              withLabel="Shift End"
              borderColor="#98A2B3"
              icon={Images.semester}
              returnKeyType="done"
              isFocus={() => handleFieldFocus('shift_end')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default PersonalData;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    gap: 84,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 6,
  },
  footerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#D0D5DD',
  },
});
