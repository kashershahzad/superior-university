import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';

import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import CustomText from '../../../components/CustomText';
import CustomCheckbox from '../../../components/CustomCheckBox';
import DualText from '../../../components/DualText';

import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import {Images} from '../../../assets/images';

const OutlineButton = ({icon, title, onPress}) => (
  <TouchableOpacity style={styles.outlineButton} onPress={onPress} activeOpacity={0.7}>
    <Image source={icon} style={styles.outlineIcon} />
    <CustomText
      label={title}
      color={COLORS.primaryColor}
      fontFamily={fonts.semiBold}
      fontSize={14}
    />
  </TouchableOpacity>
);

const Signinmodel = ({visible, onClose, navigation}) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleForgotPassword = () => {
    onClose?.();
    navigation?.navigate('ForgetPass');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            <CustomText
              label="Sign In"
              fontSize={24}
              fontFamily={fonts.bold}
              color="#101828"
              textAlign="center"
              marginBottom={6}
            />
            <CustomText
              label="Sign in to your account"
              fontSize={14}
              fontFamily={fonts.medium}
              color="#475467"
              textAlign="center"
              marginBottom={24}
            />

            <CustomInput
              placeholder="Enter Your Email"
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="none"
              withLabel="Student ID"
              borderColor="#98A2B3"
              icon={Images.studentId}
            />

            <CustomInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              withLabel="Password"
              borderColor="#98A2B3"
              icon={Images.password}
              secureTextEntry
              eyeIconColor={COLORS.primaryColor}
            />

            <View style={styles.rememberRow}>
              <View style={styles.rememberLeft}>
                <CustomCheckbox
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  checkedBgColor="#F4F3FF"
                  tickColor={COLORS.primaryColor}
                />
                <CustomText
                  label="Remember Me"
                  fontSize={13}
                  color="#393B41"
                  fontFamily={fonts.regular}
                />
              </View>
              <CustomText
                label="Forgot Password"
                fontSize={13}
                fontFamily={fonts.semiBold}
                color={COLORS.primaryColor}
                onPress={handleForgotPassword}
              />
            </View>

            <CustomButton
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              borderRadius={30}
              marginTop={8}
              marginBottom={24}
            />

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <CustomText
                label="OR"
                fontSize={13}
                color="#98A2B3"
                marginLeft={12}
                marginRight={12}
                fontFamily={fonts.medium}
                marginHorizontal={12}
              />
              <View style={styles.orLine} />
            </View>

            <OutlineButton
              icon={Images.email2}
              title="Sign in With Email"
              onPress={() => {}}
            />
            <OutlineButton
              icon={Images.phone}
              title="Sign in With Phone"
              onPress={() => {}}
            />

            <DualText
              title="Don't have an account?"
              secondTitle=" Sign Up Here"
              marginTop={20}
              marginBottom={8}
              onPress={onClose}
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default Signinmodel;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D5DD',
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 8,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E7EC',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.primaryColor,
    backgroundColor: COLORS.white,
    marginBottom: 12,
    gap: 10,
  },
  outlineIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
