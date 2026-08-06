import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Buffer } from 'buffer';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';
import { useRoute } from '@react-navigation/native';

import { Linking } from 'react-native';
import { get } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';

import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { endPoints } from '../../../services/ENV';


const FeeVoucher = () => {

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const [exporting, setExporting] = useState(false);
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

  const handleExportPdf = async () => {
    const id = voucher?.id;
    if (!id) {
      ToastMessage('Voucher not found', 'error');
      return;
    }
    if (exporting) return;
    setExporting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const rawName = voucher?.voucher_no;
      const fileName = String(rawName).toLowerCase().endsWith('.pdf')
        ? String(rawName)
        : `${rawName}.pdf`;
      const filePath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
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
      // Public Downloads (File Manager mein dikhegi)
      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: fileName,
            parentFolder: '',
            mimeType: 'application/pdf',
          },
          'Download',
          filePath,
        );
        // Cleanup temporary file
        await ReactNativeBlobUtil.fs.unlink(filePath).catch(() => { });
      }
      ToastMessage('PDF saved to Downloads', 'success');
      // Open with
      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.android.actionViewIntent(
          filePath,
          'application/pdf',
        );
      } else {
        ReactNativeBlobUtil.ios.openDocument(filePath);
      }
    } catch (error) {
      console.log('Export PDF Error:', error?.message || error);
      ToastMessage(error?.message || 'Failed to download PDF', 'error');
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
      label: 'Monthly Fee',
      value: voucher?.monthly_fee != null
        ? `PKR ${Number(voucher.monthly_fee).toLocaleString()}`
        : '-',
      wide: true,
    },
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
        return (
          <View style={styles.footerContainer}>
            <GradientButton title="Export as PDF"
              loading={exporting}
              onPress={handleExportPdf}
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
                  // style={item.wide ? styles.detailColWide : styles.detailCol}
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
    // gap: 32,
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
