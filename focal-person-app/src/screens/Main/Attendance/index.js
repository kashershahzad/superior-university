import {Animated, StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import fonts from '../../../assets/fonts';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import {COLORS} from '../../../utils/COLORS';

const STUDENTS = [
  {id: '1', name: 'Ahmad Raza', student_id: '2021-CS-045'},
  {id: '2', name: 'M Abdullah', student_id: '2022-EE-012'},
  {id: '3', name: 'Adeel Ali', student_id: '2025-CS-022'},
  {id: '4', name: 'M Haroon', student_id: '2021-CS-078'},
  {id: '5', name: 'Adeel Ali', student_id: '2025-CS-022'},
  {id: '6', name: 'Hassan Ali', student_id: '2023-CS-011'},
  {id: '7', name: 'Sara Khan', student_id: '2024-EE-009'},
  {id: '8', name: 'Bilal Ahmed', student_id: '2022-CS-033'},
];

const TOTAL_STUDENTS = 38;

// const INITIAL_ATTENDANCE = {
//   '1': 'present',
//   '2': 'present',
//   '3': 'present',
//   '4': 'present',
//   '5': 'present',
//   '6': 'absent',
//   '7': 'absent',
// };

const Attendance = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [attendance, setAttendance] = useState({});

  const anims = useRef({
    header: new Animated.Value(0),
    card: new Animated.Value(0),
    list: new Animated.Value(0),
    actions: new Animated.Value(0),
  }).current;

  const presentCount = useMemo(
    () => Object.values(attendance).filter(status => status === 'present').length,
    [attendance],
  );
  const absentCount = useMemo(
    () => Object.values(attendance).filter(status => status === 'absent').length,
    [attendance],
  );
  const pendingCount = Math.max(TOTAL_STUDENTS - presentCount - absentCount, 0);
  const moreCount = Math.max(TOTAL_STUDENTS - STUDENTS.length, 0);

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

  const markAttendance = (studentId, status) => {
    setAttendance(prev => {
      if (prev[studentId] === status) {
        const next = {...prev};
        delete next[studentId];
        return next;
      }
      return {...prev, [studentId]: status};
    });
  };

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
        fontSize={22}
        fontFamily={fonts.regular}
        marginTop={3}
        marginLeft={2}
        removeTranslation
      />
    </View>
  );

  const renderStudentRow = item => {
    const status = attendance[item.id];
    const isPresent = status === 'present';
    const isAbsent = status === 'absent';

    return (
      <View key={item.id} style={styles.studentRow}>
        <View style={styles.studentInfo}>
          <ImageFast
            source={Images.placeholderUser}
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
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.actionBtn,
              isPresent && styles.actionBtnPresent,
            ]}
            onPress={() => markAttendance(item.id, 'present')}>
            <ImageFast
              source={Images.tickSquare}
              style={styles.actionIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionBtn, isAbsent && styles.actionBtnAbsent]}
            onPress={() => markAttendance(item.id, 'absent')}>
            <ImageFast
              source={Images.closeSquare}
              style={styles.actionIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
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
          <ImageFast
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
            <CustomText
              label="Attendance Detail"
              color="#101828"
              fontSize={14}
              fontFamily={fonts.medium}
            />
            <CustomText
              label="Your current date attendance"
              color="#667085"
              fontSize={12}
              fontFamily={fonts.regular}
            />
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
        <View style={styles.listContent}>{STUDENTS.map(renderStudentRow)}</View>
        {moreCount > 0 ? (
          <CustomText
            label={`--${moreCount} more students below--`}
            color="#98A2B3"
            fontSize={12}
            fontFamily={fonts.medium}
            textAlign="center"
            marginTop={4}
            removeTranslation
          />
        ) : null}
      </Animated.View>

      <Animated.View
        style={[styles.footerWrap, getFadeUpStyle(anims.actions, 18)]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.submitBtn}
          onPress={() => navigation.navigate('ReviewAttendance')}>
          <ImageFast
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
  );
};

export default Attendance;

const styles = StyleSheet.create({
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
