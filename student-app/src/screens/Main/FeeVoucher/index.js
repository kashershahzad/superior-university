import { StyleSheet, View, TouchableOpacity, Platform, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { Buffer } from 'buffer';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';

import { get, post } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';

import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { endPoints } from '../../../services/ENV';
import CustomButton from '../../../components/CustomButton';


const FeeVoucher = () => {

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const [exporting, setExporting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  const voucherId = route.params?.voucherId;

  useEffect(() => {
    const fetchVoucher = async () => {
      if (!voucherId) {
        setLoading(false);
        return;
      }
      try {
        const res = await get(`student/vouchers/${voucherId}`);
        if (res?.data?.success) {
          setVoucher(res.data.data);
        }
      } catch (err) {
        console.log('Voucher details error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [voucherId]);

  const handleCancelVoucher = async () => {
    const id = voucher?.id || voucherId;
    if (!id) {
      ToastMessage('Voucher not found', 'error');
      return;
    }
    if (cancelling) return;
    setCancelling(true);
    try {
      const res = await post(`student/vouchers/${id}/cancel`);
      if (res?.data?.success) {
        ToastMessage(res.data?.message || 'Voucher cancelled.', 'success');
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('TabStack');
        }
      } else {
        ToastMessage(
          res?.error?.message || res?.data?.message || 'Failed to cancel voucher',
          'error',
        );
      }
    } catch (err) {
      console.log('Cancel voucher error:', err);
      ToastMessage('Failed to cancel voucher', 'error');
    } finally {
      setCancelling(false);
    }
  };
  const handleExportPdf = async () => {
    const id = voucher?.id;
    if (!id) {
      ToastMessage('Voucher not found', 'error');
      return;
    }
    if (exporting) return;
    setExporting(true);

    let filePath = null;

    try {
      const token = await AsyncStorage.getItem('token');
      const rawName = voucher?.voucher_no || `voucher-${id}`;
      const fileName = String(rawName).toLowerCase().endsWith('.pdf')
        ? String(rawName)
        : `${rawName}.pdf`;

      filePath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;

      const response = await axios.get(
        `${endPoints.BASE_URL}/student/vouchers/${id}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/pdf',
          },
          responseType: 'arraybuffer',
          timeout: 60000,
        },
      );

      if (response.status !== 200) {
        throw new Error(`Server error ${response.status}`);
      }

      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      await ReactNativeBlobUtil.fs.writeFile(filePath, base64, 'base64');

      const stat = await ReactNativeBlobUtil.fs.stat(filePath);
      if (!stat?.size || Number(stat.size) < 100) {
        throw new Error('PDF file empty');
      }

      if (Platform.OS === 'android') {
        const mediaUri = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: fileName,
            parentFolder: '',
            mimeType: 'application/pdf',
          },
          'Download',
          filePath,
        );
        ToastMessage('PDF saved to Downloads', 'success');
        try {
          await ReactNativeBlobUtil.android.actionViewIntent(
            mediaUri || filePath,
            'application/pdf',
          );
        } catch (openErr) {
          console.log('Open PDF error:', openErr?.message || openErr);
          ToastMessage('PDF saved. Open it from Downloads folder.', 'error');
        }
        await ReactNativeBlobUtil.fs.unlink(filePath).catch(() => { });
      } else {
        ToastMessage('PDF downloaded', 'success');
        ReactNativeBlobUtil.ios.openDocument(filePath);
      }
    } catch (error) {
      console.log('Export PDF Error:', error?.message || error);
      const msg =
        error?.response?.status
          ? `Download failed (${error.response.status})`
          : error?.message || 'Failed to download PDF';
      ToastMessage(msg, 'error');
    } finally {
      setExporting(false);
    }
  };

  const VOUCHER_DETAILS = [
    { label: 'Voucher No.', value: voucher?.voucher_no || '-', wide: true },
    { label: 'Route', value: voucher?.route || '-' },
    { label: 'Bus No.', value: voucher?.bus_no ? `Bus #${voucher.bus_no}` : '-' },
    { label: 'Due Date', value: voucher?.due_date || '-', wide: true },
    {
      label: 'Fee',
      value: voucher?.monthly_fee != null
        ? `PKR ${Number(voucher.monthly_fee).toLocaleString()}`
        : '-',
      wide: true,
    },
    { label: 'Package', value: voucher?.installment.label || '-', wide: true },
  ];

  const DetailItem = ({ label, value }) => (
    <View style={styles.detailItem}>
      <CustomText
        label={label}
        fontSize={12}
        fontFamily={fonts.medium}
        color="#475467"
        numberOfLines={1}
      />
      <CustomText
        label={value}
        fontSize={16}
        fontFamily={fonts.medium}
        color="#344054"
        marginTop={4}
        numberOfLines={1}
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
        if (!voucher) return null;
        return (
          <View style={styles.footerContainer}>
            <GradientButton
              title="Export as PDF"
              loading={exporting}
              disabled={cancelling}
              onPress={handleExportPdf}
            />
            <CustomButton
              title="Cancel Voucher"
              backgroundColor="transparent"
              color={COLORS.primaryColor}
              borderWidth={1}
              borderColor={COLORS.primaryColor}
              borderRadius={24}
              height={48}
              marginTop={10}
              loading={cancelling}
              disabled={exporting || cancelling}
              indicatorColor={COLORS.primaryColor}
              onPress={handleCancelVoucher}
            />
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
                <Image
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
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={COLORS.primaryColor} />
          </View>
        ) : voucher ? (
          <View style={styles.cardWrapper}>
            <View style={styles.voucherHeader}>
              <Image
                source={Images.calender}
                style={{ width: 16, height: 16 }}
              />
              <CustomText label={voucher?.generated_date || '-'} fontSize={14} fontFamily={fonts.semiBold} color="#101828" marginLeft={8} />
            </View>
            <View style={styles.card}>
              <CustomText
                label="Transport Fees Voucher"
                removeTranslation
                fontSize={12}
                fontFamily={fonts.medium}
                color="#475467"
              />
              <Image
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
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}
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
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
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
    rowGap: 12,
  },
  detailItem: {
    width: '50%',
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
