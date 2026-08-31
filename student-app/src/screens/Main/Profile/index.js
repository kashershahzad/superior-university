import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/reducer/AuthConfig';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';
import { setUserData } from '../../../store/reducer/usersSlice';
import { store } from '../../../store';

import { COLORS } from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

import { Images } from '../../../assets/images';
import ImageFast from '../../../components/ImageFast';
import UploadImage from '../../../components/UploadImage';

const ProfileRow = ({ item, onPress }) => {
  const rowLabel = item.label || '';
  const badgeText = item.badge?.text || '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.rowContainer}>
      <View style={styles.rowLeft}>
        <Image source={item.Icons} style={{ width: 18, height: 18 }} />
        <CustomText
          label={rowLabel}
          fontFamily={fonts.medium}
          fontSize={11}
          color="#4F5464"
          lineHeight={20}
        />
      </View>

      {item.badge ? (
        <View
          style={[
            styles.badge,
            item.badge.variant === 'danger'
              ? styles.dangerBadge
              : item.badge.variant === 'success'
                ? styles.successBadge
                : styles.primaryBadge,
          ]}>
          <CustomText
            label={badgeText}
            removeTranslation
            fontFamily={fonts.bold}
            fontSize={10}
            color={item.badge.variant === 'danger' ? '#EB5757' : item.badge.variant === 'success' ? '#719055' : COLORS.white}
            lineHeight={16}
            letterSpacing={0.15}
          />
        </View>
      ) : null}

      {item.showArrow ? (
        <Image source={Images.rightArrow} style={{ width: 16, height: 16 }} />
      ) : null}
    </TouchableOpacity>
  );
};

const ProfileSection = ({ title, rows, onRowPress }) => {
  const renderProfileRow = ({ item }) => {
    return (
      <View>
        <ProfileRow
          item={item}
          onPress={item.actionKey ? () => onRowPress(item.actionKey) : undefined}
        />
      </View>
    );
  };

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

const getFeeBadge = feeStatus => {
  if (feeStatus === 'paid') {
    return { text: 'Paid', variant: 'success' };
  }
  return { text: 'Pending', variant: 'danger' };
};

const Profile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.users);
  const [avatarUri, setAvatarUri] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const role = String(
    profile?.role || userData?.role || '',
  ).toLowerCase();
  const isTeacher = role === 'teacher';

  const fetchProfile = useCallback(async () => {
    try {
      const res = await get('student/profile');
      if (res?.data?.success) {
        const data = res.data.data || null;
        setProfile(data);
        if (data?.role) {
          const currentUser = store.getState()?.users?.userData || {};
          dispatch(
            setUserData({
              ...currentUser,
              ...data,
              role: data.role,
            }),
          );
        }
      }
    } catch (err) {
      console.log('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const uploadProfilePhoto = async result => {
    const uri = result?.path || result?.uri;
    if (!uri || uploadingPhoto) return;

    if (result?.size && result.size > 2 * 1024 * 1024) {
      ToastMessage('Image must be under 2MB', 'error');
      return;
    }

    const mime = result?.mime || 'image/jpeg';
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (result?.mime && !allowed.includes(String(mime).toLowerCase())) {
      ToastMessage('Only JPEG, JPG, PNG or WEBP allowed', 'error');
      return;
    }

    setUploadingPhoto(true);
    setAvatarUri(uri);

    try {
      const formData = new FormData();
      formData.append('profile_photo', {
        uri,
        type: mime,
        name: result?.filename || `profile.${mime.split('/')[1] || 'jpg'}`,
      });

      const res = await post('student/profile/photo', formData);
      // console.log('Profile photo upload response:', res?.data);
      if (res?.data?.success) {
        const photoUrl = res.data.data?.profile_photo;
        // console.log('Profile photo upload successful:', photoUrl);
        if (photoUrl) {
          setAvatarUri(photoUrl);
          setProfile(prev =>
            prev ? {...prev, profile_photo: photoUrl} : prev,
          );
        }
        ToastMessage(
          res.data?.message || 'Profile image updated.',
          'success',
        );
      } else {
        console.log('Profile photo upload failed:', res?.error);
        ToastMessage(res?.error?.message || 'Upload failed', 'error');
      }
    } catch (err) {
      console.log('Profile photo upload error:', err);
      ToastMessage('Upload failed', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRowPress = async actionKey => {
    if (actionKey === 'generate-card') {
      if (generatingCard) return;
      setGeneratingCard(true);
      try {
        const res = await post('student/card/generate');
        if (res?.data?.success) {
          ToastMessage('Your Bus card is ready!', 'success');
          navigation.navigate('GenerateCard');
        } else {
          console.log('Generate card failed:', res?.error);
        }
      } catch (err) {
        console.log('Generate card error:', err);
      } finally {
        setGeneratingCard(false);
      }
      return;
    }
    if (actionKey === 'change-route') {
      navigation.navigate('ChangeRoute');
      return;
    }
    if (actionKey === 'fee-status') {
      const feeStatus =
        profile?.account?.fee_status || profile?.fee_status || 'unpaid';

      if (feeStatus === 'paid') {
        navigation.navigate('Verification', { status: 'success' });
      } else {
        navigation.navigate('Fees', {
          status: feeStatus,
          isMapLocked: true,
          unlockText: 'Pay fee to unlock track',
        });
      }
    }
    if (actionKey === 'password') {
      navigation.navigate('ChangePassword');
    }
    if (actionKey === 'faq') {
      navigation.navigate('Help');
    }
    if (actionKey === 'personal-data') {
      navigation.navigate('PersonalData', { profile });
    }
    if (actionKey === 'logout') {
      try {
        const res = await post('auth/logout');
        if (res?.data?.success) {
          ToastMessage(res.data?.message || 'Logged out successfully', 'success');
        } else {
          ToastMessage(res?.error?.message || 'Logout API failed', 'error');
        }
      } catch (err) {
        console.log('Logout error:', err);
        ToastMessage('Logout failed', 'error');
      } finally {
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        dispatch(logout());
        dispatch(setUserData({}));
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'AuthStack' }],
          }),
        );
      }
    }
  };

  const contactRows = [
    {
      key: 'email',
      Icons: Images.email,
      label: profile?.email || '-',
    },
    {
      key: 'phone',
      Icons: Images.phone,
      label: profile?.phone || '-',
    },
  ];

  const accountRows = [
    profile?.account?.personal_data !== false
      ? {
          key: 'personal-data',
          Icons: Images.user,
          label: 'Personal Data',
          showArrow: true,
          actionKey: 'personal-data',
        }
      : null,
    profile?.account?.generate_card !== false
      ? {
          key: 'generate-card',
          Icons: Images.generateCard,
          label: isTeacher ? 'Teacher Card' : 'Generate Card',
          badge: {
            text: isTeacher ? 'Teacher Card' : 'Generate Card',
            variant: 'primary',
          },
          actionKey: 'generate-card',
        }
      : null,
    !isTeacher
      ? {
          key: 'fee-status',
          Icons: Images.feeStatus,
          label: 'Fee Status',
          badge: getFeeBadge(profile?.account?.fee_status || profile?.fee_status),
          actionKey: 'fee-status',
        }
      : null,
    {
      key: 'change-route',
      Icons: Images.route,
      label: 'Change Route',
      showArrow: true,
      actionKey: 'change-route',
    },
  ].filter(Boolean);

  const settingsRows = [
    profile?.settings?.change_password
      ? {
          key: 'password',
          Icons: Images.passwordforget,
          label: 'Change Password',
          showArrow: true,
          actionKey: 'password',
        }
      : null,
    profile?.settings?.faq_and_help
      ? {
          key: 'faq',
          Icons: Images.faqs,
          label: 'FAQ and Help',
          showArrow: true,
          actionKey: 'faq',
        }
      : null,
    profile?.settings?.logout
      ? {
          key: 'logout',
          Icons: Images.logout,
          label: 'Logout',
          showArrow: true,
          actionKey: 'logout',
        }
      : null,
  ].filter(Boolean);

  const sectionData = [
    { key: 'contact', title: 'CONTACT', rows: contactRows },
    { key: 'account', title: 'ACCOUNT', rows: accountRows },
    { key: 'settings', title: 'SETTINGS', rows: settingsRows },
  ];

  if (loading && !profile) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      </View>
    );
  }

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
          <Image
            source={Images.backArrow}
            style={{ width: 16, height: 16 }}
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
            handleChange={uploadProfilePhoto}
            renderButton={openPickerModal => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={uploadingPhoto ? undefined : openPickerModal}
                disabled={uploadingPhoto}
                style={styles.avatarTouch}>
                {avatarUri || profile?.profile_photo ? (
                  <ImageFast
                    source={{ uri: avatarUri || profile.profile_photo }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={Images.profileimage}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                )}
                {uploadingPhoto ? (
                  <View style={styles.avatarLoader}>
                    <ActivityIndicator color={COLORS.white} />
                  </View>
                ) : null}
              </TouchableOpacity>
            )}
          />

          <View style={styles.nameRow}>
            <CustomText
              label={profile?.name || '-'}
              removeTranslation
              color="#101828"
              fontFamily={fonts.semiBold}
              fontSize={18}
            />
            {profile?.is_verified ? (
              <Image source={Images.verify} style={{ width: 18, height: 18 }} />
            ) : null}
          </View>
          <CustomText
            label={profile?.department || '-'}
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
            renderItem={({ item }) => (
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  avatarLoader: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
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
  successBadge: {
    backgroundColor: '#E7F1D9',
  },
  dangerBadge: {
    backgroundColor: '#FFE7E7',
  },
});
