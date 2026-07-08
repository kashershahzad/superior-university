import {StyleSheet, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';

import {setLocation} from '../../../store/reducer/usersSlice';
import GetLocation from '../../../utils/GetLocation';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';
import InfoCard from './InfoCard';
import GradientButton from './GradientButton';

const Feeunpaid = () => {
  const dispatch = useDispatch();
  const locationData = GetLocation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(setLocation(locationData));
  }, [locationData]);

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="transparent"
      translucent
      scrollEnabled
      footerUnScrollable={() => {
        return (
          <View style={styles.footerContainer}>
            <GradientButton
              title="Generate Fee Voucher"
              onPress={() => navigation.navigate('FeeVoucher')}
            />
          </View>
        );
      }}
      headerUnScrollable={() => {
        return (
          <View
            style={[
              styles.headerWrapper,
              {marginTop: -insets.top, paddingTop: insets.top},
            ]}>
            <View style={styles.headerContainer}>
              <View style={styles.profileContainer}>
                <ImageFast
                  source={Images.placeholderUser}
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
                    <ImageFast
                      source={Images.verfied}
                      style={styles.verfiedImage}
                      resizeMode="contain"
                    />
                  </View>
                  <CustomText
                    label="Nimra Sultan"
                    fontSize={12}
                    fontFamily={fonts.medium}
                    color="#701A73"
                  />
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <ImageFast
                  source={Images.profile}
                  style={styles.notificationImage}
                  resizeMode="contain"
                />
                <ImageFast
                  source={Images.notification}
                  style={styles.notificationImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        );
      }}>
      <View style={styles.container}>
        <ImageFast
          source={Images.cover2}
          style={{height: 120, width: '100%', marginBottom: 20}}
          resizeMode="contain"
        />

        <InfoCard
          title="Transport Service"
          titleStatus="Pending"
          titleStatusType="pending"
          items={[
            {item: 'Route', itemValue: '3-Faisalabad'},
            {item: 'Bus', itemValue: '#3 Jail Road'},
            {item: 'Submitted Date', itemValue: '21 May 2025'},
          ]}
        />

        <InfoCard
          title="What happens next"
          items={[
            {item: 'Request Submitted', itemStatus: 'Done', statusType: 'done'},
            {
              item: 'Under Review',
              itemStatus: 'In Progress',
              statusType: 'inProgress',
            },
            {
              item: 'Transport Assignment',
              itemStatus: 'Waiting',
              statusType: 'waiting',
            },
          ]}
        />
      </View>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerContainer: {
    backgroundColor: '#F1F3F8',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
});
