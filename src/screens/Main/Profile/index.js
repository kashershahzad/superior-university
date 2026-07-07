import React from 'react';
import {FlatList, Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';

import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

import {Images} from '../../../assets/images';

const CONTACT_ROWS = [
  {
    key: 'email',
    Icons: Images.email,
    label: 'YourServo@uni.com',
  },
  {
    key: 'phone',
    Icons: Images.phone,
    label: '+923457071709',
  },
];

const ACCOUNT_ROWS = [
  {
    key: 'personal-data',
    Icons: Images.user,
    label: 'Personal Data',
    showArrow: true,
  },
  {
    key: 'generate-card',
    Icons: Images.generateCard,
    label: 'Generate Card',
    badge: {text: 'Generate Card', variant: 'primary'},
  },
  {
    key: 'fee-status',
    Icons: Images.feeStatus,
    label: 'Fee Status',
    badge: {variant: 'danger', text: 'Pending'},
  },
];

const SETTINGS_ROWS = [
  {
    key: 'password',
    Icons: Images.passwordforget,
    label: 'Change Password',
    showArrow: true,
  },
  {
    key: 'faq',
    Icons: Images.faqs,
    label: 'FAQ and Help',
    showArrow: true,
  },
  {
    key: 'logout',
    Icons: Images.logout,
    label: 'Logout',
    showArrow: true,
  },
];

const ProfileRow = ({item}) => {
  const rowLabel = item.label || '';
  const badgeText = item.badge?.text || '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.rowContainer}>
      <View style={styles.rowLeft}>
        <Image
          source={item.Icons}
          style={{width: 18, height: 18}}
        />
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
            item.badge.variant === 'danger' ? styles.dangerBadge : styles.primaryBadge,
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
        <Image
          source={Images.rightArrow}
          style={{width: 16, height: 16}}
        />
      ) : null}
    </TouchableOpacity>
  );
};

const ProfileSection = ({title, rows}) => {
  const renderProfileRow = ({item, index}) => {
    return (
      <View>
        <ProfileRow
          item={item}
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

const Profile = () => {
  const navigation = useNavigation();
  const sectionData = [
    {key: 'contact', title: 'CONTACT', rows: CONTACT_ROWS},
    {key: 'account', title: 'ACCOUNT', rows: ACCOUNT_ROWS},
    {key: 'settings', title: 'SETTINGS', rows: SETTINGS_ROWS},
  ];

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
          <Image
            source={Images.placeholderUser}
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
            <Image
              source={Images.verify}
              style={{width: 18, height: 18}}
            />
          </View>
          <CustomText
            label="Computer Science"
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
                fontFamily={fonts.semiBold}
                color="#344054"
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
