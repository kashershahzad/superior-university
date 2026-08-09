import {Animated, StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsFocused} from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import fonts from '../../../assets/fonts';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';

const DEFAULT_BUS_LOCATION = {
  latitude: 31.4704,
  longitude: 74.2507,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const STUDENTS = {
  paid: [
    {id: '1', name: 'Ahmad Raza', student_id: '2021-CS-045', status: 'paid'},
    {id: '2', name: 'M Abdullah', student_id: '2022-EE-012', status: 'paid'},
    {id: '3', name: 'Adeel Ali', student_id: '2025-CS-022', status: 'paid'},
    {id: '4', name: 'M Haroon', student_id: '2021-CS-078', status: 'paid'},
    {id: '5', name: 'Adeel Ali', student_id: '2025-CS-022', status: 'paid'},
  ],
  unpaid: [
    {id: '6', name: 'Hassan Ali', student_id: '2023-CS-011', status: 'unpaid'},
    {id: '7', name: 'Sara Khan', student_id: '2024-EE-009', status: 'unpaid'},
    {id: '8', name: 'Bilal Ahmed', student_id: '2022-CS-033', status: 'unpaid'},
    {id: '9', name: 'Usman Tariq', student_id: '2021-CS-088', status: 'unpaid'},
  ],
};

const Home = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState('paid');

  const anims = useRef({
    header: new Animated.Value(0),
    card: new Animated.Value(0),
    busStatus: new Animated.Value(0),
    map: new Animated.Value(0),
    list: new Animated.Value(0),
  }).current;

  const busLabel = 'Bus #03';
  const periodLabel = 'Period 1 Jan 2024 - 30 Dec 2024';
  const totalStudents = 42;
  const feePaidCount = 38;
  const unpaidCount = 4;
  const listStudents = activeTab === 'paid' ? STUDENTS.paid : STUDENTS.unpaid;

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
      createAnimation(anims.busStatus),
      createAnimation(anims.map),
      createAnimation(anims.list),
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
          numberOfLines={1}
          containerStyle={styles.statLabel}
        />
      </View>
      <CustomText
        label={String(value).padStart(2, '0')}
        color="#101828"
        fontSize={22}
        fontFamily={fonts.regular}
        marginTop={3}
        marginLeft={2}
        removeTranslation
      />
    </View>
  );

  const renderStudentCard = item => {
    const isPaid = item.status === 'paid' || activeTab === 'paid';
    const avatarSource = item.profile_photo
      ? {uri: item.profile_photo}
      : Images.placeholderUser;

    return (
      <View
        key={item.id || item.student_id}
        style={[
          styles.studentCard,
          isPaid ? styles.studentCardPaid : styles.studentCardUnpaid,
        ]}>
        <View style={styles.studentInfo}>
          <ImageFast
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
        <View
          style={[
            styles.statusBadge,
            isPaid ? styles.statusBadgePaid : styles.statusBadgeUnpaid,
          ]}>
          <CustomText
            label={isPaid ? 'Paid' : 'Blocked'}
            color={isPaid ? '#719055' : '#AB2D2D'}
            fontSize={10}
            fontFamily={fonts.bold}
          />
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
          <View style={{marginTop: -20}}>
            <CustomText
              label="My Transport"
              color="#FEFEFE"
              fontSize={24}
              fontFamily={fonts.semiBold}
            />
            <CustomText
              label="Welcome Back!"
              color="#D9D6FE"
              fontSize={14}
              fontFamily={fonts.medium}
            />
          </View>
          <ImageFast
            source={Images.bus}
            style={styles.busImage}
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
          <View style={styles.feesCard}>
            <CustomText
              label="Student Fees Detail"
              color="#101828"
              fontSize={14}
              fontFamily={fonts.medium}
            />
            <CustomText
              label={periodLabel}
              color="#667085"
              fontSize={12}
              fontFamily={fonts.regular}
              removeTranslation
            />
            <View style={styles.statsRow}>
              {renderStatCard(Images.student, 'Total Student', totalStudents)}
              {renderStatCard(Images.briefcase, 'Fee Paid', feePaidCount)}
              {renderStatCard(Images.briefcase2, 'Unpaid', unpaidCount)}
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.busStatusCard, getFadeUpStyle(anims.busStatus, 24)]}>
        <View style={styles.busStatusHeader}>
          <View style={styles.busStatusTitleRow}>
            <ImageFast
              source={Images.onduty}
              style={styles.busStatusIcon}
              resizeMode="contain"
            />
            <CustomText
              label={`${busLabel} . on duty`}
              color="#101828"
              fontSize={14}
              fontFamily={fonts.semiBold}
              removeTranslation
            />
          </View>
          <View style={styles.liveBadge}>
            <CustomText
              label="Live"
              color="#719055"
              fontSize={10}
              fontFamily={fonts.bold}
            />
          </View>
        </View>
        <View style={styles.locationSharingBox}>
          <View style={styles.liveDot} />
          <View style={styles.locationSharingText}>
            <CustomText
              label="Location sharing active"
              color="#101828"
              fontSize={14}
              fontFamily={fonts.medium}
            />
            <CustomText
              label="GPS signal strong. Last updated 2s ago"
              color="#667085"
              fontSize={12}
              fontFamily={fonts.regular}
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.busLiveLocation, getFadeUpStyle(anims.map, 24)]}>
        <CustomText
          label="Bus Live Location"
          color="#101828"
          fontSize={12}
          fontFamily={fonts.medium}
        />
        {isFocused && (
          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              initialRegion={DEFAULT_BUS_LOCATION}>
              <Marker
                coordinate={{
                  latitude: DEFAULT_BUS_LOCATION.latitude,
                  longitude: DEFAULT_BUS_LOCATION.longitude,
                }}
              />
            </MapView>
          </View>
        )}
        <View style={styles.busLocationInfo}>
          <View style={styles.dot} />
          <CustomText
            label={`${busLabel} 2.3km away`}
            color="#701A73"
            fontSize={14}
            fontFamily={fonts.medium}
            removeTranslation
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.tabsWrap, getFadeUpStyle(anims.list, 24)]}>
        <View style={styles.tabs}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tab, activeTab === 'paid' && styles.tabActive]}
            onPress={() => setActiveTab('paid')}>
            <CustomText
              label="Paid"
              color={activeTab === 'paid' ? '#FEFEFE' : '#475467'}
              fontSize={12}
              fontFamily={fonts.medium}
            />
            <View
              style={[
                styles.tabBadge,
                activeTab === 'paid'
                  ? styles.tabBadgeActive
                  : styles.tabBadgeInactive,
              ]}>
              <CustomText
                label={String(feePaidCount)}
                color="#FEFEFE"
                fontSize={10}
                fontFamily={fonts.medium}
                removeTranslation
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tab, activeTab === 'unpaid' && styles.tabActive]}
            onPress={() => setActiveTab('unpaid')}>
            <CustomText
              label="Unpaid"
              color={activeTab === 'unpaid' ? '#FEFEFE' : '#475467'}
              fontSize={12}
              fontFamily={fonts.medium}
            />
            <View
              style={[
                styles.tabBadge,
                activeTab === 'unpaid'
                  ? styles.tabBadgeActive
                  : styles.tabBadgeInactive,
              ]}>
              <CustomText
                label={String(unpaidCount)}
                color="#FEFEFE"
                fontSize={10}
                fontFamily={fonts.medium}
                removeTranslation
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <CustomText
              label={activeTab === 'paid' ? 'Paid Fees' : 'Unpaid Fees'}
              color="#04153F"
              fontSize={14}
              fontFamily={fonts.bold}
            />
          </View>
          <View style={styles.listContent}>
            {listStudents.map(renderStudentCard)}
          </View>
        </View>
      </Animated.View>
    </ScreenWrapper>
  );
};

export default Home;

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
  busImage: {
    width: 140,
    height: 110,
    left: '8%',
  },
  cardOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: -80,
    zIndex: 10,
    elevation: 10,
  },
  feesCard: {
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
    height: 72,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBECEE',
    overflow: 'visible',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'nowrap',
  },
  statIcon: {
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  statLabel: {
    flexShrink: 0,
  },
  busStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginTop: 88,
    gap: 12,
  },
  busStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  busStatusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  busStatusIcon: {
    width: 16,
    height: 16,
  },
  liveBadge: {
    backgroundColor: '#E7F1D9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locationSharingBox: {
    backgroundColor: '#FAFAFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 8,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    gap: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#701A73',
  },
  locationSharingText: {
    flex: 1,
    gap: 4,
  },
  busLiveLocation: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  mapWrap: {
    width: '100%',
    height: 178,
    borderWidth: 1,
    borderColor: '#EBECEE',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 178,
    overflow: 'hidden',
  },
  busLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 12,
    backgroundColor: '#701A73',
  },
  tabsWrap: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  tabs: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 32,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  tabActive: {
    backgroundColor: '#6F1A73',
  },
  tabBadge: {
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: '#EB5757',
  },
  tabBadgeInactive: {
    backgroundColor: '#98A2B3',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
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
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  studentCardPaid: {
    backgroundColor: '#F5F4ED',
    borderColor: '#AFCC95',
  },
  studentCardUnpaid: {
    backgroundColor: '#FDF6F6',
    borderColor: '#F7C1C1',
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
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgePaid: {
    backgroundColor: '#E7F1D9',
  },
  statusBadgeUnpaid: {
    backgroundColor: '#FCEBEB',
  },
});
