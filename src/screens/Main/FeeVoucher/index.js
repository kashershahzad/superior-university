import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';

const Home = () => {

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();


  const VOUCHER_DETAILS = [
    { label: 'Voucher No.', value: 'TFV-2025-001' },
    { label: 'Route', value: 'Route 3' },
    { label: 'Bus No.', value: 'Bus #3' },
    { label: 'Due Date', value: '21 May 2026' },
    { label: 'Monthly Fee', value: 'PKR 1000' },
  ];

  const DetailItem = ({label, value, style}) => (
    <View style={[styles.detailItem, style]}>
      <CustomText
        label={label}
        fontSize={12}
        fontFamily={fonts.medium}
        color="#98A2B3"
      />
      <CustomText
        label={value}
        fontSize={14}
        fontFamily={fonts.bold}
        color="#0C1B54"
        marginTop={4}
      />
    </View>
  );

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
            <GradientButton title="Export as PDF" onPress={() => { }} />
          </View>
        );
      }}
      headerUnScrollable={() => {
        return (
          <View
            style={[
              styles.headerWrapper,
              { marginTop: -insets.top, paddingTop: insets.top },
            ]}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.backButton}
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                    return;
                  }
                  navigation.navigate('Home');
                }}>
                <ImageFast
                  source={Images.backArrow}
                  style={{ width: 18, height: 18 }}
                />
              </TouchableOpacity>
              <CustomText label="Generate Fee Voucher" fontSize={16} fontFamily={fonts.bold} color="#101828" />
            </View>
          </View>
        );
      }}
    >
      <View style={styles.container}>
        <View style={styles.cardWrapper}>
          <View style={styles.voucherHeader}>
            <ImageFast
              source={Images.calender}
              style={{ width: 16, height: 16}}
            />
            <CustomText label="30 May 2026" fontSize={14} fontFamily={fonts.medium} color="#0C1B54" marginLeft={8} />
          </View>
          <View style={styles.card}>
            <CustomText
              label="Transport Fees Voucher"
              removeTranslation
              fontSize={14}
              fontFamily={fonts.medium}
              color="#6D7698"
            />
            <ImageFast
              source={Images.voucher}
              style={styles.voucherPreview}
              resizeMode="contain"
            />
            <View style={styles.detailsHeader}>
              <CustomText
                label="Voucher Details"
                removeTranslation
                fontSize={14}
                fontFamily={fonts.semiBold}
                color="#6D7698"
              />
              <View style={styles.detailsUnderline} />
            </View>
            <View style={styles.detailsGrid}>
              {VOUCHER_DETAILS.map(item => (
                <DetailItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  style={styles.detailCol}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    gap: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  voucherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  cardWrapper: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 12,
    padding: 12
  },
  voucherPreview: {
    width: '100%',
    height: 170,
    marginTop: 14,
    marginBottom: 18,
  },
  detailsHeader: {
    marginBottom: 14,
  },
  detailsUnderline: {
    width: 16,
    height: 2,
    backgroundColor: '#344054',  
    borderRadius: 2,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
    rowGap: 16,
  },
  detailCol: {
    width: '31%',
  },
  detailItem: {
    marginBottom: 2,
  },
  footerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 20,
  },
});
