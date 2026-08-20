import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomText from '../../../components/CustomText';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import { COLORS } from '../../../utils/COLORS';
import GradientButton from '../Home/GradientButton';
import i18n from '../../../language/i18n';
import { get } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';

const VARIANT_STYLES = {
  processing: {
    bg: '#FDF7ED',
    cardBorder: '#FCEDD8',
    image: Images.loading,
    color: '#F8A837',
  },
  time: {
    bg: '#F5F2FB',
    cardBorder: '#E9DEFF',
    image: Images.clock,
    color: '#995DB4',
  },
  success: {
    bg: '#F1FAF2',
    cardBorder: '#E3F1E5',
    image: Images.success,
    color: '#6CC268',
  },
};

const SmallStatusCard = ({ variant, title, subtitle }) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.processing;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.cardBorder,
        },
      ]}>
      <View style={styles.iconWrap}>
        <Image source={variantStyle.image} style={styles.cardIcon} />
      </View>
      <View style={styles.textWrap}>
        <CustomText
          label={title}
          fontSize={16}
          fontFamily={fonts.bold}
          color={variantStyle.color}
        />
        <CustomText
          label={subtitle}
          fontSize={14}
          fontFamily={fonts.regular}
          color="#A2A6A3"
          marginTop={4}
        />
      </View>
    </View>
  );
};

const isSuccess = data => {
  if (!data) {
    return false;
  }
  if (data.account_active) {
    return true;
  }
  const status = String(data.status || '').toLowerCase();
  return ['verified', 'success', 'approved', 'completed', 'active'].includes(
    status,
  );
};

const VerificationContent = ({ onStatusChange }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [noVoucher, setNoVoucher] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await get('student/vouchers/upload/status');

        if (res?.error) {
          const message = String(
            res.error?.message || res.error?.data?.message || '',
          ).toLowerCase();
          if (message.includes('no voucher')) {
            setNoVoucher(true);
            setData(null);
            onStatusChange?.('no_voucher');
          } else {
            ToastMessage(res.error?.message || 'Something went wrong', 'error');
          }
          return;
        }

        if (res?.data?.success) {
          const apiData = res.data.data || null;
          setNoVoucher(false);
          setData(apiData);
          onStatusChange?.(isSuccess(apiData) ? 'success' : 'processing');
        }
      } catch (err) {
        console.log('Voucher status error:', err);
        ToastMessage('Failed to load verification status', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'TabStack',
          params: { screen: i18n.t('Home') },
        },
      ],
    });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      </View>
    );
  }

  if (noVoucher || !data) {
    return (
      <View style={styles.content}>
        <View style={styles.top}>
          <View style={styles.heroWrap}>
            {/* <ImageFast
              source={Images.verificationPending}
              style={styles.heroImage}
              resizeMode="contain"
            /> */}
            <CustomText
              label="Haven't uploaded voucher yet"
              fontSize={19}
              fontFamily={fonts.bold}
              color="#363D4B"
              textAlign="center"
              marginTop={24}
              lineHeight={26}
            />
            <CustomText
              label="Please upload your fee voucher to start the verification process."
              fontSize={13}
              fontFamily={fonts.regular}
              color="#A3A3A4"
              textAlign="center"
              marginTop={12}
              lineHeight={20}
            />
          </View>
        </View>

        <View style={[styles.buttonsWrap, { marginTop: 64 }]}>
          <GradientButton title="Go to Home" onPress={goHome} />
          <View style={{ height: 12 }} />
          {/* <TouchableOpacity onPress={goHome}>
            <View style={styles.outlineBtn}>
              <CustomText
                label="Close"
                fontSize={15}
                fontFamily={fonts.semiBold}
                color={COLORS.primaryColor}
              />
            </View>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  }

  const success = isSuccess(data);

  return (
    <View style={styles.content}>
      <View style={styles.top}>
        <View style={styles.heroWrap}>
          <Image
            source={
              success ? Images.verificationSuccess : Images.verificationPending
            }
            style={styles.heroImage}
            resizeMode="contain"
          />
          <CustomText
            label={data.headline}
            fontSize={19}
            fontFamily={fonts.bold}
            color="#363D4B"
            textAlign="center"
            marginTop={24}
            lineHeight={26}
          />
          <CustomText
            label={data.message}
            fontSize={13}
            fontFamily={fonts.regular}
            color="#A3A3A4"
            textAlign="center"
            marginTop={12}
            lineHeight={20}
          />
        </View>

        <View style={styles.cardsWrap}>
          {success ? (
            <SmallStatusCard
              variant="success"
              title="Verification Complete"
              subtitle="Your document has been verified."
            />
          ) : (
            <>
              {data.processing ? (
                <SmallStatusCard
                  variant="processing"
                  title="Processing..."
                  subtitle="We are verifying your document."
                />
              ) : null}
              {data.estimated_time ? (
                <SmallStatusCard
                  variant="time"
                  title="Estimated Time"
                  subtitle={data.estimated_time}
                />
              ) : null}
            </>
          )}
        </View>
      </View>

      <View style={[styles.buttonsWrap, { marginTop: success ? 64 : 12 }]}>
        <GradientButton title="Go to Home" onPress={goHome} />
        <View style={{ height: 12 }} />
        {/* <TouchableOpacity onPress={goHome}>
          <View style={styles.outlineBtn}>
            <CustomText
              label="Close"
              fontSize={15}
              fontFamily={fonts.semiBold}
              color={COLORS.primaryColor}
            />
          </View>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default VerificationContent;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 16,
    paddingVertical: 20,
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  heroWrap: {
    marginTop: 30,
    alignItems: 'center',
  },
  heroImage: {
    width: 182,
    height: 140,
  },
  cardsWrap: {
    marginTop: 30,
    gap: 19,
  },
  cardIcon: {
    width: 39,
    height: 39,
    resizeMode: 'contain',
    overflow: 'visible',
  },
  outlineBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
