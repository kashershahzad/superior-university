import { Animated, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import InfoCard from './InfoCard';
import GradientButton from './GradientButton';
import ModalBox from './ModalBox';
import CustomButton from '../../../components/CustomButton';
import { COLORS } from '../../../utils/COLORS';

const TIMELINE_STATUS = {
  done: { label: 'Done', type: 'done' },
  in_progress: { label: 'In Progress', type: 'inProgress' },
  waiting: { label: 'Waiting', type: 'waiting' },
};

const Feeunpaid = ({ data }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const anims = useRef({
    header: new Animated.Value(0),
    cover: new Animated.Value(0),
    service: new Animated.Value(0),
    steps: new Animated.Value(0),
    actions: new Animated.Value(0),
  }).current;

  const user = data?.user || {};
  const transport = data?.transport_service || {};
  const actions = data?.actions || {};
  const timeline = data?.timeline || [];

  useEffect(() => {
    const animate = value =>
      Animated.timing(value, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      });

    const entranceAnimation = Animated.stagger(110, [
      animate(anims.header),
      animate(anims.cover),
      animate(anims.service),
      animate(anims.steps),
      animate(anims.actions),
    ]);

    entranceAnimation.start();

    return () => entranceAnimation.stop();
  }, [anims]);

  const fadeUpStyle = (animation, distance = 20) => ({
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

  const profileSource = user.profile_photo
    ? { uri: user.profile_photo }
    : Images.placeholderUser;

  const serviceItems = [
    { item: 'Route', itemValue: transport.route || '-' },
    { item: 'Bus', itemValue: transport.bus || '-' },
    { item: 'Submitted Date', itemValue: transport.submitted_date || '-' },
  ];

  const timelineItems = timeline.map(step => {
    const status = TIMELINE_STATUS[step.state] || TIMELINE_STATUS.waiting;
    return {
      item: step.label,
      itemStatus: status.label,
      statusType: status.type,
    };
  });

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="transparent"
      translucent
      scrollEnabled
      headerUnScrollable={() => {
        return (
          <View
            style={[
              styles.headerWrapper,
              { marginTop: -insets.top, paddingTop: insets.top },
            ]}>
            <Animated.View
              style={[
                styles.headerContainer,
                fadeUpStyle(anims.header, -14),
              ]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.profileContainer}>
                  <ImageFast
                    source={profileSource}
                    style={styles.profileImage}
                    resizeMode="contain"
                  />
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                      }}>
                      <CustomText
                        label="Welcome"
                        fontSize={16}
                        fontFamily={fonts.medium}
                        color="#2D2D2D"
                      />
                      {user.is_verified ? (
                        <ImageFast
                          source={Images.verfied}
                          style={styles.verfiedImage}
                          resizeMode="contain"
                        />
                      ) : null}
                    </View>
                    <CustomText
                      label={user.name || '-'}
                      fontSize={12}
                      fontFamily={fonts.medium}
                      color="#701A73"
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Profile')}
              >
                <ImageFast
                  source={Images.profile}
                  style={styles.notificationImage}
                  resizeMode="contain"
                />
                </TouchableOpacity>
                <ImageFast
                  source={Images.notification}
                  style={styles.notificationImage}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
          </View>
        );
      }}>
      <View style={styles.container}>
        <Animated.View style={fadeUpStyle(anims.cover, 18)}>
          <ImageFast
            source={Images.cover2}
            style={{ height: 120, width: '100%', marginBottom: 4 }}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            fadeUpStyle(anims.service, 22),
            {
              transform: [
                {
                  translateY: anims.service.interpolate({
                    inputRange: [0, 1],
                    outputRange: [22, 0],
                  }),
                },
                {
                  scale: anims.service.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                  }),
                },
              ],
            },
          ]}>
          <InfoCard
            title="Transport Service"
            titleStatus={transport.status_label || transport.status || 'Pending'}
            titleStatusType={transport.status || 'pending'}
            items={serviceItems}
          />
        </Animated.View>

        <Animated.View style={fadeUpStyle(anims.steps, 22)}>
          <InfoCard
            title="What happens next"
            items={timelineItems}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.footerContainer,
            fadeUpStyle(anims.actions, 18),
          ]}>
          {actions.can_upload_voucher ? (
            <CustomButton
              title="Upload Fee Voucher"
              backgroundColor="transparent"
              color={COLORS.primaryColor}
              borderWidth={1}
              borderColor={COLORS.primaryColor}
              borderRadius={24}
              height={48}
              marginBottom={8}
              onPress={() => setIsModalVisible(true)}
            />
          ) : null}
          {actions.can_generate_voucher ? (
            <GradientButton
              title="Generate Fee Voucher"
              onPress={() => navigation.navigate('FeeVoucher')}
            />
          ) : null}
        </Animated.View>
      </View>

      <ModalBox
        type={'upload'}
        isVisible={isModalVisible}
        topImg={Images.uploadImg}
        onClose={() => setIsModalVisible(false)}
        onUpload={(data) => {
          console.log('Voucher uploaded:', data);
          setIsModalVisible(false);
        }}
      />
    </ScreenWrapper>
  );
};

export default Feeunpaid;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
    paddingTop: 20,
    paddingBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 20,
  },
  verfiedImage: {
    width: 20,
    height: 20,
    marginTop: 5,
  },
  notificationImage: {
    width: 40,
    height: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 24,
  },
});
