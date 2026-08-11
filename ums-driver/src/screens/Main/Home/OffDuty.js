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
import CustomButton from '../../../components/CustomButton';
import { COLORS } from '../../../utils/COLORS';

const DEFAULT_BUS_LOCATION = {
  latitude: 31.4704,
  longitude: 74.2507,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const FeePaid = ({ feestatus, onShowUnpaid, onShowOnDuty }) => {
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
                  label="Bus #03 . off duty"
                  color="#101828"
                  fontSize={14}
                  fontFamily={fonts.semiBold}
                />
              </View>
              <View style={styles.tag}>
                <CustomText
                  label="Offline"
                  color="#88878A"
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
                    label="Location sharing Paused"
                    color="#101828"
                    fontSize={14}
                    fontFamily={fonts.medium}
                  />
                  <CustomText
                    label="Go online to start broadcasting"
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
          items={[
            { item: 'Driver', itemValue: 'Tariq Mehmood' },
            { item: 'Assigned bus', itemValue: 'Bus #03' },
            { item: 'Assigned Route', itemValue: '3-Faisalabad' },
            { item: 'Tody’s shift', itemValue: '7:00 AM-4:00PM' },
          ]}
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
          onPress={() => onShowOnDuty?.()}>
          <View style={styles.footerContainer}>
            <ImageFast
              source={Images.startDuty}
              style={styles.discontinueIcon}
              resizeMode="contain"
            />
            <CustomText
              label="Start Duty / Go Online"
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
    backgroundColor: '#F1EFE8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ondutyImage: {
    width: 16,
    height: 16,
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
    // marginTop: 16,
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
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: COLORS.primaryColor,
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
    // marginTop: 16,
    overflow: 'hidden',
  },
  nextStop: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    // padding: 16,
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
    marginTop: 12,
    marginBottom: 50,
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
