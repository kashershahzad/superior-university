import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PixelRatio,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useState, useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {captureRef} from 'react-native-view-shot';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import {COLORS} from '../../../utils/COLORS';

import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';
import StudentCard from './StudentCard';

import {get} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {createPdfFromJpegBase64} from '../../../utils/jpegToPdf';

const GenerateCard = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const cardRef = useRef(null);
  const cardSizeRef = useRef({width: 0, height: 0});
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await get('student/card');
        console.log('Card details:', res?.data?.data);
        if (res?.data?.success) {
          setCard(res.data.data);
        } else {
          ToastMessage(res?.error?.message || 'Failed to load card', 'error');
        }
      } catch (err) {
        console.log('Card details error:', err);
        ToastMessage('Failed to load card', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, []);

  const handleDownloadCard = async () => {
    if (downloading) return;
    if (!card || !cardRef.current) {
      ToastMessage('Card not found', 'error');
      return;
    }

    setDownloading(true);
    try {
      const layoutW = cardSizeRef.current.width || 360;
      const layoutH = cardSizeRef.current.height || 280;
      const pixelRatio = PixelRatio.get();
      const captureW = Math.round(layoutW * pixelRatio);
      const captureH = Math.round(layoutH * pixelRatio);

      const jpegBase64 = await captureRef(cardRef, {
        format: 'jpg',
        quality: 1,
        result: 'base64',
        width: captureW,
        height: captureH,
      });

      const pdfBase64 = createPdfFromJpegBase64(
        jpegBase64,
        captureW,
        captureH,
      );

      const rawName = card?.card_no || 'student-card';
      const fileName = `${String(rawName).replace(/[^\w.-]/g, '_')}.pdf`;
      const pdfPath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;

      await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');

      if (Platform.OS === 'android') {
        try {
          await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: fileName,
              parentFolder: '',
              mimeType: 'application/pdf',
            },
            'Download',
            pdfPath,
          );
        } catch (mediaErr) {
          console.log('Media store copy skipped:', mediaErr?.message || mediaErr);
        }
      }

      ToastMessage('Card saved as PDF', 'success');

      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.android.actionViewIntent(
          pdfPath,
          'application/pdf',
        );
      } else {
        ReactNativeBlobUtil.ios.openDocument(pdfPath);
      }
    } catch (error) {
      console.log('Download card error:', error?.message || error);
      ToastMessage(error?.message || 'Failed to download card', 'error');
    } finally {
      setDownloading(false);
    }
  };

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
                label="Generate Card"
                fontSize={16}
                fontFamily={fonts.bold}
                color="#101828"
              />
            </View>
          </View>
        );
      }}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      ) : (
        <View style={styles.container}>
          <View style={styles.cardInfoContainer}>
            <Image
              source={Images.check}
              style={{width: 16, height: 16}}
              resizeMode="contain"
            />
            <CustomText
              label={card?.message}
              fontSize={13}
              fontFamily={fonts.medium}
              color="#19B36E"
            />
          </View>
          <View style={styles.cardRoundedClip}>
            <View
              ref={cardRef}
              collapsable={false}
              style={styles.cardCaptureWrap}
              onLayout={e => {
                const {width, height} = e.nativeEvent.layout;
                if (width > 0 && height > 0) {
                  cardSizeRef.current = {width, height};
                }
              }}>
              <StudentCard card={card} />
            </View>
          </View>
          <CustomText
            label="Show this card while boarding the university transport."
            fontSize={13}
            fontFamily={fonts.medium}
            color="#475467"
            textAlign="center"
          />
          <View style={styles.buttonContainer}>
            <GradientButton
              title="Download Card"
              loading={downloading}
              onPress={handleDownloadCard}
            />
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
};

export default GenerateCard;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    gap: 84,
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
    paddingHorizontal: 20,
    gap: 24,
  },
  cardRoundedClip: {
    borderRadius: 17,
    overflow: 'hidden',
  },
  cardCaptureWrap: {
    backgroundColor: '#FFFFFF',
  },
  cardInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  buttonContainer: {
    paddingHorizontal: 12,
  },
});
