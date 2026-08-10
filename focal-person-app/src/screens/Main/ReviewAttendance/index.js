import {Animated, StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  useNavigation,
  CommonActions,
  useIsFocused,
} from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import CustomButton from '../../../components/CustomButton';
import ImageFast from '../../../components/ImageFast';
import fonts from '../../../assets/fonts';
import {Images} from '../../../assets/images';
import {COLORS} from '../../../utils/COLORS';
import InfoCard from '../Home/InfoCard';
import GradientButton from '../Home/GradientButton';
import ModalBox from '../Home/ModalBox';
import {get, post} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';

const ReviewAttendance = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isAttendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const anims = useRef({
    header: new Animated.Value(0),
    session: new Animated.Value(0),
    summary: new Animated.Value(0),
    details: new Animated.Value(0),
    banner: new Animated.Value(0),
    actions: new Animated.Value(0),
  }).current;

  const details = reviewData?.details || reviewData?.attendance_details;
  const attendanceDetails =
    reviewData?.attendance_details || reviewData?.details;
  const summary = reviewData?.summary;

  const sessionItems = [
    {item: 'Session', itemValue: details?.session || ''},
    {item: 'Bus', itemValue: details?.bus || ''},
    {item: 'Marked by', itemValue: details?.marked_by || ''},
    {item: 'Time', itemValue: details?.time || ''},
  ];

  const attendanceDetailItems = [
    {item: 'Session', itemValue: attendanceDetails?.session || ''},
    {item: 'Bus', itemValue: attendanceDetails?.bus || ''},
    {item: 'Marked by', itemValue: attendanceDetails?.marked_by || ''},
    {item: 'Time', itemValue: attendanceDetails?.time || ''},
  ];

  const fetchReview = async () => {
    try {
      const res = await get('uni-staff/attendance/review');

      if (res?.error) return;

      if (res?.data?.success) {
        setReviewData(res.data.data);
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to load review attendance',
          'error',
        );
      }
    } catch (err) {
      console.log('Review attendance error:', err);
      ToastMessage('Failed to load review attendance', 'error');
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchReview();
  }, [isFocused]);

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
        label={String(value ?? 0)}
        color="#101828"
        fontSize={20}
        fontFamily={fonts.regular}
        marginTop={3}
        marginLeft={2}
        removeTranslation
      />
    </View>
  );

  const canEdit = reviewData?.can_edit && !reviewData?.is_submitted;
  const canSubmit = !reviewData?.is_submitted;

  const handleSubmitAttendance = async () => {
    if (submitting || reviewData?.is_submitted) return;

    setSubmitting(true);
    try {
      const res = await post('uni-staff/attendance/submit', {marks: []});

      if (res?.error) return;

      if (res?.data?.success) {
        setReviewData(res.data.data);
        setSubmitMessage(res.data?.message || '');
        setAttendanceModalVisible(true);
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to submit attendance',
          'error',
        );
      }
    } catch (err) {
      console.log('Submit attendance error:', err);
      ToastMessage('Failed to submit attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
            label={reviewData?.title || 'Review Attendance'}
            color="#04153F"
            fontSize={18}
            fontFamily={fonts.bold}
            textAlign="center"
            containerStyle={styles.headerTitle}
            removeTranslation
          />
          <View style={styles.headerSpacer} />
        </Animated.View>
      )}>
      <View style={styles.container}>
        <Animated.View style={getFadeUpStyle(anims.session, 18)}>
          <InfoCard title="Session Details" items={sessionItems} />
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
            label={reviewData?.message || ''}
            color="#475467"
            fontSize={12}
            fontFamily={fonts.regular}
            removeTranslation
          />
          <View style={styles.statsRow}>
            {renderStatCard(Images.userTick, 'Present', summary?.present)}
            {renderStatCard(Images.userRemove, 'Absent', summary?.absent)}
            {renderStatCard(Images.userMinus, 'Blocked', summary?.blocked)}
          </View>
        </Animated.View>

        <Animated.View style={getFadeUpStyle(anims.details, 20)}>
          <InfoCard title="Attendance Details" items={attendanceDetailItems} />
        </Animated.View>

        <Animated.View style={[getFadeUpStyle(anims.banner, 18)]}>
          <ImageFast
            source={Images.submission}
            style={{height: 100, width: '100%'}}
            resizeMode="contain"
          />
          {!!reviewData?.warning && (
            <CustomText
              label={reviewData.warning}
              color="#475467"
              fontSize={12}
              fontFamily={fonts.regular}
              textAlign="center"
              marginTop={8}
              removeTranslation
            />
          )}
        </Animated.View>

        <Animated.View
          style={[styles.actions, getFadeUpStyle(anims.actions, 16)]}>
          {canSubmit ? (
            <GradientButton
              title="Submit attendance"
              borderRadius={100}
              height={48}
              fontSize={14}
              loading={submitting}
              onPress={handleSubmitAttendance}
            />
          ) : null}
          {canEdit ? (
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
          ) : (
            <View style={{marginBottom: 24}} />
          )}
        </Animated.View>
      </View>

      <ModalBox
        type="attendance"
        isVisible={isAttendanceModalVisible}
        topImg={Images.attendanceRecorded}
        attendanceData={reviewData}
        successMessage={submitMessage}
        onClose={() => setAttendanceModalVisible(false)}
        onBackHome={() => {
          setAttendanceModalVisible(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'TabStack'}],
            }),
          );
        }}
        onViewHistory={() => {
          setAttendanceModalVisible(false);
          navigation.navigate('TabStack', {screen: 'AttendanceHistory'});
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
