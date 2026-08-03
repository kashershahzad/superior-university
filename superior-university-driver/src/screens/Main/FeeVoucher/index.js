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

const FeeVoucher = () => {

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();


  const VOUCHER_DETAILS = [
    { label: 'Voucher No.', value: 'TFV-2025-001', wide: true },
    { label: 'Route', value: 'Route 3' },
    { label: 'Bus No.', value: 'Bus #3' },
    { label: 'Due Date', value: '21 May 2026', wide: true },
    { label: 'Monthly Fee', value: 'PKR 8,000', wide: true },
  ];

  const DetailItem = ({label, value, style}) => (
    <View style={[styles.detailItem, style]}>
      <CustomText
        label={label}
        fontSize={12}
        fontFamily={fonts.medium}
        color="#475467"
      />
      <CustomText
        label={value}
        fontSize={16}
        fontFamily={fonts.medium}
        color="#344054"
        marginTop={4}
      />
    </View>
  );

  return (
    <ScreenWrapper
      backgroundColor="#FAFAFF"
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
            <CustomText label="30 May 2026" fontSize={14} fontFamily={fonts.semiBold} color="#101828" marginLeft={8} />
          </View>
          <View style={styles.card}>
            <CustomText
              label="Transport Fees Voucher"
              removeTranslation
              fontSize={12}
              fontFamily={fonts.medium}
              color="#475467"
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
                fontSize={12}
                fontFamily={fonts.semiBold}
                color="#475467"
              />
              <View style={styles.detailsUnderline} />
            </View>
            <View style={styles.detailsGrid}>
              {VOUCHER_DETAILS.map(item => (
                <DetailItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  style={item.wide ? styles.detailColWide : styles.detailCol}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default FeeVoucher;

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
    gap: 2,
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
    gap: 22,
    rowGap: 12,
  },
  detailCol: {
    width: '22%',
  },
  detailColWide: {
    width: '38%', // Voucher No + Due Date
  },
  detailItem: {
    marginBottom: 2,
  },
  footerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#D0D5DD',
    boxShadow: '0px -4px 9px rgba(170, 159, 254, 0.10), 0px -17px 17px rgba(170, 159, 254, 0.09), 0px -38px 23px rgba(170, 159, 254, 0.05), 0px -67px 27px rgba(170, 159, 254, 0.01), 0px -105px 29px rgba(170, 159, 254, 0)',
  },
});
