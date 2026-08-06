import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Buffer } from 'buffer';
import ReactNativeBlobUtil from 'react-native-blob-util';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';
import StudentCard from './StudentCard';
import { useRoute } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { endPoints } from '../../../services/ENV';
import { get } from '../../../services/ApiRequest';
import { ToastMessage } from '../../../utils/ToastMessage';

const GenerateCard = () => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await get('student/card');
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
    if (!card) {
      ToastMessage('Card not found', 'error');
      return;
    }
    setDownloading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const rawName = card?.card_no || 'student-card';
      const fileName = String(rawName).toLowerCase().endsWith('.pdf')
        ? String(rawName)
        : `${rawName}.pdf`;
      const filePath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      const response = await axios.get(
        `${endPoints.BASE_URL}/student/card/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/pdf', // Postman mein jo type ho woh
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
        throw new Error('Card file empty');
      }
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
      }
      ToastMessage('Card saved to Downloads', 'success');
      // Open pehle, unlink baad mein (warna open fail)
      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.android.actionViewIntent(
          filePath,
          'application/pdf',
        );
      } else {
        ReactNativeBlobUtil.ios.openDocument(filePath);
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
              <CustomText label="Generate Card" fontSize={16} fontFamily={fonts.bold} color="#101828" />
            </View>
          </View>
        );
      }}
    >
      {loading ? (
  <ActivityIndicator size="large" color={COLORS.primaryColor} />
) : (
      <View style={styles.container}>
        <View style={styles.cardInfoContainer}>
            <ImageFast source={Images.check} style={{ width: 16, height: 16 }} resizeMode="contain" />
            <CustomText label={card?.message} fontSize={13} fontFamily={fonts.medium} color="#19B36E" />
        </View>
        <StudentCard card={card} />
        <CustomText label={`Show this card while boarding the university transport.`} fontSize={13} fontFamily={fonts.medium} color="#475467" textAlign="center" />
        <View style={styles.buttonContainer}>
        <GradientButton title="Download Card"
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
  cardInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  buttonContainer: {
    paddingHorizontal: 12,
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
