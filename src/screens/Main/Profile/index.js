import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';

import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

import {Images} from '../../../assets/images';

const CONTACT_ROWS = [
  {
    key: 'email',
    iconFamily: 'MaterialIcons',
    iconName: 'email',
    label: 'YourServo@uni.com',
  },
  {
    key: 'phone',
    iconFamily: 'Feather',
    iconName: 'phone-call',
    label: '+923457071709',
  },
];

const ACCOUNT_ROWS = [
  {
    key: 'personal-data',
    iconFamily: 'FontAwesome6',
    iconName: 'user',
    label: 'Personal Data',
    showArrow: true,
  },
  {
    key: 'generate-card',
    iconFamily: 'MaterialCommunityIcons',
    iconName: 'card-account-details-outline',
    label: 'Generate Card',
    badge: {text: 'Generate Card', variant: 'primary'},
  },
  {
    key: 'fee-status',
    iconFamily: 'MaterialIcons',
    iconName: 'receipt-long',
    label: 'Fee Status',
    badge: {text: 'Pending', variant: 'danger'},
  },
];

const SETTINGS_ROWS = [
  {
    key: 'password',
    iconFamily: 'MaterialIcons',
    iconName: 'lock-outline',
    label: 'Change Password',
    showArrow: true,
  },
  {
    key: 'faq',
    iconFamily: 'MaterialIcons',
    iconName: 'help-outline',
    label: 'FAQ and Help',
    showArrow: true,
  },
  {
    key: 'logout',
    iconFamily: 'MaterialIcons',
    iconName: 'logout',
    label: 'Logout',
    iconColor: '#F14E4E',
    showArrow: true,
  },
];

const ProfileRow = ({item, onPress}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.rowContainer}
      disabled={!onPress}>
      <View style={styles.rowLeft}>
        <Icons
          family={item.iconFamily}
          name={item.iconName}
          color={item.iconColor || COLORS.primaryColor}
          size={18}
        />
        <CustomText
          label={item.label}
          removeTranslation
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
            item.badge.variant === 'danger' ? styles.dangerBadge : styles.primaryBadge,
          ]}>
          <CustomText
            label={item.badge.text}
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
        <Icons
          family="Ionicons"
          name="chevron-forward"
          color="#B6C2D7"
          size={16}
        />
      ) : null}
    </TouchableOpacity>
  );
};

const ProfileSection = ({title, rows}) => {
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
        {rows.map((row, index) => (
          <View key={row.key}>
            <ProfileRow item={row} />
            {index !== rows.length - 1 ? <View style={styles.rowSeparator} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
};

const Profile = () => {
  return (
    <ScreenWrapper
      scrollEnabled
      paddingHorizontal={0}
      backgroundColor="#F4F6F9"
      statusBarColor={COLORS.primaryColor}
      barStyle="light-content">
      <View style={styles.topBackground} />
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <CustomText
          label="My Profile"
          removeTranslation
          color={COLORS.white}
          fontFamily={fonts.semiBold}
          fontSize={18}
        />
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.avatarWrap}>
        <Image
          source={{uri: ''}}
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.nameRow}>
          <CustomText
            label="Nimra Sultan"
            removeTranslation
            color="#101828"
            fontFamily={fonts.semiBold}
            fontSize={18}
          />
          <Icons family="MaterialIcons" name="edit" color="#B7C0CB" size={18} />
        </View>
        <CustomText
          label="Computer Science"
          removeTranslation
          color={COLORS.primaryColor}
          fontFamily={fonts.medium}
          fontSize={13}
        />
      </View>

      <View style={styles.contentCard}>
        <ProfileSection title="CONTACT" rows={CONTACT_ROWS} />
        <ProfileSection title="ACCOUNT" rows={ACCOUNT_ROWS} />
        <ProfileSection title="SETTINGS" rows={SETTINGS_ROWS} />
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
    marginTop: 16,
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
  avatarWrap: {
    alignItems: 'center',
    marginTop: 22,
    zIndex: 1,
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
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 22,
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
    minHeight: 32,
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
  rowSeparator: {
    height: 1,
    backgroundColor: '#EEF1F5',
    marginVertical: 6,
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
