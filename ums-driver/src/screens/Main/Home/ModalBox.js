import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import { openPicker } from 'react-native-image-crop-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomModal from '../../../components/CustomModal';
import CustomText from '../../../components/CustomText';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import ImageFast from '../../../components/ImageFast';
import InfoCard from './InfoCard';
import GradientButton from './GradientButton';

import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import { COLORS } from '../../../utils/COLORS';

const TOP_IMAGE_OVERFLOW = 50;
const WINDOW_HEIGHT = Dimensions.get('window').height;

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
  const timerRef = useRef(null);

  const clearProgressTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => () => clearProgressTimer(), []);
  const startProgress = () => {
    clearProgressTimer();
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearProgressTimer();
          return 100;
        }
        // thoda random feel — live upload jaisa
        const next = prev + Math.floor(Math.random() * 8) + 4;
        return next >= 100 ? 100 : next;
      });
    }, 120);
  };
  const handleBrowse = async () => {
    try {
      const result = await openPicker({
        mediaType: 'photo',
        cropping: false,
        compressImageQuality: 0.8,
        includeBase64: false,
      });
      if (result) {
        const fileName =
          result.filename || result.path?.split('/').pop() || 'selected-file.jpg';
        setFile({
          name: fileName,
          uri: result.path,
          type: result.mime,
          size: result.size,
        });
        startProgress(); // 65 mat set karo — animate start
      }
    } catch (error) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('Picker error:', error);
      }
    }
  };
  const handleRemoveFile = () => {
    clearProgressTimer();
    setFile(null);
    setProgress(0);
  };
  const handleUploadPress = () => {
    if (!file || progress < 100) return; // incomplete pe disable
    onUpload?.(file);
    clearProgressTimer();
    setFile(null);
    setProgress(0);
  };

  return (
    <View style={styles.uploadWrap}>
      <TouchableOpacity style={styles.dropZone} onPress={handleBrowse} activeOpacity={0.8}>
        <ImageFast source={Images.uploadIcon} style={styles.uploadIcon} resizeMode="contain" />
        <CustomText
          label="Drag & drop files or "
          fontSize={14}
          fontFamily={fonts.medium}
          color="#101828"
          marginTop={8}
        ><Text style={{ color: COLORS.primaryColor, textDecorationLine: 'underline' }}>Browse</Text>
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
          <CustomText label="Uploading" fontSize={14} fontFamily={fonts.bold} color="#676767" marginBottom={8} />
          <View style={styles.fileRow}>
            <CustomText
              label={file.name}
              fontSize={12}
              fontFamily={fonts.regular}
              color="#0F0F0F"
              numberOfLines={1}
              style={{ flex: 1 }}
            />
            <TouchableOpacity onPress={handleRemoveFile} hitSlop={10}>
              <ImageFast source={Images.closeIcon} style={styles.closeIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      ) : null}

      <View style={[styles.buttonWrap, { marginTop: file ? 12 : 24 }]}>
        <GradientButton
          title="Upload"
          onPress={() => onUpload?.(file)}
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setKeyboardHeight(0);
      return undefined;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [isVisible]);

  // Shrink sheet into the visible area above the keyboard (no translateY).
  const availableHeight =
    WINDOW_HEIGHT - keyboardHeight - insets.top - TOP_IMAGE_OVERFLOW - 8;
  const sheetMaxHeight = Math.min(WINDOW_HEIGHT * 0.9, Math.max(availableHeight, 280));
  const isKeyboardOpen = keyboardHeight > 0;

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
            marginBottom: keyboardHeight,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.topImgWrap}>
          <ImageFast source={topImg} style={styles.topImg} resizeMode="contain" />
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
    position: 'absolute',
    transform: [{ translateY: 62 }],
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
});