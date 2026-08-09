import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
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
      scrollEnabled
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
      <View style={styles.container}>
        <CustomInput
          placeholder="Enter Your Full Name"
          value={form.name}
          onChangeText={text => updateField('name', text)}
          withLabel="Full Name"
          borderColor="#98A2B3"
          iconName="user"
        />

        <CustomInput
          placeholder="Enter Email"
          value={form.email}
          onChangeText={text => updateField('email', text)}
          withLabel="Email"
          borderColor="#98A2B3"
          icon={Images.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomInput
          placeholder="Enter Phone"
          value={form.phone}
          onChangeText={text => updateField('phone', text)}
          withLabel="Phone"
          borderColor="#98A2B3"
          icon={Images.phone}
          keyboardType="phone-pad"
        />

        <CustomInput
          placeholder="Enter Badge Number"
          value={form.badge_number}
          onChangeText={text => updateField('badge_number', text)}
          withLabel="Badge Number"
          borderColor="#98A2B3"
          icon={Images.semester}
        />

        <CustomInput
          placeholder="Shift Start (HH:MM)"
          value={form.shift_start}
          onChangeText={text => updateField('shift_start', text)}
          withLabel="Shift Start"
          borderColor="#98A2B3"
          icon={Images.semester}
        />

        <CustomInput
          placeholder="Shift End (HH:MM)"
          value={form.shift_end}
          onChangeText={text => updateField('shift_end', text)}
          withLabel="Shift End"
          borderColor="#98A2B3"
          icon={Images.semester}
        />
      </View>
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
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 6,
  },
  footerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#D0D5DD',
  },
});
