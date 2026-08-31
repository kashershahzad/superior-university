import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  // PixelRatio,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Buffer} from 'buffer';
// import {captureRef} from 'react-native-view-shot';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import {COLORS} from '../../../utils/COLORS';

import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';
// import StudentCard from './StudentCard';

import {get} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {endPoints} from '../../../services/ENV';
// import {createPdfFromJpegBase64} from '../../../utils/jpegToPdf';

const getHeaderValue = (headers, key) => {
  if (!headers) return '';
  const found = Object.keys(headers).find(
    h => h.toLowerCase() === key.toLowerCase(),
  );
  const value = found ? headers[found] : '';
  return Array.isArray(value) ? value[0] : value || '';
};

const GenerateCard = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {userData} = useSelector(state => state.users);
  const isTeacher =
    String(userData?.role || '').toLowerCase() === 'teacher';
  const screenTitle = isTeacher ? 'Teacher Card' : 'Generate Card';
  // const cardRef = useRef(null);
  // const cardSizeRef = useRef({width: 0, height: 0});
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

  // OLD: capture StudentCard view → JPEG → PDF
  // const handleDownloadCard = async () => {
  //   if (downloading) return;
  //   if (!card || !cardRef.current) {
  //     ToastMessage('Card not found', 'error');
  //     return;
  //   }
  //
  //   setDownloading(true);
  //   try {
  //     const layoutW = cardSizeRef.current.width || 360;
  //     const layoutH = cardSizeRef.current.height || 280;
  //     const pixelRatio = PixelRatio.get();
  //     const captureW = Math.round(layoutW * pixelRatio);
  //     const captureH = Math.round(layoutH * pixelRatio);
  //
  //     const jpegBase64 = await captureRef(cardRef, {
  //       format: 'jpg',
  //       quality: 1,
  //       result: 'base64',
  //       width: captureW,
  //       height: captureH,
  //     });
  //
  //     const pdfBase64 = createPdfFromJpegBase64(
  //       jpegBase64,
  //       captureW,
  //       captureH,
  //     );
  //
  //     const rawName = card?.card_no || 'student-card';
  //     const fileName = `${String(rawName).replace(/[^\w.-]/g, '_')}.pdf`;
  //     const pdfPath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
  //
  //     await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
  //
  //     if (Platform.OS === 'android') {
  //       try {
  //         await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
  //           {
  //             name: fileName,
  //             parentFolder: '',
  //             mimeType: 'application/pdf',
  //           },
  //           'Download',
  //           pdfPath,
  //         );
  //       } catch (mediaErr) {
  //         console.log('Media store copy skipped:', mediaErr?.message || mediaErr);
  //       }
  //     }
  //
  //     ToastMessage('Card saved as PDF', 'success');
  //
  //     if (Platform.OS === 'android') {
  //       await ReactNativeBlobUtil.android.actionViewIntent(
  //         pdfPath,
  //         'application/pdf',
  //       );
  //     } else {
  //       ReactNativeBlobUtil.ios.openDocument(pdfPath);
  //     }
  //   } catch (error) {
  //     console.log('Download card error:', error?.message || error);
  //     ToastMessage(error?.message || 'Failed to download card', 'error');
  //   } finally {
  //     setDownloading(false);
  //   }
  // };

  const handleDownloadCard = async () => {
    if (downloading) return;
    if (!card) {
      ToastMessage('Card not found', 'error');
      return;
    }

    setDownloading(true);
    let filePath = null;

    try {
      const token = await AsyncStorage.getItem('token');
      const rawName = card?.card_no || 'student-card';
      const safeName = String(rawName).replace(/[^\w.-]/g, '_');

      const response = await axios.get(
        `${endPoints.BASE_URL}/student/card/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/pdf,image/png,image/jpeg,*/*',
          },
          responseType: 'arraybuffer',
          timeout: 60000,
        },
      );

      if (response.status !== 200) {
        throw new Error(`Server error ${response.status}`);
      }

      const contentType = String(
        getHeaderValue(response.headers, 'content-type'),
      ).toLowerCase();

      const isPng = contentType.includes('png');
      const isJpeg =
        contentType.includes('jpeg') || contentType.includes('jpg');
      const isImage = isPng || isJpeg || contentType.startsWith('image/');
      const ext = isPng ? 'png' : isJpeg ? 'jpg' : 'pdf';
      const mimeType = isPng
        ? 'image/png'
        : isJpeg
          ? 'image/jpeg'
          : 'application/pdf';

      const fileName = `${safeName}.${ext}`;
      filePath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;

      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      await ReactNativeBlobUtil.fs.writeFile(filePath, base64, 'base64');

      const stat = await ReactNativeBlobUtil.fs.stat(filePath);
      if (!stat?.size || Number(stat.size) < 100) {
        throw new Error('Downloaded file empty');
      }

      if (Platform.OS === 'android') {
        try {
          const mediaUri =
            await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
              {
                name: fileName,
                parentFolder: '',
                mimeType,
              },
              'Download',
              filePath,
            );
          ToastMessage(
            isImage
              ? 'Card image saved to Downloads'
              : 'Card saved to Downloads',
            'success',
          );
          try {
            await ReactNativeBlobUtil.android.actionViewIntent(
              mediaUri || filePath,
              mimeType,
            );
          } catch (openErr) {
            console.log('Open file error:', openErr?.message || openErr);
            ToastMessage(
              isImage
                ? 'Saved. Open from Downloads folder.'
                : 'PDF saved. Open from Downloads folder.',
              'error',
            );
          }
          await ReactNativeBlobUtil.fs.unlink(filePath).catch(() => {});
        } catch (mediaErr) {
          console.log('Media store copy skipped:', mediaErr?.message || mediaErr);
          ToastMessage(
            isImage ? 'Card image downloaded' : 'Card PDF downloaded',
            'success',
          );
          await ReactNativeBlobUtil.android.actionViewIntent(filePath, mimeType);
        }
      } else {
        ToastMessage(
          isImage ? 'Card image downloaded' : 'Card PDF downloaded',
          'success',
        );
        ReactNativeBlobUtil.ios.openDocument(filePath);
      }
    } catch (error) {
      console.log('Download card error:', error?.message || error);
      const msg = error?.response?.status
        ? `Download failed (${error.response.status})`
        : error?.message || 'Failed to download card';
      ToastMessage(msg, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const imageUrl = card?.image_url;

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
                label={screenTitle}
                removeTranslation
                fontSize={16}
                fontFamily={fonts.bold}
                color="#101828"
              />
            </View>
          </View>
        );
      }}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primaryColor} />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.cardInfoContainer}>
            <Image
              source={Images.check}
              style={{width: 16, height: 16}}
              resizeMode="contain"
            />
            <CustomText
              label="Your Bus card is ready!"
              removeTranslation
              fontSize={13}
              fontFamily={fonts.medium}
              color="#19B36E"
            />
          </View>

          {/* OLD local StudentCard render
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
          */}

          <View style={styles.cardRoundedClip}>
            {imageUrl ? (
              <Image
                source={{uri: imageUrl}}
                style={styles.cardImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noImage}>
                <CustomText
                  label="Card image not available"
                  fontSize={13}
                  fontFamily={fonts.medium}
                  color="#667085"
                  textAlign="center"
                  removeTranslation
                />
              </View>
            )}
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
  loader: {
    paddingTop: 40,
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
    backgroundColor: 'transparent',
  },
  cardImage: {
    width: '100%',
    height: 485,
    backgroundColor: 'transparent',
  },
  noImage: {
    paddingVertical: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // cardCaptureWrap: {
  //   backgroundColor: '#FFFFFF',
  // },
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
