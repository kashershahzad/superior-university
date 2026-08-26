import {
  Animated,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import fonts from '../../../assets/fonts';
import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';
import {Images} from '../../../assets/images';
import {COLORS} from '../../../utils/COLORS';
import {get, post} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import QRScanner from './QRScanner';

const Attendance = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [markingId, setMarkingId] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [scannerVisible, setScannerVisible] = useState(false);

  const anims = useRef({
    header: new Animated.Value(0),
    card: new Animated.Value(0),
    list: new Animated.Value(0),
    actions: new Animated.Value(0),
  }).current;

  const students = attendanceData?.students || [];
  const summary = attendanceData?.summary;

  const presentCount = summary?.present ?? 0;
  const absentCount = summary?.absent ?? 0;
  const pendingCount = summary?.pending ?? 0;

  const syncAttendanceMarks = data => {
    const nextMarks = {};
    (data?.students || []).forEach(s => {
      if (s.status === 'present' || s.status === 'absent') {
        nextMarks[s.id] = s.status;
      }
    });
    setAttendance(nextMarks);
  };

  const fetchAttendance = async () => {
    try {
      const res = await get('uni-staff/attendance');

      if (res?.error) return;

      if (res?.data?.success) {
        const data = res.data.data;
        setAttendanceData(data);
        syncAttendanceMarks(data);
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to load attendance',
          'error',
        );
      }
    } catch (err) {
      console.log('Attendance error:', err);
      ToastMessage('Failed to load attendance', 'error');
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchAttendance();
  }, [isFocused]);

  useEffect(() => {
    const createAnimation = value =>
      Animated.timing(value, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      });

    const entranceAnimation = Animated.stagger(100, [
      createAnimation(anims.header),
      createAnimation(anims.card),
      createAnimation(anims.list),
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

  const markAttendance = async (studentId, status) => {
    if (attendanceData?.is_submitted || markingId != null) return;

    const current =
      attendance[studentId] ||
      students.find(s => s.id === studentId)?.status;
    const nextStatus = current === status ? 'pending' : status;

    setMarkingId(studentId);
    try {
      const res = await post('uni-staff/attendance/mark', {
        student_id: studentId,
        status: nextStatus,
      });

      if (res?.error) return;

      if (res?.data?.success) {
        const data = res.data.data;
        setAttendanceData(data);
        syncAttendanceMarks(data);
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to mark attendance',
          'error',
        );
      }
    } catch (err) {
      console.log('Mark attendance error:', err);
      ToastMessage('Failed to mark attendance', 'error');
    } finally {
      setMarkingId(null);
    }
  };

  const handleScanPress = () => {
    if (attendanceData?.is_submitted) {
      ToastMessage('Attendance already submitted', 'error');
      return;
    }
    if (!students.length) {
      ToastMessage('No students found to mark attendance', 'error');
      return;
    }
    setScannerVisible(true);
  };

  const handleMarkedFromScan = data => {
    if (!data) {
      return;
    }
    setAttendanceData(data);
    syncAttendanceMarks(data);
  };

  const handleReviewSubmit = () => {
    navigation.navigate('ReviewAttendance', {
      attendance,
      students,
      summary: {
        present: presentCount,
        absent: absentCount,
        pending: pendingCount,
        total: students.length,
      },
      bus: attendanceData?.bus,
      date: attendanceData?.date,
      is_submitted: attendanceData?.is_submitted,
      message: attendanceData?.message,
    });
  };

  const renderStatCard = (icon, label, value) => (
    <View style={styles.statCard}>
      <View style={styles.statRow}>
        <Image source={icon} style={styles.statIcon} resizeMode="contain" />
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
        fontSize={22}
        fontFamily={fonts.regular}
        marginTop={3}
        marginLeft={2}
        removeTranslation
      />
    </View>
  );

  const renderStudentRow = item => {
    const status = attendance[item.id] || item.status;
    const isPresent = status === 'present';
    const isAbsent = status === 'absent';
    const isMarking = markingId === item.id;
    const isDisabled = !!attendanceData?.is_submitted || markingId != null;
    const avatarSource = item.profile_photo
      ? {uri: item.profile_photo}
      : Images.placeholderUser;

    return (
      <View key={item.id || item.attendance_id} style={styles.studentRow}>
        <View style={styles.studentInfo}>
          <Image
            source={avatarSource}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.studentText}>
            <CustomText
              label={item.name}
              color="#04153F"
              fontSize={14}
              fontFamily={fonts.medium}
              removeTranslation
            />
            <CustomText
              label={item.student_id}
              color="#495D8E"
              fontSize={12}
              fontFamily={fonts.regular}
              removeTranslation
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          {isMarking ? (
            <ActivityIndicator size="small" color="#701A73" />
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isDisabled}
                style={[
                  styles.actionBtn,
                  isPresent && styles.actionBtnPresent,
                ]}
                onPress={() => markAttendance(item.id, 'present')}>
                <Image
                  source={Images.tickSquare}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isDisabled}
                style={[styles.actionBtn, isAbsent && styles.actionBtnAbsent]}
                onPress={() => markAttendance(item.id, 'absent')}>
                <Image
                  source={Images.closeSquare}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="#701A73"
      barStyle="light-content"
      scrollEnabled>
      <View
        style={[
          styles.headerWrapper,
          {marginTop: -insets.top, paddingTop: insets.top + 16},
        ]}>
        <Animated.View
          style={[styles.headerContent, getFadeUpStyle(anims.header, -16)]}>
          <View style={styles.headerText}>
            <CustomText
              label="Mark Attendance"
              color="#FEFEFE"
              fontSize={24}
              fontFamily={fonts.bold}
            />
            <CustomText
              label="Let’s mark student attendance"
              color="#D9D6FE"
              fontSize={14}
              fontFamily={fonts.medium}
            />
          </View>
          <Image
            source={Images.attendanceHeader}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.cardOverlay,
            {
              opacity: anims.card,
              transform: [
                {
                  translateY: anims.card.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
                {
                  scale: anims.card.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.detailTitleWrap}>
                <CustomText
                  label="Attendance Detail"
                  color="#101828"
                  fontSize={14}
                  fontFamily={fonts.medium}
                />
                <CustomText
                  label={attendanceData?.message || ''}
                  color="#667085"
                  fontSize={12}
                  fontFamily={fonts.regular}
                  removeTranslation
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!!attendanceData?.is_submitted}
                style={[
                  styles.scanBtn,
                  attendanceData?.is_submitted && styles.scanBtnDisabled,
                ]}
                onPress={handleScanPress}>
                <Icons
                  family="Ionicons"
                  name="qr-code-outline"
                  size={16}
                  color={COLORS.primaryColor}
                />
                <CustomText
                  label="Scan QR"
                  color={COLORS.primaryColor}
                  fontSize={12}
                  fontFamily={fonts.medium}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              {renderStatCard(Images.userTick, 'Present', presentCount)}
              {renderStatCard(Images.userRemove, 'Absent', absentCount)}
              {renderStatCard(Images.property, 'Pending', pendingCount)}
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.listCard, getFadeUpStyle(anims.list, 24)]}>
        <View style={styles.listHeader}>
          <CustomText
            label="Mark Attendance"
            color="#04153F"
            fontSize={14}
            fontFamily={fonts.bold}
          />
        </View>
        <View style={styles.listContent}>
          {students.length === 0 ? (
            <View style={styles.emptyList}>
              <CustomText
                label="No students found"
                color="#667085"
                fontSize={13}
                fontFamily={fonts.medium}
                textAlign="center"
                removeTranslation
              />
            </View>
          ) : (
            students.map(renderStudentRow)
          )}
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.footerWrap, getFadeUpStyle(anims.actions, 18)]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.submitBtn}
          onPress={handleReviewSubmit}>
          <Image
            source={Images.review}
            style={styles.submitIcon}
            resizeMode="contain"
          />
          <CustomText
            label="Review & Submit"
            color={COLORS.primaryColor}
            fontSize={14}
            fontFamily={fonts.medium}
          />
        </TouchableOpacity>
      </Animated.View>
    </ScreenWrapper>
      <QRScanner
        visible={scannerVisible}
        students={students}
        onClose={() => setScannerVisible(false)}
        onMarked={handleMarkedFromScan}
      />
    </>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  emptyList: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: '18%',
    backgroundColor: '#701A73',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'visible',
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  headerText: {
    flex: 1,
    marginTop: -6,
    paddingRight: 8,
  },
  headerImage: {
    width: 90,
    height: 80,
  },
  cardOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: -110,
    zIndex: 10,
    elevation: 10,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailTitleWrap: {
    flex: 1,
    gap: 2,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#701A73',
    backgroundColor: '#F4F3FF',
  },
  scanBtnDisabled: {
    opacity: 0.45,
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
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 118,
    gap: 12,
  },
  listHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
  },
  listContent: {
    gap: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
    gap: 8,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
  },
  studentText: {
    flex: 1,
    gap: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  actionBtnPresent: {
    borderColor: '#AFCC95',
    backgroundColor: '#E7F1D9',
  },
  actionBtnAbsent: {
    borderColor: '#F2B8B5',
    backgroundColor: '#FFE7E7',
  },
  actionIcon: {
    width: 16,
    height: 16,
  },
  footerWrap: {
    marginHorizontal: 40,
    marginTop: 10,
    marginBottom: 30,
  },
  submitBtn: {
    height: 48,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#701A73',
    backgroundColor: '#F1F3F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitIcon: {
    width: 24,
    height: 24,
    tintColor: '#701A73',
  },
});
