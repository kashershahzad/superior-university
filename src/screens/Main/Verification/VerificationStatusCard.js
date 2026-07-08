import React from 'react';
import {StyleSheet, View} from 'react-native';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';
import {COLORS} from '../../../utils/COLORS';
import GradientButton from '../Home/GradientButton';

const VERIFICATION_CONFIG = {
  pending: {
    heroImage: Images.verificationPending,
    title: 'Fee Voucher Verification in Progress',
    description:
      'Your fee voucher has been uploaded successfully and is currently under verification. Our system is processing your request. You will be notified once the verification process is completed.',
    cards: [
      {
        variant: 'processing',
        title: 'Processing...',
        subtitle: 'We are verifying your document.',
      },
      {
        variant: 'time',
        title: 'Estimated Time',
        subtitle: 'Verification may take 1-2 business days.',
      },
    ],
    primaryButton: 'OK',
    secondaryButton: 'View Status',
  },
  success: {
    heroImage: Images.verificationSuccess,
    title: 'Fee Voucher Verified Successfully',
    description:
      'Your uploaded fee voucher has been verified successfully. Your transport service account is now active and you can access all transport-related features.',
    cards: [
      {
        variant: 'success',
        title: 'Verification Complete',
        subtitle: 'Your document has been verified.',
      },
    ],
    primaryButton: 'Go to Home',
    secondaryButton: 'Close',
  },
};

const VARIANT_STYLES = {
  processing: {
    bg: '#FDF7ED',         
    image: Images.loading,
  },
  time: {
    bg: '#F5F2FB',          
    image: Images.clock,
  },
  success: {
    bg: '#F1FAF2',        
    image: Images.success,
  },
};

const SmallStatusCard = ({variant, title, subtitle}) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.processing;
  const {bg, image, border} = variantStyle;

  return (
    <View style={[styles.card, {backgroundColor: bg, borderColor: border}]}>
      <View style={styles.iconWrap}>
        <ImageFast source={image} style={styles.cardIcon} />
      </View>
      <View style={styles.textWrap}>
        <CustomText
          label={title}
          fontSize={13}
          fontFamily={fonts.semiBold}
          color={
            variant === 'time' ? COLORS.primaryColor : variant === 'success' ? '#6CC268' : '#F8A837'
          }
        />
        <CustomText
          label={subtitle}
          fontSize={12}
          fontFamily={fonts.regular}
          color="#667085"
          marginTop={4}
        />
      </View>
    </View>
  );
};

const VerificationContent = ({status = 'pending', onPrimaryPress, onSecondaryPress}) => {
  const config = VERIFICATION_CONFIG[status] || VERIFICATION_CONFIG.pending;

  return (
    <View style={styles.content}>
      {/* Hero image + texts */}
      <View style={styles.heroWrap}>
        <ImageFast
          source={config.heroImage}
          style={styles.heroImage}
          resizeMode="contain"
        />
        <CustomText
          label={config.title}
          fontSize={18}
          fontFamily={fonts.bold}
          color="#101828"
          textAlign="center"
          marginTop={24}
        />
        <CustomText
          label={config.description}
          fontSize={13}
          fontFamily={fonts.regular}
          color="#667085"
          textAlign="center"
          marginTop={12}
          lineHeight={20}
        />
      </View>

      {/* Cards */}
      <View style={styles.cardsWrap}>
        {config.cards.map(card => (
          <SmallStatusCard
            key={card.title}
            variant={card.variant}
            title={card.title}
            subtitle={card.subtitle}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonsWrap}>
        <GradientButton
          title={config.primaryButton}
          onPress={onPrimaryPress}
        />
        <View style={{height: 12}} />
        <View style={styles.outlineBtn}>
          <CustomText
            label={config.secondaryButton}
            fontSize={15}
            fontFamily={fonts.semiBold}
            color={COLORS.primaryColor}
          />
        </View>
      </View>
    </View>
  );
};

export default VerificationContent;


const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderRadius: 12,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 30,
  },
  heroWrap: {
    alignItems: 'center',
  },
  heroImage: {
    width: 220,
    height: 220,
  },
  cardsWrap: {
    gap: 12,
  },
  buttonsWrap: {
    marginTop: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
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