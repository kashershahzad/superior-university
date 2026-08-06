import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';
import CustomInput from '../../../components/CustomInput';
import { put } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';

const ChangePassword = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      ToastMessage('Current Password is required', 'error');
      return;
    }
    if (!newPassword.trim()) {
      ToastMessage('New Password is required', 'error');
      return;
    }
    if (!confirmPassword.trim()) {
      ToastMessage('Confirm Password is required', 'error');
      return;
    }
    if (newPassword.trim().length < 6) {
      ToastMessage('New Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      ToastMessage('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await put('student/password', {
        current_password: currentPassword.trim(),
        password: newPassword.trim(),
        password_confirmation: confirmPassword.trim(),
      });

      if (res?.data?.success) {
        ToastMessage(res.data?.message || 'Password changed successfully', 'success');
        navigation.goBack();
      } else {
        ToastMessage(res?.error?.message || 'Failed to change password', 'error');
      }
    } catch (err) {
      console.log('Change password error:', err);
      ToastMessage('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('AuthStack', { screen: 'Login' });
  };

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="transparent"
      translucent
      scrollEnabled
      headerUnScrollable={() => {
        return (
          <View
            style={[
              styles.headerWrapper,
              { marginTop: -insets.top, paddingTop: insets.top },
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
                  style={{ width: 18, height: 18 }}
                />
              </TouchableOpacity>
              <CustomText
                label="Change Password"
                fontSize={16}
                fontFamily={fonts.bold}
                color="#101828"
              />
            </View>
          </View>
        );
      }}>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <CustomInput
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={text => setCurrentPassword(text)}
            withLabel="Current Password"
            borderColor="#98A2B3"
            icon={Images.password}
            secureTextEntry
            eyeIconColor={COLORS.primaryColor}
          />

          <CustomInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={text => setNewPassword(text)}
            withLabel="New Password"
            borderColor="#98A2B3"
            icon={Images.password}
            secureTextEntry
            eyeIconColor={COLORS.primaryColor}
          />

          <CustomInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={text => setConfirmPassword(text)}
            withLabel="Confirm Password"
            borderColor="#98A2B3"
            icon={Images.password}
            secureTextEntry
            eyeIconColor={COLORS.primaryColor}
          />
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="Change Password"
            onPress={handleChangePassword}
            loading={loading}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ChangePassword;

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
    gap: 24,
  },
  formContainer: {
    gap: 6,
  },
  buttonContainer: {
    paddingHorizontal: 12,
  },
});
