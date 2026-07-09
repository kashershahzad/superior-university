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
    title: 'Fee Voucher Verification \n in Progress',
    description:
      'Your fee voucher has been uploaded \n successfully and is currently under verification. \n Our system is processing your request. \n You will be notified once the verification \n process is completed.',
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
    title: 'Fee Voucher Verified \nSuccessfully',
    description:
      'Your uploaded fee voucher has been \n verified successfully. \n Your transport service account is now active \n and you can access all transport-related \n features.',
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
    cardBorder: '#FCEDD8',
    image: Images.loading,
  },
  time: {
    bg: '#F5F2FB',          
    cardBorder: '#E9DEFF',
    image: Images.clock,
  },
  success: {
    bg: '#F1FAF2',        
    cardBorder: '#E3F1E5',
    image: Images.success,
  },
};

const SmallStatusCard = ({variant, title, subtitle}) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.processing;
  const {bg, image, cardBorder} = variantStyle;

  return (
    <View style={[styles.card, {backgroundColor: bg, borderColor: cardBorder}]}>
      <View style={styles.iconWrap}>
        <ImageFast source={image} style={styles.cardIcon} />
      </View>
      <View style={styles.textWrap}>
        <CustomText
          label={title}
          fontSize={15}
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

const VerificationContent = ({status, onPrimaryPress, onSecondaryPress}) => {
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
          fontSize={19}
          fontFamily={fonts.bold}
          color="#101828"
          textAlign="center"
          marginTop={24}
          lineHeight={26}
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
      <View style={[styles.buttonsWrap, {marginTop: status === 'success' ? 64 : status === 'pending' ? 12 : 0}]}>
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 17,
    paddingVertical: 23,
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
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
    paddingTop: 16,
    paddingBottom: 24,
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
  buttonsWrap: {
    // marginTop: 'auto',
  },
  cardIcon: {
    width: 38,
    height: 38,
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