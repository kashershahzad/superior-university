import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';
import CustomInput from '../../../components/CustomInput';
import { get, put } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';

const PersonalData = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const initialProfile = route.params?.profile;

  const [loading, setLoading] = useState(!initialProfile);
  const [updating, setUpdating] = useState(false);
  const [studentId, setStudentId] = useState(initialProfile?.student_id || '');
  const [fullName, setFullName] = useState(initialProfile?.name || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [program, setProgram] = useState(initialProfile?.department || '');
  const [semester, setSemester] = useState(initialProfile?.semester || '');
  const [session, setSession] = useState(initialProfile?.session || '');
  const [bloodGroup, setBloodGroup] = useState(initialProfile?.blood_group || '');

  const fillForm = data => {
    if (!data) {
      return;
    }
    setStudentId(data.student_id || '');
    setFullName(data.name || '');
    setEmail(data.email || '');
    setPhone(data.phone || '');
    setProgram(data.department || '');
    setSemester(data.semester || '');
    setSession(data.session || '');
    setBloodGroup(data.blood_group || '');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await get('student/profile');
        if (res?.data?.success) {
          fillForm(res.data.data);
        }
      } catch (err) {
        console.log('Personal data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    const fields = [
      { key: 'Student ID', value: studentId },
      { key: 'Full Name', value: fullName },
      { key: 'Email', value: email },
      { key: 'Phone', value: phone },
      { key: 'Program', value: program },
      { key: 'Semester', value: semester },
      { key: 'Session', value: session },
      { key: 'Blood Group', value: bloodGroup },
    ];

    const emptyField = fields.find(field => !String(field.value || '').trim());
    if (emptyField) {
      ToastMessage(`${emptyField.key} is required`, 'error');
      return;
    }

    setUpdating(true);
    try {
      const res = await put('student/profile', {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        program: program.trim(),
        semester: semester.trim(),
        session: session.trim(),
        blood_group: bloodGroup.trim(),
      });

      if (res?.data?.success) {
        ToastMessage(res.data?.message || 'Profile updated', 'success');
        if (res.data?.data) {
          fillForm(res.data.data);
        }
        navigation.goBack();
      } else {
        ToastMessage(res?.error?.message || 'Update failed', 'error');
      }
    } catch (err) {
      console.log('Profile update error:', err);
      ToastMessage('Update failed', 'error');
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
              onPress={handleUpdate}
              loading={updating}
              disabled={loading}
            />
          </View>
        );
      }}
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
                label="Personal Data"
                fontSize={16}
                fontFamily={fonts.bold}
                color="#101828"
              />
            </View>
          </View>
        );
      }}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primaryColor} />
        </View>
      ) : (
        <View style={styles.container}>
          <CustomInput
            placeholder="Enter Your ID"
            value={studentId}
            onChangeText={text => setStudentId(text)}
            autoCapitalize="none"
            withLabel="Student ID"
            borderColor="#98A2B3"
            icon={Images.studentId}
            editable={false}
          />

          <CustomInput
            placeholder="Enter Your Full Name"
            value={fullName}
            onChangeText={text => setFullName(text)}
            withLabel="Full Name"
            borderColor="#98A2B3"
            iconName="user"
          />

          <CustomInput
            placeholder="Enter Email"
            value={email}
            onChangeText={text => setEmail(text)}
            withLabel="Email"
            borderColor="#98A2B3"
            icon={Images.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <CustomInput
            placeholder="Enter Phone"
            value={phone}
            onChangeText={text => setPhone(text)}
            withLabel="Phone"
            borderColor="#98A2B3"
            icon={Images.phone}
            keyboardType="phone-pad"
          />

          <CustomInput
            placeholder="Enter Program"
            value={program}
            onChangeText={text => setProgram(text)}
            withLabel="Program"
            borderColor="#98A2B3"
            icon={Images.program}
          />

          <CustomInput
            placeholder="Enter Semester"
            value={semester}
            onChangeText={text => setSemester(text)}
            withLabel="Semester"
            borderColor="#98A2B3"
            icon={Images.semester}
          />

          <CustomInput
            placeholder="Enter Session"
            value={session}
            onChangeText={text => setSession(text)}
            withLabel="Session"
            borderColor="#98A2B3"
            icon={Images.semester}
          />

          <CustomInput
            placeholder="Enter Blood Group"
            value={bloodGroup}
            onChangeText={text => setBloodGroup(text)}
            withLabel="Blood Group"
            borderColor="#98A2B3"
            iconName="user"
          />
        </View>
      )}
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
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
