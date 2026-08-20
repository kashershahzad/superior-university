import { Animated, StyleSheet, View, TouchableOpacity, RefreshControl, Image } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../../../components/ScreenWrapper';
import fonts from '../../../assets/fonts';
import CustomText from '../../../components/CustomText';
import { Images } from '../../../assets/images';
import InfoCard from './InfoCard';
import ModalBox from './ModalBox';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { post, del, get } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';
import { COLORS } from '../../../utils/COLORS';
import { getCurrentCoords } from '../../../utils/GetLocation';

const DEFAULT_BUS_LOCATION = {
  latitude: 31.4704,
  longitude: 74.2507,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const FeePaid = ({ data, refreshing, onRefresh }) => {
  const insets = useSafeAreaInsets();
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [discontinuing, setDiscontinuing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const anims = useRef({
    header: new Animated.Value(0),
    card: new Animated.Value(0),
    map: new Animated.Value(0),
    details: new Animated.Value(0),
    actions: new Animated.Value(0),
  }).current;

  const user = data?.user || {};
  const transport = data?.transport_service || {};
  const feeStatus = data?.fee_status || 'paid';
  const busLabel = transport.bus || '-';
  const timePeriod = transport.active_period.label || '-';
  const pickupETA = transport.pickup_time;

  const actions = data?.actions || {};
  const canDiscontinue = !!actions.can_discontinue;
  const canCancelDiscontinue = !!actions.can_cancel_discontinue;
  const discontinuationId = data?.discontinuation_id; // cancel API ke liye

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

  const feeDetailsItems = [
    { item: 'Route', itemValue: transport.route},
    { item: 'Driver', itemValue: transport.driver },
    { item: 'Bus', itemValue: busLabel },
    // { item: 'Pickup ETA', itemValue: pickupETA },
    { item: 'Submitted Date', itemValue: transport.submitted_date},
  ];

  const handleDiscontinue = async (reason = '') => {
    if (discontinuing) return;
    setDiscontinuing(true);
    try {
      const res = await post('student/service/discontinue', {
        reason: String(reason || '').trim(),
      });
      if (res?.data?.success) {
        ToastMessage(res.data?.message || 'Service discontinuation requested', 'success');
        setSheetVisible(false);
        onRefresh?.(true); // dashboard dubara — flags update
      }
    } catch (err) {
      ToastMessage('Failed to discontinue service', 'error');
    } finally {
      setDiscontinuing(false);
    }
  };

  const handleCancelDiscontinue = async () => {
    if (cancelling) return;
    if (!discontinuationId) {
      ToastMessage('Discontinue request not found', 'error');
      return;
    }
    setCancelling(true);
    try {
      const res = await del(`student/service/discontinue/${discontinuationId}`);
      if (res?.data?.success) {
        ToastMessage(res.data?.message || 'Discontinuation cancelled', 'success');
        onRefresh?.(true);
      }
    } catch (err) {
      ToastMessage('Failed to cancel discontinuation', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const trackingInFlight = useRef(false);

  const fetchTracking = useCallback(async () => {
    if (trackingInFlight.current) {
      return;
    }
    trackingInFlight.current = true;
    try {
      const coords = await getCurrentCoords();
      console.log('Tracking API coords:', {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      const res = await get('student/transport/tracking', {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      console.log('Tracking API response:', res?.data ?? res);
      if (res?.data?.success) {
        setDistanceKm(res.data.data?.distance_km ?? null);
      }
    } catch (e) {
      console.log('Tracking error:', e);
    } finally {
      trackingInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isFocused) {
      return undefined;
    }
    fetchTracking();
    const intervalId = setInterval(fetchTracking, 5000);
    return () => clearInterval(intervalId);
  }, [isFocused, fetchTracking]);

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="#701A73"
      scrollEnabled
      refreshControl={
        <RefreshControl
          refreshing={!!refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primaryColor}
          colors={[COLORS.primaryColor]}
        />
      }
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
              label={user.name ? `Welcome ${user.name}!` : 'Welcome Back!'}
              color="#D9D6FE"
              fontSize={14}
              fontFamily={fonts.medium}
            />
          </View>
          <Image
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
            <CustomText
              label="Total Expense"
              color="#101828"
              fontSize={14}
              fontFamily={fonts.medium}
            />
            <CustomText
              label={timePeriod}
              color="#101828"
              fontSize={12}
              fontFamily={fonts.regular}
            />
            <View style={styles.infoContainer}>
              <TouchableOpacity
                style={styles.infoWrapper}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('Verification', { status: 'success' })
                }>
                <View>
                  <View style={styles.feeRow}>
                    <Image
                      source={Images.fee}
                      style={styles.feeImage}
                      resizeMode="contain"
                    />
                    <CustomText
                      label="Fee"
                      color="#475467"
                      fontSize={12}
                      fontFamily={fonts.medium}
                    />
                  </View>
                  <CustomText
                    label={feeStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    color="#101828"
                    fontSize={22}
                    fontFamily={fonts.regular}
                    marginTop={3}
                    marginLeft={2}
                    removeTranslation
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.infoWrapper}>
                <View style={styles.feeRow}>
                  <Image
                    source={Images.bus2}
                    style={styles.feeImage}
                    resizeMode="contain"
                  />
                  <CustomText
                    label="Bus"
                    color="#475467"
                    fontSize={12}
                    fontFamily={fonts.medium}
                  />
                </View>
                <CustomText
                  label={busLabel}
                  color="#101828"
                  fontSize={22}
                  fontFamily={fonts.regular}
                  marginTop={3}
                  marginLeft={2}
                  removeTranslation
                />
              </View>

              <View style={styles.infoWrapper}>
                <View style={styles.feeRow}>
                  <Image
                    source={Images.timer}
                    style={styles.feeImage}
                    resizeMode="contain"
                  />
                  <CustomText
                    label="Pickup ETA"
                    color="#475467"
                    fontSize={12}
                    fontFamily={fonts.medium}
                  />
                </View>
                <CustomText
                  label={pickupETA}
                  color="#101828"
                  fontSize={22}
                  fontFamily={fonts.regular}
                  marginTop={3}
                  marginLeft={2}
                  removeTranslation
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
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
        {isFocused && (
          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              initialRegion={
                DEFAULT_BUS_LOCATION
              }>
              <Marker
                coordinate={{
                  latitude: DEFAULT_BUS_LOCATION.latitude,
                  longitude: DEFAULT_BUS_LOCATION.longitude,
                }}
              />
            </MapView>
          </View>
        )}
        {feeStatus ? (
          <View style={styles.busLocationInfo}>
            <View style={styles.dot} />
            <CustomText
              label={
                feeStatus === 'unpaid'
                  ? 'Pay fee to unlock track'
                  : `Bus ${busLabel} ${distanceKm == null ? '0' : distanceKm}KM away`
              }
              color="#701A73"
              fontSize={12}
              fontFamily={fonts.medium}
              removeTranslation
            />
          </View>
        ) : null}
      </Animated.View>
      <Animated.View
        style={[
          styles.feeDetails,
          getFadeUpStyle(anims.details, 24),
        ]}>
        <InfoCard
          title="Bus Details"
          titleStatus={transport.status_label}
          titleStatusType={transport.status_label}
          items={feeDetailsItems}
        />
      </Animated.View>
      {(canDiscontinue || canCancelDiscontinue) ? (
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
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={discontinuing || cancelling}
          onPress={() => {
            if (canCancelDiscontinue) {
              handleCancelDiscontinue();
            } else {
              setSheetVisible(true);
            }
          }}>
          <View style={styles.footerContainer}>
            <Image
              source={Images.discontinue}
              style={styles.discontinueIcon}
              resizeMode="contain"
            />
            <CustomText
              label={canCancelDiscontinue ? 'Cancel Discontinue' : 'Discontinue Service'}
              color="#701A73"
              fontSize={14}
              fontFamily={fonts.medium}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
      ) : null}
      <ModalBox
        type="discontinue"
        isVisible={isSheetVisible}
        topImg={Images.modalImg}
        onClose={() => setSheetVisible(false)}
        onConfirm={handleDiscontinue}
        onKeepService={() => setSheetVisible(false)}
      />
    </ScreenWrapper>
  );
};

export default FeePaid;

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
    left: 16,
    right: 16,
    bottom: -70,
    zIndex: 10,
    elevation: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.12,
    // shadowRadius: 8,
    // elevation: 8,
  },
  bodySpacer: {
    height: 110,
  },
  infoContainer: {
    marginTop: 16,
    flexDirection: 'row',
    gap: "2%",
  },
  infoWrapper: {
    backgroundColor: '#F9F9F9',
    width: '32%',
    borderRadius: 8,
    height: 72,
    paddingHorizontal: 2,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EBECEE',
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  feeImage: {
    width: 24,
    height: 24,
  },
  busLiveLocation: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    marginHorizontal: 16,
    marginTop: 80,
    overflow: 'hidden',
  },
  feeDetails: {
    marginHorizontal: 16,
    marginTop: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F1F3F8',
    height: 48,
    marginBottom: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#701A73',
    marginHorizontal: 40,
    marginTop: 18,
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
});
