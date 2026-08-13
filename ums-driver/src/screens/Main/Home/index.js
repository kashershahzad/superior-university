import { Animated, StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../../../components/ScreenWrapper';
import fonts from '../../../assets/fonts';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import InfoCard from './InfoCard';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../utils/COLORS';
import { get, post } from '../../../services/ApiRequest';
import {
  startLocationTracking,
  stopLocationTracking,
  subscribeLocationUpdates,
} from '../../../services/LocationTrackingService';
import { ToastMessage } from '../../../utils/ToastMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { logout } from '../../../store/reducer/AuthConfig';
import { setUserData } from '../../../store/reducer/usersSlice';


const Home = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [dashboard, setDashboard] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dutyLoading, setDutyLoading] = useState(false);
  const [liveCoords, setLiveCoords] = useState(null);

  const isOnDuty = dashboard?.duty_status === 'live';
  const isFetchingDashboard = useRef(false);

  const fetchDashboard = async ({ showLoader = true, withAssignment = true } = {}) => {
    if (isFetchingDashboard.current) {
      return;
    }

    isFetchingDashboard.current = true;
    if (showLoader) {
      setLoading(true);
    }
    try {
      const res = await get('driver/dashboard');
      if (res?.error) return;
      if (res?.data?.success) {
        const data = res.data.data;
        setDashboard(data);
        if (withAssignment) {
          if (data?.duty_status === 'live') {
            await fetchAssignment();
          } else {
            setAssignment(null);
          }
        }
      }
    } catch (err) {
      console.log('Dashboard error:', err);
    } finally {
      isFetchingDashboard.current = false;
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboard();

    const pollId = setInterval(() => {
      fetchDashboard({ showLoader: false, withAssignment: true });
    }, 5000);

    return () => clearInterval(pollId);
  }, []);

  const fetchAssignment = async () => {
    try {
      const res = await get('driver/assignment');
      if (res?.error) return;
      if (res?.data?.success) {
        setAssignment(res.data.data);
      }
    } catch (err) {
      console.log('Assignment error:', err);
    }
  };

  const handleStartDuty = async () => {
    if (dutyLoading) return;

    setDutyLoading(true);
    try {
      const trackingStarted = await startLocationTracking();
      if (!trackingStarted) {
        ToastMessage(
          'Location permission is required to start duty.',
          'error',
        );
        return;
      }

      const res = await post('driver/duty/start');
      if (res?.error) {
        await stopLocationTracking();
        return;
      }

      if (res?.data?.success) {
        ToastMessage(res.data?.message || 'Duty started.', 'success');
        await fetchDashboard();
        await fetchAssignment();
      } else {
        await stopLocationTracking();
        ToastMessage(res?.data?.message || 'Failed to start duty', 'error');
      }
    } catch (err) {
      console.log('Start duty error:', err);
      await stopLocationTracking();
      ToastMessage('Failed to start duty. Please try again.', 'error');
    } finally {
      setDutyLoading(false);
    }
  };

  const handleEndDuty = async () => {
    if (dutyLoading) return;
    setDutyLoading(true);
    try {
      const res = await post('driver/duty/end');
      if (res?.error) return;
      if (res?.data?.success) {
        await stopLocationTracking();
        ToastMessage(res.data?.message || 'Duty ended.', 'success');
        await fetchDashboard();
        setAssignment(null);
      } else {
        ToastMessage(res.data?.message || 'Failed to end duty', 'error');
      }
    } catch (err) {
      console.log('End duty error:', err);
      ToastMessage('Failed to end duty. Please try again.', 'error');
    } finally {
      setDutyLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const syncTracking = async () => {
      if (isOnDuty) {
        const started = await startLocationTracking();
        if (!started && !cancelled) {
          ToastMessage(
            'Allow location access to keep sharing while on duty.',
            'error',
          );
        }
      } else {
        await stopLocationTracking();
      }
    };

    syncTracking();

    return () => {
      cancelled = true;
    };
  }, [isOnDuty]);

  useEffect(() => {
    if (!isOnDuty) {
      setLiveCoords(null);
      return undefined;
    }

    return subscribeLocationUpdates(coords => {
      if (coords?.latitude == null || coords?.longitude == null) {
        return;
      }
      setLiveCoords({
        lat: coords.latitude,
        lng: coords.longitude,
      });
    });
  }, [isOnDuty]);

  const handleLogout = async () => {
    if (dutyLoading) return;

    setDutyLoading(true);
    try {
      const res = await post('auth/logout');

      if (res?.error) {
        return;
      }
      await stopLocationTracking();

      if (res?.data?.success) {
        ToastMessage(res.data?.message || 'Logged out successfully.', 'success');

        await AsyncStorage.multiRemove(['token', 'refreshToken', 'rememberMe']);
        dispatch(logout());
        dispatch(setUserData({}));

        navigation.getParent()?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'AuthStack' }],
          }),
        );
      } else {
        ToastMessage(res?.data?.message || 'Logout failed', 'error');
      }
    } catch (err) {
      console.log('Logout error:', err);
      ToastMessage('Logout failed. Please try again.', 'error');
    } finally {
      setDutyLoading(false);
    }
  };

  const formatShift = (start, end) => {
    if (!start || !end) return '-';
    const fmt = t => {
      const [h, m] = t.split(':');
      const hour = Number(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    };
    return `${fmt(start)}-${fmt(end)}`;
  };

  const currentLat = liveCoords?.lat ?? dashboard?.coordinates?.lat;
  const currentLng = liveCoords?.lng ?? dashboard?.coordinates?.lng;
  const hasLiveCoords = currentLat != null && currentLng != null;


  const dutyUI = isOnDuty
    ? {
      busTitle: dashboard?.display_name || assignment?.bus?.display_name,
      tag: dashboard?.duty_status,
      tagColor:
        dashboard?.duty_status === 'active' || dashboard?.duty_status === 'live'
          ? '#719055'
          : '#88878A',
      tagBgColor:
        dashboard?.duty_status === 'active' || dashboard?.duty_status === 'live'
          ? '#E7F1D9'
          : '#F1EFE8',
      statusTitle:
        dashboard?.location_sharing === 'active'
          ? 'Location sharing active'
          : 'No data available',
      statusSubtitle: dashboard?.message || 'No data available',
      routeItems: [
        {
          item: 'Bus number',
          itemValue: assignment?.bus?.bus_number || '--',
        },
        {
          item: 'Route',
          itemValue: assignment?.route || '--',
        },
        {
          item: 'Stops today',
          itemValue: `${assignment?.stops_today ?? 0} Stops`,
        },
        {
          item: 'Students on board',
          itemValue: String(assignment?.students_on_board ?? '--'),
        },
        {
          item: 'Current coordinates',
          itemValue: hasLiveCoords
            ? `${Number(currentLat).toFixed(6)}° N, ${Number(currentLng).toFixed(6)}° E`
            : '--',
        },
      ],
      buttonIcon: Images.discontinue,
      buttonLabel: 'End duty / Go Offline',
      onButtonPress: handleEndDuty,
    }
    : {
      busTitle: dashboard?.display_name,
      tag: dashboard?.duty_status,
      tagColor:
        dashboard?.duty_status === 'active' || dashboard?.duty_status === 'live'
          ? '#719055'
          : '#88878A',
      tagBgColor:
        dashboard?.duty_status === 'active' || dashboard?.duty_status === 'live'
          ? '#E7F1D9'
          : '#F1EFE8',
      statusTitle:
        dashboard?.location_sharing === 'paused'
          ? 'Location sharing paused'
          : '',
      statusSubtitle:
        dashboard?.message,
      routeItems: [
        { item: 'Driver', itemValue: dashboard?.driver },
        {
          item: 'Assigned bus',
          itemValue: dashboard?.display_name
        },
        { item: 'Assigned Route', itemValue: dashboard?.route },
        {
          item: "Today's shift",
          itemValue: formatShift(
            dashboard?.shift?.start,
            dashboard?.shift?.end,
          ),
        },
      ],
      buttonIcon: Images.startDuty,
      buttonLabel: 'Start Duty / Go Online',
      onButtonPress: handleStartDuty,
    };

  const mapRegion = {
    latitude: Number(currentLat) || 0,
    longitude: Number(currentLng) || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const anims = useRef({
    header: new Animated.Value(0),
    card: new Animated.Value(0),
    map: new Animated.Value(0),
    details: new Animated.Value(0),
    actions: new Animated.Value(0),
  }).current;

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
      createAnimation(anims.map),
      createAnimation(anims.details),
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

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="#701A73"
      scrollEnabled
    >
      <View
        style={[
          styles.headerWrapper,
          { marginTop: -insets.top, paddingTop: insets.top + 16 },
        ]}>
        <Animated.View style={[
          styles.headerContent,
          getFadeUpStyle(anims.header, -16),
        ]}>
          <View style={{ marginTop: -20 }}>
            <CustomText
              label="My Transport"
              color="#FEFEFE"
              fontSize={24}
              fontFamily={fonts.bold}
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
          <View style={styles.card}>
            <View style={styles.top}>
              <View style={styles.busInfo}>
                <ImageFast source={Images.onduty} style={styles.ondutyImage} resizeMode="contain" />
                <CustomText
                  label={dutyUI.busTitle}
                  color="#101828"
                  fontSize={14}
                  fontFamily={fonts.semiBold}
                />
              </View>
              <View style={[styles.tag, { backgroundColor: dutyUI.tagBgColor}]}>
                <CustomText
                  label={dutyUI.tag}
                  color={dutyUI.tagColor}
                  fontSize={10}
                  fontFamily={fonts.bold}
                />
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoWrapper}>
                <View style={styles.circle} />
                <View style={styles.textRow}>
                  <CustomText
                    label={dutyUI.statusTitle}
                    color="#101828"
                    fontSize={14}
                    fontFamily={fonts.medium}
                  />
                  <CustomText
                    label={dutyUI.statusSubtitle}
                    color="#667085"
                    fontSize={12}
                    fontFamily={fonts.regular}
                    removeTranslation
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.routeDetails,
          getFadeUpStyle(anims.details, 24),
        ]}>
        <InfoCard
          title="Route Details"
          titleStatusType="pending"
          items={dutyUI.routeItems}
        />
      </Animated.View>

      {isOnDuty && (
        <Animated.View
          style={[
            styles.busLiveLocation,
            getFadeUpStyle(anims.map, 24),
          ]}>
          <CustomText
            label="Bus Live Location"
            color="#101828"
            fontSize={12}
            fontFamily={fonts.medium}
          />
          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              region={mapRegion}
            >
              <Marker
                coordinate={{
                  latitude: mapRegion.latitude,
                  longitude: mapRegion.longitude,
                }}
              />
            </MapView>
          </View>
          <View style={styles.busLocationInfo}>
            <View style={styles.dot} />
            <CustomText
              label={"Transmitting every 5 seconds"}
              color="#701A73"
              fontSize={12}
              fontFamily={fonts.medium}
            />
          </View>
        </Animated.View>
      )}

      {isOnDuty && dashboard?.next_stop && (
        <Animated.View style={[
          styles.nextStop,
          getFadeUpStyle(anims.map, 24),
        ]}>
          <View style={styles.card}>
            <View style={styles.top}>
              <View style={styles.busInfo}>
                <CustomText
                  label="Next Stop"
                  color="#101828"
                  fontSize={14}
                  fontFamily={fonts.semiBold}
                />
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoWrapper}>
                <ImageFast source={Images.nextStop} style={styles.nextStopIcon} resizeMode="contain" />
                <View style={styles.textRow}>
                  <CustomText
                    label={dashboard?.next_stop?.name}
                    color="#101828"
                    fontSize={14}
                    fontFamily={fonts.medium}
                  />
                  <CustomText
                    label={`ETA: ${dashboard?.next_stop?.eta_minutes} minutes`}
                    color="#667085"
                    fontSize={12}
                    fontFamily={fonts.regular}
                    removeTranslation
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
      <Animated.View
        style={{
          opacity: anims.actions,
          transform: [
            {
              translateY: anims.actions.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        }}>
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            activeOpacity={0.8}
            disabled={dutyLoading}
            onPress={dutyUI.onButtonPress}>
            <ImageFast
              source={dutyUI.buttonIcon}
              style={styles.discontinueIcon}
              resizeMode="contain"
            />
            <CustomText
              label={dutyUI.buttonLabel}
              color="#701A73"
              fontSize={14}
              fontFamily={fonts.medium}
            />
          </TouchableOpacity>
          {!isOnDuty && (
            <TouchableOpacity
              style={styles.buttonContainer}
              activeOpacity={0.8}
              disabled={dutyLoading}
              onPress={handleLogout}>
              <ImageFast
                source={Images.logout}
                style={styles.discontinueIcon}
                resizeMode="contain"
              />
              <CustomText
                label="Logout"
                color="#701A73"
                fontSize={14}
                fontFamily={fonts.medium}
              />
            </TouchableOpacity>
          )}
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
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ondutyImage: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  cardOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: -70,
    zIndex: 10,
    elevation: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  bodySpacer: {
    height: 110,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: "2%",
  },
  infoWrapper: {
    backgroundColor: '#FAFAFF',
    width: '100%',
    borderRadius: 8,
    height: 72,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  textRow: {
    gap: 4,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: COLORS.primaryColor,
  },
  busLiveLocation: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  nextStop: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    marginHorizontal: 16,
    marginTop: 10,
    overflow: 'hidden',
  },
  routeDetails: {
    marginHorizontal: 16,
    marginTop: 80,
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
  footerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 18,
    marginBottom: 50,
    marginHorizontal: 40,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F1F3F8',
    height: 48,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#701A73',
  },
  discontinueIcon: {
    width: 24,
    height: 24,
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
  nextStopIcon: {
    width: 16,
    height: 16,
  },
});
