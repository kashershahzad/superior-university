import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Keyboard,
  Platform,
  useWindowDimensions,
  Image,
  Dimensions,
} from 'react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import CustomModal from '../../../components/CustomModal';
import CustomText from '../../../components/CustomText';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import InfoCard from './InfoCard';
import GradientButton from './GradientButton';

import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import { COLORS } from '../../../utils/COLORS';
import { endPoints } from '../../../services/ENV';
import { ToastMessage } from '../../../utils/ToastMessage';

const TOP_IMAGE_OVERFLOW = 50;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

const SERVICE_DETAILS = [
  { item: 'Current Service', itemValue: 'Bus #03' },
  { item: 'Request Date', itemValue: '22 May 2025' },
  { item: 'Effective Date', itemValue: '23 June 2025', itemValueColor: '#701A72' },
];

const DiscontinueContent = ({ onConfirm, onKeepService, onClose, keyboardPadding = 0 }) => {
  const [reason, setReason] = useState('');
  const scrollRef = useRef(null);

  const scrollToReason = () => {
    // Keyboard open → input dikhne ke liye sheet andar scroll
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    });
    setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 100);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      bounces={false}
      nestedScrollEnabled
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: 16 + keyboardPadding },
      ]}
    >
      <View style={styles.topWrap}>
        <InfoCard
          title="Service Details"
          items={SERVICE_DETAILS}
          backgroundColor="#FAFAFF"
          bodyBackgroundColor="#FFFFFF"
        />
      </View>
      <View style={styles.bottomWrap}>
        <CustomText
          label="Describe Your Problem (Optional)"
          fontSize={12}
          fontFamily={fonts.regular}
          color="#475467"
          marginTop={5}
          marginBottom={8}
        />
        <CustomInput
          placeholder="Shifting to personal commute..."
          value={reason}
          onChangeText={setReason}
          multiline
          height={119}
          textAlignVertical="top"
          borderColor="#98A2B3"
          placeholderTextColor="#98A2B3"
          marginBottom={10}
          fontSize={14}
          fontFamily={fonts.regular}
          isFocus={scrollToReason}
        />
        <CustomText
          label="Discontinuation takes effect 1 month after you request. You will continue to have bus access until then."
          fontSize={13}
          fontFamily={fonts.medium}
          color="#475467"
        />
        <CustomButton
          title="Confirm discontinuation"
          onPress={() => onConfirm?.(reason)}
          backgroundColor="transparent"
          color={COLORS.primaryColor}
          borderWidth={1}
          borderColor={COLORS.primaryColor}
          borderRadius={24}
          height={48}
          marginTop={24}
        />
        <GradientButton
          title="Keep my Service"
          onPress={onKeepService || onClose}
          marginTop={24}
        />
      </View>
    </ScrollView>
  );
};

const UploadContent = ({ onUpload, onClose }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleBrowse = async () => {
    if (uploading) return;
    try {
      const [result] = await pick({
        type: [types.images, types.pdf], // gallery images + PDF
        allowMultiSelection: false,
      });
      if (result) {
        setFile({
          name: result.name || 'voucher',
          uri: result.uri,
          type: result.type || 'application/pdf',
          size: result.size,
        });
        setProgress(0);
      }
    } catch (error) {
      if (!isErrorWithCode(error) || error.code !== errorCodes.OPERATION_CANCELED) {
        console.log('Picker error:', error);
      }
    }
  };

  const handleRemoveFile = () => {
    if (uploading) {
      return;
    }
    setFile(null);
    setProgress(0);
  };

  const handleUploadPress = async () => {
    if (!file) {
      ToastMessage('Please select a file first', 'error');
      return;
    }
    if (uploading) {
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'voucher.jpg',
      });

      const res = await axios.post(
        `${endPoints.BASE_URL}/student/vouchers/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: event => {
            if (!event.total) {
              return;
            }
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent > 100 ? 100 : percent);
          },
        },
      );

      if (res?.data?.success) {
        setProgress(100);
        ToastMessage(
          res.data?.data?.message || res.data?.message || 'Upload successful.',
          'success',
        );
        onUpload?.(res.data?.data || res.data);
        setFile(null);
        setProgress(0);
        onClose?.();
      } else {
        ToastMessage(res?.data?.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.log('Voucher upload error:', error?.response?.data || error);
      ToastMessage(
        error?.response?.data?.message || 'Upload failed. Please try again.',
        'error',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.uploadWrap}>
      <TouchableOpacity
        style={styles.dropZone}
        onPress={handleBrowse}
        activeOpacity={0.8}
        disabled={uploading}>
        <Image source={Images.uploadIcon} style={styles.uploadIcon} resizeMode="contain" />
        <CustomText
          label="Drag & drop files or "
          fontSize={14}
          fontFamily={fonts.medium}
          color="#101828"
          marginTop={8}
        >
          <Text style={{ color: COLORS.primaryColor, textDecorationLine: 'underline' }}>
            Browse
          </Text>
        </CustomText>
        <CustomText
          label="Supported formats: JPEG, PNG, PDF"
          fontSize={10}
          color="#676767"
          marginTop={8}
        />
      </TouchableOpacity>

      {file ? (
        <View style={styles.uploadingSection}>
          <CustomText
            label={uploading ? 'Uploading' : 'Selected File'}
            fontSize={14}
            fontFamily={fonts.bold}
            color="#676767"
            marginBottom={8}
          />
          <View style={styles.fileRow}>
            <CustomText
              label={file.name}
              fontSize={12}
              fontFamily={fonts.regular}
              color="#0F0F0F"
              numberOfLines={1}
              style={{ flex: 1 }}
            />
            <TouchableOpacity onPress={handleRemoveFile} hitSlop={10} disabled={uploading}>
              <Image source={Images.closeIcon} style={styles.closeIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          {(uploading || progress > 0) ? (
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.buttonWrap, { marginTop: file ? 12 : 24 }]}>
        <GradientButton
          title="Upload"
          onPress={handleUploadPress}
          loading={uploading}
          disabled={!file || uploading}
        />
        <CustomButton
          title="Cancel"
          onPress={onClose}
          backgroundColor="transparent"
          color={COLORS.primaryColor}
          borderWidth={1}
          borderColor={COLORS.primaryColor}
          borderRadius={24}
          height={48}
          marginTop={8}
          disabled={uploading}
        />
      </View>
    </View>
  );
};

const ModalBox = ({
  type,
  isVisible,
  onClose,
  topImg,
  onConfirm,
  onKeepService,
  onUpload,
}) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setKeyboardHeight(0);
      return undefined;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, e => {
      const height = Math.max(0, Math.round(e?.endCoordinates?.height ?? 0));
      setKeyboardHeight(height);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [isVisible]);

  const isKeyboardOpen = keyboardHeight > 0;
  // Android adjustResize pe window pehle se shrink hota hai — dobara lift mat karo
  const windowAlreadyShrunk =
    Platform.OS === 'android' &&
    isKeyboardOpen &&
    windowHeight < SCREEN_HEIGHT * 0.9;

  const liftBottom = windowAlreadyShrunk ? 0 : keyboardHeight;

  // Sheet kabhi screen se upar na jaye — maxHeight clamp + andar scroll
  const usableHeight =
    SCREEN_HEIGHT - liftBottom - insets.top - TOP_IMAGE_OVERFLOW - 8;
  const sheetMaxHeight = Math.max(
    260,
    Math.min(windowHeight * 0.9, usableHeight),
  );

  return (
    <CustomModal
      isChange
      isVisible={isVisible}
      onDisable={onClose}
      backdropOpacity={0}
      mainMargin={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      withBlur
      avoidKeyboard={false}
    >
      <View
        style={[
          styles.sheet,
          {
            maxHeight: sheetMaxHeight,
            height: isKeyboardOpen ? sheetMaxHeight : undefined,
            marginBottom: liftBottom,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.topImgWrap}>
          <Image source={topImg} style={styles.topImg} resizeMode="contain" />
        </View>
        {type === 'upload' && (
          <CustomText
            label="Upload"
            fontSize={18}
            fontFamily={fonts.bold}
            color="#101828"
            textAlign="center"
          />
        )}
        {type === 'upload' ? (
          <UploadContent
            key={isVisible ? 'open' : 'closed'}
            onUpload={onUpload}
            onClose={onClose}
          />
        ) : (
          <DiscontinueContent
            onConfirm={onConfirm}
            onKeepService={onKeepService}
            onClose={onClose}
            keyboardPadding={isKeyboardOpen ? 24 : 0}
          />
        )}
      </View>
    </CustomModal>
  );
};
export default ModalBox;


const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 80,
    width: '100%',
    overflow: 'visible',
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
    maxHeight: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  topImgWrap: {
    position: 'absolute',
    top: -TOP_IMAGE_OVERFLOW,
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  topImg: {
    width: 100,
    height: 100,
  },
  bottomWrap: {
    paddingHorizontal: 20,
  },
  dropZone: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#701A73',
    borderRadius: 20,
    backgroundColor: '#FAFAFF',
  },
  uploadingSection: {
    marginTop: 12,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    marginBottom: 20,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 9,
    backgroundColor: '#FFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E3E3E3',
  },
  progressBg: {
    width: '100%',
    height: 3,
    borderRadius: 4,
    // marginTop: 8,
    backgroundColor: '#E3E3E3',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#701A73',
    borderRadius: 4,
  },
  closeIcon: {
    width: 16,
    height: 16,
  },
  buttonWrap: {
    paddingHorizontal: 20,
  },
  uploadWrap: {
    width: '100%',
  },
});