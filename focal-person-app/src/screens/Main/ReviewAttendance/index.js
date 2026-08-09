import { Animated, StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import CustomButton from '../../../components/CustomButton';
import ImageFast from '../../../components/ImageFast';
import fonts from '../../../assets/fonts';
import { Images } from '../../../assets/images';
import { COLORS } from '../../../utils/COLORS';
import InfoCard from '../Home/InfoCard';
import GradientButton from '../Home/GradientButton';
import ModalBox from '../Home/ModalBox';

const SESSION_ITEMS = [
  { item: 'Session', itemValue: 'Morning, 23 May 2026' },
  { item: 'Bus', itemValue: '#3 Jail Road' },
  { item: 'Marked by', itemValue: 'Dr Amina Siddiqui' },
  { item: 'Time', itemValue: '7:42 AM' },
];

const SUMMARY = {
  present: 32,
  absent: 4,
  blocked: 4,
};

const ReviewAttendance = () => {
  const navigation = useNavigation();
  const [isAttendanceModalVisible, setAttendanceModalVisible] = useState(false);

  const anims = useRef({
    header: new Animated.Value(0),
    session: new Animated.Value(0),
    summary: new Animated.Value(0),
    details: new Animated.Value(0),
    banner: new Animated.Value(0),
    actions: new Animated.Value(0),
  }).current;

  useEffect(() => {
    const createAnimation = value =>
      Animated.timing(value, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      });

    const entranceAnimation = Animated.stagger(90, [
      createAnimation(anims.header),
      createAnimation(anims.session),
      createAnimation(anims.summary),
      createAnimation(anims.details),
      createAnimation(anims.banner),
      createAnimation(anims.actions),
    ]);

    entranceAnimation.start();
    return () => entranceAnimation.stop();
  }, [anims]);

  const getFadeUpStyle = (animation, distance = 20) => ({
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  });

  const renderStatCard = (icon, label, value) => (
    <View style={styles.statCard}>
      <View style={styles.statRow}>
        <ImageFast source={icon} style={styles.statIcon} resizeMode="contain" />
        <CustomText
          label={label}
          color="#475467"
          fontSize={12}
          fontFamily={fonts.medium}
        />
      </View>
      <CustomText
        label={String(value)}
        color="#101828"
        fontSize={20}
        fontFamily={fonts.regular}
        marginTop={3}
        marginLeft={2}
        removeTranslation
      />
    </View>
  );

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="#FFFFFF"
      scrollEnabled
      headerUnScrollable={() => (
        <Animated.View
          style={[styles.header, getFadeUpStyle(anims.header, -12)]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
            }}>
            <ImageFast
              source={Images.backArrow}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <CustomText
            label="Review Attendance"
            color="#04153F"
            fontSize={18}
            fontFamily={fonts.bold}
            textAlign="center"
            containerStyle={styles.headerTitle}
          />
          <View style={styles.headerSpacer} />
        </Animated.View>
      )}>
      <View style={styles.container}>
        <Animated.View style={getFadeUpStyle(anims.session, 18)}>
          <InfoCard title="Session Details" items={SESSION_ITEMS} />
        </Animated.View>

        <Animated.View
          style={[styles.summaryCard, getFadeUpStyle(anims.summary, 20)]}>
          <CustomText
            label="Summary"
            color="#101828"
            fontSize={14}
            fontFamily={fonts.semiBold}
          />
          <CustomText
            label="Your current date summary"
            color="#475467"
            fontSize={12}
            fontFamily={fonts.regular}
          />
          <View style={styles.statsRow}>
            {renderStatCard(Images.userTick, 'Present', SUMMARY.present)}
            {renderStatCard(Images.userRemove, 'Absent', SUMMARY.absent)}
            {renderStatCard(Images.userMinus, 'Blocked', SUMMARY.blocked)}
          </View>
        </Animated.View>

        <Animated.View style={getFadeUpStyle(anims.details, 20)}>
          <InfoCard title="Attendance Details" items={SESSION_ITEMS} />
        </Animated.View>

        <Animated.View
          style={[getFadeUpStyle(anims.banner, 18)]}>
          <ImageFast
            source={Images.submission}
            style={{ height: 100, width: '100%' }}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[styles.actions, getFadeUpStyle(anims.actions, 16)]}>
          <GradientButton
            title="Submit attendance"
            borderRadius={100}
            height={48}
            fontSize={14}
            onPress={() => setAttendanceModalVisible(true)}
          />
          <CustomButton
            title="Go back & edit"
            backgroundColor="#F1F3F8"
            color={COLORS.primaryColor}
            borderWidth={1}
            borderColor={COLORS.primaryColor}
            borderRadius={100}
            height={48}
            fontSize={14}
            fontFamily={fonts.medium}
            marginTop={12}
            marginBottom={24}
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
            }}
          />
        </Animated.View>
      </View>

      <ModalBox
        type="attendance"
        isVisible={isAttendanceModalVisible}
        topImg={Images.attendanceRecorded}
        onClose={() => setAttendanceModalVisible(false)}
        onBackHome={() => {
          setAttendanceModalVisible(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'TabStack' }],
            }),
          );
        }}
        onViewHistory={() => {
          setAttendanceModalVisible(false);
          navigation.navigate('TabStack', { screen: 'Attendance' });
        }}
      />
    </ScreenWrapper>
  );
};

export default ReviewAttendance;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#701A73',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    marginBottom: 10,
    gap: 2,
  },
  statsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: '2%',
  },
  statCard: {
    backgroundColor: '#F9F9F9',
    width: '32%',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBECEE',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    width: 16,
    height: 16,
  },
  actions: {
    marginHorizontal: 20,
    marginTop: 16,
  },
});
