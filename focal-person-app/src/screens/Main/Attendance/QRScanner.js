import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  NativeModules,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Camera, CameraType} from 'react-native-camera-kit';

import CustomText from '../../../components/CustomText';
import Icons from '../../../components/Icons';
import fonts from '../../../assets/fonts';
import {COLORS} from '../../../utils/COLORS';
import {post} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';

const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Camera access is needed to scan student QR codes.',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const module = NativeModules.RNCameraKitModule;
  if (!module?.requestDeviceCameraAuthorization) {
    return true;
  }
  return !!(await module.requestDeviceCameraAuthorization());
};

const parseQrPayload = rawValue => {
  if (!rawValue || typeof rawValue !== 'string') {
    return null;
  }

  const trimmed = rawValue.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (err) {
    if (trimmed) {
      return {student_id: trimmed};
    }
  }
  return null;
};

const isCardExpired = validUntil => {
  if (!validUntil) {
    return false;
  }
  const expiry = new Date(`${validUntil}T23:59:59`);
  if (Number.isNaN(expiry.getTime())) {
    return false;
  }
  return expiry < new Date();
};

const QRScanner = ({visible, students = [], onClose, onMarked}) => {
  const insets = useSafeAreaInsets();
  const scannedLock = useRef(false);
  const studentsRef = useRef(students);
  const localMarksRef = useRef({});
  const onMarkedRef = useRef(onMarked);
  const [hasPermission, setHasPermission] = useState(null);

  studentsRef.current = students;
  onMarkedRef.current = onMarked;

  useEffect(() => {
    if (!visible) {
      scannedLock.current = false;
      setHasPermission(null);
      localMarksRef.current = {};
      return;
    }

    let isMounted = true;
    const askPermission = async () => {
      try {
        const granted = await requestCameraPermission();
        if (isMounted) {
          setHasPermission(granted);
        }
      } catch (err) {
        console.log('Camera permission error:', err);
        if (isMounted) {
          setHasPermission(false);
        }
      }
    };

    askPermission();
    return () => {
      isMounted = false;
    };
  }, [visible]);

  const unlockScan = () => {
    setTimeout(() => {
      scannedLock.current = false;
    }, 1500);
  };

  const handleReadCode = useCallback(async event => {
    const rawValue = event?.nativeEvent?.codeStringValue;
    if (!rawValue || scannedLock.current) {
      return;
    }

    scannedLock.current = true;
    Vibration.vibrate(40);

    const payload = parseQrPayload(rawValue);
    const scannedStudentId = String(payload?.student_id || '').trim();

    if (!scannedStudentId) {
      ToastMessage('Invalid student QR code', 'error');
      unlockScan();
      return;
    }

    if (isCardExpired(payload?.valid_until)) {
      ToastMessage('This student card has expired', 'error');
      unlockScan();
      return;
    }

    const student = studentsRef.current.find(
      item =>
        String(item.student_id || '')
          .trim()
          .toLowerCase() === scannedStudentId.toLowerCase(),
    );

    if (!student) {
      ToastMessage('Student not found in this attendance list', 'error');
      unlockScan();
      return;
    }

    const currentStatus = localMarksRef.current[student.id] || student.status;
    if (currentStatus === 'present') {
      ToastMessage(
        `${student.name || payload?.name || 'Student'} is already present`,
      );
      unlockScan();
      return;
    }

    try {
      const res = await post('uni-staff/attendance/mark', {
        student_id: student.id,
        status: 'present',
      });

      if (res?.error) {
        unlockScan();
        return;
      }

      if (res?.data?.success) {
        localMarksRef.current = {
          ...localMarksRef.current,
          [student.id]: 'present',
        };
        ToastMessage(
          `Attendance marked for ${student.name || payload?.name || scannedStudentId}`,
          'success',
        );
        onMarkedRef.current?.(res.data.data);
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to mark attendance',
          'error',
        );
      }
    } catch (err) {
      console.log('QR mark attendance error:', err);
      ToastMessage('Failed to mark attendance', 'error');
    } finally {
      unlockScan();
    }
  }, []);

  const openSettings = () => {
    Alert.alert(
      'Camera Permission',
      'Please allow camera access in Settings to scan QR codes.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => Linking.openSettings()},
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.container}>
        {hasPermission === true ? (
          <Camera
            style={StyleSheet.absoluteFill}
            cameraType={CameraType.Back}
            scanBarcode
            showFrame
            laserColor={COLORS.primaryColor}
            frameColor="#FFFFFF"
            barcodeFrameSize={{width: 260, height: 260}}
            scanThrottleDelay={1800}
            allowedBarcodeTypes={['qr']}
            onReadCode={handleReadCode}
          />
        ) : (
          <View style={styles.fallback}>
            {hasPermission === null ? (
              <ActivityIndicator size="large" color={COLORS.white} />
            ) : (
              <>
                <Icons
                  family="Ionicons"
                  name="camera-outline"
                  size={42}
                  color={COLORS.white}
                />
                <CustomText
                  label="Camera permission is required to scan QR codes"
                  color={COLORS.white}
                  fontSize={14}
                  fontFamily={fonts.medium}
                  textAlign="center"
                  marginTop={12}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.settingsBtn}
                  onPress={openSettings}>
                  <CustomText
                    label="Open Settings"
                    color={COLORS.white}
                    fontSize={13}
                    fontFamily={fonts.medium}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.closeBtn}
            onPress={onClose}>
            <Icons
              family="Ionicons"
              name="close"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <View style={styles.topText}>
            <CustomText
              label="Scan Student QR"
              color={COLORS.white}
              fontSize={16}
              fontFamily={fonts.bold}
            />
            <CustomText
              label="Align the QR code inside the frame"
              color="#E4E7EC"
              fontSize={12}
              fontFamily={fonts.regular}
            />
          </View>
          <View style={styles.closeBtn} />
        </View>
      </View>
    </Modal>
  );
};

export default QRScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  settingsBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: {
    flex: 1,
    alignItems: 'center',
  },
});
