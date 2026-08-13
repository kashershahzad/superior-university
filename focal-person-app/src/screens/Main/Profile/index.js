import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useNavigation,
  CommonActions,
  useIsFocused,
} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import UploadImage from '../../../components/UploadImage';

import {logout} from '../../../store/reducer/AuthConfig';
import {setUserData} from '../../../store/reducer/usersSlice';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import {Images} from '../../../assets/images';
import {get, post} from '../../../services/ApiRequest';
import {endPoints} from '../../../services/ENV';
import {ToastMessage} from '../../../utils/ToastMessage';

const ACCOUNT_ROW_CONFIG = [
  {
    key: 'personal-data',
    Icons: Images.user,
    label: 'Personal Data',
    showArrow: true,
    actionKey: 'personal-data',
    flag: 'personal_data',
  },
  {
    key: 'assigned-routes',
    Icons: Images.folder,
    label: 'Assigned Routes',
    showArrow: true,
    actionKey: 'assigned-routes',
    flag: 'assigned_routes',
  },
  {
    key: 'attendance-history',
    Icons: Images.review,
    label: 'Attendance History',
    showArrow: true,
    actionKey: 'attendance-history',
    flag: 'attendance_history',
  },
];

const SETTINGS_ROW_CONFIG = [
  {
    key: 'password',
    Icons: Images.passwordforget,
    label: 'Change Password',
    showArrow: true,
    actionKey: 'password',
    flag: 'change_password',
  },
  {
    key: 'faq',
    Icons: Images.faqs,
    label: 'FAQ and Help',
    showArrow: true,
    actionKey: 'faq',
    flag: 'faq_and_help',
  },
  {
    key: 'logout',
    Icons: Images.logout1,
    label: 'Logout',
    showArrow: true,
    actionKey: 'logout',
    flag: 'logout',
  },
];

const ProfileRow = ({item, onPress}) => {
  const rowLabel = item.label || '';
  const badgeText = item.badge?.text || '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.rowContainer}>
      <View style={styles.rowLeft}>
        <Image source={item.Icons} style={{width: 18, height: 18}} />
        <CustomText
          label={rowLabel}
          fontFamily={fonts.medium}
          fontSize={11}
          color="#4F5464"
          lineHeight={20}
          removeTranslation
        />
      </View>

      {item.badge ? (
        <View
          style={[
            styles.badge,
            item.badge.variant === 'danger'
              ? styles.dangerBadge
              : styles.primaryBadge,
          ]}>
          <CustomText
            label={badgeText}
            removeTranslation
            fontFamily={fonts.bold}
            fontSize={10}
            color={item.badge.variant === 'danger' ? '#EB5757' : COLORS.white}
            lineHeight={16}
            letterSpacing={0.15}
          />
        </View>
      ) : null}

      {item.showArrow ? (
        <Image source={Images.rightArrow} style={{width: 16, height: 16}} />
      ) : null}
    </TouchableOpacity>
  );
};

const ProfileSection = ({title, rows, onRowPress}) => {
  const renderProfileRow = ({item}) => {
    return (
      <View>
        <ProfileRow
          item={item}
          onPress={item.actionKey ? () => onRowPress(item.actionKey) : undefined}
        />
      </View>
    );
  };

  if (!rows?.length) return null;

  return (
    <View style={styles.sectionWrap}>
      <CustomText
        label={title}
        removeTranslation
        color="#344054"
        fontFamily={fonts.semiBold}
        fontSize={12}
      />
      <View style={styles.sectionCard}>
        <FlatList
          data={rows}
          keyExtractor={item => item.key}
          renderItem={renderProfileRow}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

const Profile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [profile, setProfile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await get('uni-staff/profile');

      if (res?.error) return;

      if (res?.data?.success) {
        setProfile(res.data.data);
      } else {
        ToastMessage(res?.data?.message || 'Failed to load profile', 'error');
      }
    } catch (err) {
      console.log('Profile error:', err);
      ToastMessage('Failed to load profile', 'error');
    }
  };

  const uploadProfilePhoto = async file => {
    const uri = file?.path || file?.uri;
    if (!uri || uploadingPhoto) return;

    if (file?.size && file.size > 2 * 1024 * 1024) {
      ToastMessage('Image must be 2MB or less', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('profile_photo', {
        uri,
        type: file?.mime || 'image/jpeg',
        name: file?.filename || `profile_photo_${Date.now()}.jpg`,
      });

      const res = await axios.post(
        `${endPoints.BASE_URL}uni-staff/profile/photo`,
        formData,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (res?.data?.success) {
        const photoUrl = res.data?.data?.profile_photo;
        setProfile(prev =>
          prev
            ? {
                ...prev,
                profile_photo: photoUrl,
              }
            : prev,
        );
        ToastMessage(
          res.data?.message || 'Profile image updated.',
          'success',
        );
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to update profile image',
          'error',
        );
      }
    } catch (err) {
      console.log('Profile photo upload error:', err);
      const errorMessage =
        err?.response?.data?.message || 'Failed to update profile image';
      ToastMessage(errorMessage, 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchProfile();
  }, [isFocused]);

  const contactRows = useMemo(() => {
    const email = profile?.contact?.email || profile?.email;
    const phone = profile?.contact?.phone || profile?.phone;
    const rows = [];

    if (email) {
      rows.push({
        key: 'email',
        Icons: Images.email,
        label: email,
      });
    }
    if (phone) {
      rows.push({
        key: 'phone',
        Icons: Images.phone,
        label: phone,
      });
    }
    return rows;
  }, [profile]);

  const accountRows = useMemo(() => {
    const flags = profile?.account || {};
    return ACCOUNT_ROW_CONFIG.filter(row => flags[row.flag]);
  }, [profile]);

  const settingsRows = useMemo(() => {
    const flags = profile?.settings || {};
    return SETTINGS_ROW_CONFIG.filter(row => flags[row.flag]);
  }, [profile]);

  const sectionData = useMemo(
    () =>
      [
        {key: 'contact', title: 'CONTACT', rows: contactRows},
        {key: 'account', title: 'ACCOUNT', rows: accountRows},
        {key: 'settings', title: 'SETTINGS', rows: settingsRows},
      ].filter(section => section.rows.length > 0),
    [contactRows, accountRows, settingsRows],
  );

  const avatarSource = profile?.profile_photo
    ? {uri: profile.profile_photo}
    : Images.profileimage;

  const handleRowPress = async actionKey => {
    if (actionKey === 'assigned-routes') {
      navigation.navigate('AssignedRoutes');
      return;
    }
    if (actionKey === 'attendance-history') {
      navigation.navigate('AttendanceHistory');
      return;
    }
    if (actionKey === 'password') {
      navigation.navigate('ChangePassword');
    }
    if (actionKey === 'faq') {
      navigation.navigate('Help');
    }
    if (actionKey === 'personal-data') {
      navigation.navigate('PersonalData');
    }
    if (actionKey === 'logout') {
      try {
        const res = await post('auth/logout');
        if (res?.error) return;
        if (res?.data?.success) {
          ToastMessage(
            res.data?.message || 'Logged out successfully.',
            'success',
          );
          await AsyncStorage.multiRemove(['token', 'refreshToken']);
          dispatch(logout());
          dispatch(setUserData({}));
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'AuthStack'}],
            }),
          );
        } else {
          ToastMessage(res?.data?.message || 'Logout failed', 'error');
        }
      } catch (err) {
        console.log('Logout error:', err);
        ToastMessage('Logout failed. Please try again.', 'error');
      }
    }
  };

  return (
    <ScreenWrapper
      paddingHorizontal={0}
      statusBarColor={COLORS.primaryColor}
      barStyle="light-content">
      <View style={styles.topBackground} />
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }
            navigation.navigate('Home');
          }}>
          <ImageFast
            source={Images.backArrow}
            style={{width: 16, height: 16}}
          />
        </TouchableOpacity>
        <CustomText
          label="My Profile"
          removeTranslation
          color={COLORS.white}
          fontFamily={fonts.semiBold}
          fontSize={18}
        />
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contentCard}>
        <View style={styles.avatarWrap} pointerEvents="box-none">
          <UploadImage
            options={{
              cropping: true,
              width: 400,
              height: 400,
              cropperCircleOverlay: false,
              compressImageQuality: 0.8,
            }}
            handleChange={result => {
              uploadProfilePhoto(result);
            }}
            renderButton={openPickerModal => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={uploadingPhoto ? undefined : openPickerModal}
                disabled={uploadingPhoto}
                style={styles.avatarTouch}>
                <Image
                  source={avatarSource}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />

          <View style={styles.nameRow}>
            <CustomText
              label={profile?.name || ''}
              removeTranslation
              color="#101828"
              fontFamily={fonts.semiBold}
              fontSize={18}
            />
            {profile?.is_verified ? (
              <Image source={Images.verify} style={{width: 18, height: 18}} />
            ) : null}
          </View>
          <CustomText
            label={profile?.role_label || ''}
            removeTranslation
            color={COLORS.primaryColor}
            fontFamily={fonts.medium}
            fontSize={13}
          />
        </View>

        <View style={styles.scrollClip}>
          <FlatList
            style={styles.contentFlatList}
            data={sectionData}
            keyExtractor={item => item.key}
            renderItem={({item}) => (
              <ProfileSection
                title={item.title}
                rows={item.rows}
                onRowPress={handleRowPress}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  topBackground: {
    position: 'absolute',
    top: -220,
    left: -95,
    width: 579,
    height: 845,
    borderRadius: 160,
    backgroundColor: COLORS.primaryColor,
  },
  headerRow: {
    marginTop: 50,
    paddingHorizontal: 16,
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  avatarTouch: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  nameRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentCard: {
    flex: 1,
    marginTop: 86,
    position: 'relative',
  },
  scrollClip: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 15,
    paddingTop: 138,
  },
  contentFlatList: {
    flex: 1,
  },
  contentList: {
    paddingBottom: 24,
    gap: 20,
  },
  sectionWrap: {
    gap: 8,
  },
  sectionCard: {
    borderRadius: 12,
    backgroundColor: '#FAFAFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowContainer: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  primaryBadge: {
    backgroundColor: '#6F1A73',
  },
  dangerBadge: {
    backgroundColor: '#FFE7E7',
  },
});
