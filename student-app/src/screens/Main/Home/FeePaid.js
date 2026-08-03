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
import ModalBox from './ModalBox';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const DEFAULT_BUS_LOCATION = {
  latitude: 31.4704,
  longitude: 74.2507,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const FeePaid = ({ data }) => {
  const insets = useSafeAreaInsets();
  const [isSheetVisible, setSheetVisible] = useState(false);
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
    { item: 'Route', itemValue: transport.route || '-' },
    { item: 'Bus', itemValue: busLabel },
    { item: 'Submitted Date', itemValue: transport.submitted_date || '-' },
  ];

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
              label={user.name ? `Welcome ${user.name}!` : 'Welcome Back!'}
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
            <CustomText
              label="Total Expense"
              color="#101828"
              fontSize={14}
              fontFamily={fonts.medium}
            />
            <CustomText
              label="Period 1 Jan 2024 - 30 Dec 2024"
              color="#101828"
              fontSize={12}
              fontFamily={fonts.regular}
            />
            <View style={styles.infoContainer}>
              <TouchableOpacity style={styles.infoWrapper} activeOpacity={0.8} onPress={() => navigation.navigate('Fees', {
                status: feeStatus,
                unlockText: feeStatus === 'unpaid' ? 'Pay fee to unlock track' : `${busLabel} nearby`,
              })}>
                <View>
                  <View style={styles.feeRow}>
                    <ImageFast
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
                  <ImageFast
                    source={Images.bus2}
                    style={styles.feeImage}
                    resizeMode="contain"
                  />
                  <CustomText
                    label="Buss"
                    color="#475467"
                    fontSize={12}
                    fontFamily={fonts.medium}
                  />
                </View>
                <CustomText
                  label={busLabel}
                  color="#101828"
                  fontSize={16}
                  fontFamily={fonts.regular}
                  marginTop={3}
                  marginLeft={2}
                  removeTranslation
                />
              </View>

              <View style={styles.infoWrapper}>
                <View style={styles.feeRow}>
                  <ImageFast
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
                  label="08:15"
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
        {feeStatus ? (
          <View style={styles.busLocationInfo}>
            <View style={styles.dot} />
            <CustomText
              label={feeStatus === 'unpaid' ? 'Pay fee to unlock track' : `${busLabel} nearby`}
              color="#701A73"
              fontSize={12}
              fontFamily={fonts.medium}
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
          title="Fee Details"
          titleStatus={transport.status_label}
          titleStatusType={transport.status || 'pending'}
          items={feeDetailsItems}
        />
      </Animated.View>
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
          onPress={() => setSheetVisible(true)}>
          <View style={styles.footerContainer}>
            <ImageFast
              source={Images.discontinue}
              style={styles.discontinueIcon}
              resizeMode="contain"
            />
            <CustomText
              label="Discontinue Service"
              color="#701A73"
              fontSize={14}
              fontFamily={fonts.medium}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
      <ModalBox
        type="discontinue"
        isVisible={isSheetVisible}
        topImg={Images.modalImg}
        onClose={() => setSheetVisible(false)}
        onConfirm={() => {
          setSheetVisible(false);
        }}
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
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EBECEE',
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
