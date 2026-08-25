import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import GradientButton from '../Home/GradientButton';

import {get, post} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {COLORS} from '../../../utils/COLORS';
import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';

const formatAmount = amount => `PKR ${Number(amount || 0).toLocaleString()}`;

const SelectFeePackage = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  // 'generate' (default from unpaid) | 'add' | 'change' (from profile)
  const mode = route.params?.mode || 'generate';
  const isChange = mode === 'change';
  const isProfileFlow = mode === 'add' || mode === 'change';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [periods, setPeriods] = useState([]);
  const [fee, setFee] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);

  const screenTitle = isChange
    ? 'Change Fee Period'
    : mode === 'add'
      ? 'Add Fee Period'
      : 'Select Fee Package';

  useEffect(() => {
    const fetchPeriods = async () => {
      setLoading(true);
      try {
        const res = await get('student/fee-installments');
        if (res?.data?.success) {
          const data = res.data.data || {};
          setPeriods(data.periods || []);
          setFee(data.fee || null);
          setSelectedCycle(data.selected_cycle || null);
        } else {
          ToastMessage(res?.error?.message || 'Failed to load packages', 'error');
        }
      } catch (err) {
        console.log('Fee periods error:', err);
        ToastMessage('Failed to load packages', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPeriods();
  }, []);

  const handleConfirm = async () => {
    if (!selectedCycle) {
      ToastMessage('Please select a package', 'error');
      return;
    }
    if (submitting) return;

    const selected = periods.find(item => item.cycle === selectedCycle);
    const startDate =
      selected?.installments?.[0]?.due_date ||
      new Date().toISOString().slice(0, 10);

    const payload = {
      cycle: selectedCycle,
      start_date: startDate,
    };

    setSubmitting(true);
    try {
      if (isChange) {
        const res = await post('student/fee-installments/change', payload);
        if (res?.data?.success) {
          ToastMessage(
            res.data?.message || 'Fee period updated.',
            'success',
          );
          navigation.goBack();
        } else {
          ToastMessage(
            res?.error?.message || 'Failed to change fee period',
            'error',
          );
        }
        return;
      }

      const periodRes = await post('student/fee-installments', payload);
      if (!periodRes?.data?.success) {
        ToastMessage(
          periodRes?.error?.message || 'Failed to select package',
          'error',
        );
        return;
      }

      if (isProfileFlow) {
        ToastMessage(
          periodRes.data?.message || 'Fee period added.',
          'success',
        );
        navigation.goBack();
        return;
      }

      const voucherRes = await post('student/vouchers/generate');
      if (voucherRes?.data?.success) {
        const voucherId = voucherRes.data.data?.id;
        ToastMessage(
          voucherRes.data?.message || 'Fee voucher generated.',
          'success',
        );
        navigation.replace('FeeVoucher', {voucherId});
      } else {
        ToastMessage(
          voucherRes?.error?.message || 'Failed to generate voucher',
          'error',
        );
      }
    } catch (err) {
      console.log('Select fee package error:', err);
      ToastMessage(
        isChange
          ? 'Failed to change fee period'
          : 'Failed to save fee package',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper
      backgroundColor="#FAFAFF"
      paddingHorizontal={0}
      statusBarColor="transparent"
      translucent
      scrollEnabled={false}
      footerUnScrollable={() => (
        <View style={styles.footerContainer}>
          <GradientButton
            title="Continue"
            loading={submitting}
            disabled={loading || !selectedCycle}
            onPress={handleConfirm}
          />
        </View>
      )}
      headerUnScrollable={() => (
        <View
          style={[
            styles.headerWrapper,
            {marginTop: -insets.top, paddingTop: insets.top},
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
                style={{width: 18, height: 18}}
              />
            </TouchableOpacity>
            <CustomText
              label={screenTitle}
              fontSize={16}
              fontFamily={fonts.bold}
              color="#101828"
              removeTranslation
            />
          </View>
        </View>
      )}>
      <View style={styles.container}>
        <CustomText
          label="Choose how you want to pay your transport fee"
          fontSize={13}
          fontFamily={fonts.medium}
          color="#667085"
          marginBottom={16}
          removeTranslation
        />

        {fee?.total != null ? (
          <CustomText
            label={`Total Fee: ${formatAmount(fee.total)}`}
            fontSize={14}
            fontFamily={fonts.semiBold}
            color={COLORS.primaryColor}
            marginBottom={14}
            removeTranslation
          />
        ) : null}

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primaryColor} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            bounces={false}>
            {periods.map(item => {
              const active = selectedCycle === item.cycle;
              return (
                <TouchableOpacity
                  key={item.cycle}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCycle(item.cycle)}
                  style={[styles.card, active && styles.cardActive]}>
                  <View style={styles.cardTop}>
                    <CustomText
                      label={item.short_label || item.label}
                      fontSize={15}
                      fontFamily={fonts.semiBold}
                      color="#101828"
                      removeTranslation
                    />
                    <CustomText
                      label={formatAmount(item.installment_amount)}
                      fontSize={14}
                      fontFamily={fonts.bold}
                      color={COLORS.primaryColor}
                      removeTranslation
                    />
                  </View>
                  <CustomText
                    label={item.label}
                    fontSize={12}
                    fontFamily={fonts.medium}
                    color="#667085"
                    marginTop={4}
                    removeTranslation
                  />
                  <CustomText
                    label={`${item.installment_count} installment${
                      item.installment_count > 1 ? 's' : ''
                    }`}
                    fontSize={12}
                    fontFamily={fonts.regular}
                    color="#98A2B3"
                    marginTop={4}
                    removeTranslation
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default SelectFeePackage;

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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  cardActive: {
    borderColor: COLORS.primaryColor,
    backgroundColor: '#F9F0FA',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#D0D5DD',
  },
});
