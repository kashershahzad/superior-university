import React, { useState, useEffect } from 'react';
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

const SERVICE_DETAILS = [
  { item: 'Current Service', itemValue: 'Bus #03' },
  { item: 'Request Date', itemValue: '22 May 2025' },
  { item: 'Effective Date', itemValue: '23 June 2025', itemValueColor: '#701A72' },
];

const DiscontinueContent = ({ onConfirm, onKeepService, onClose }) => {
  const [reason, setReason] = useState('');

  return (
    <ScrollView
      style={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      contentContainerStyle={styles.scrollContent}
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
  // Absolute Y of keyboard top; overlap is derived from live windowHeight so adjustResize can't double-lift.
  const [keyboardTopY, setKeyboardTopY] = useState(null);
  const [keyboardFallbackHeight, setKeyboardFallbackHeight] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setKeyboardTopY(null);
      setKeyboardFallbackHeight(0);
      return undefined;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (e) => {
      const coords = e?.endCoordinates;
      if (typeof coords?.screenY === 'number') {
        setKeyboardTopY(coords.screenY);
        setKeyboardFallbackHeight(0);
      } else {
        setKeyboardTopY(null);
        setKeyboardFallbackHeight(Math.max(0, Math.round(coords?.height ?? 0)));
      }
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardTopY(null);
      setKeyboardFallbackHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [isVisible]);

  const keyboardOverlap =
    keyboardTopY != null
      ? Math.max(0, Math.round(windowHeight - keyboardTopY))
      : keyboardFallbackHeight;

  // Fit sheet into visible area above the keyboard (overlap is 0 when adjustResize already shrunk the window).
  const availableHeight =
    windowHeight - keyboardOverlap - insets.top - TOP_IMAGE_OVERFLOW - 8;
  const sheetMaxHeight = Math.min(windowHeight * 0.9, Math.max(availableHeight, 280));
  const isKeyboardOpen = keyboardTopY != null || keyboardFallbackHeight > 0;

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
    >
      <View
        style={[
          styles.sheet,
          {
            maxHeight: sheetMaxHeight,
            // Bound height while keyboard is open so inner ScrollView can scroll.
            ...(isKeyboardOpen ? { height: sheetMaxHeight } : null),
            marginBottom: keyboardOverlap,
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
  },
  scrollContent: {
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