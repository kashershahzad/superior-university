import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';
import CustomInput from '../../../components/CustomInput';

const ChangePassword = () => {

    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

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
                                    navigation.navigate('Profile');
                                }}>
                                <ImageFast
                                    source={Images.backArrow}
                                    style={{ width: 18, height: 18 }}
                                />
                            </TouchableOpacity>
                            <CustomText label="Chnage Password" fontSize={16} fontFamily={fonts.bold} color="#101828" />
                        </View>
                    </View>
                );
            }}
        >
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <CustomInput
                        placeholder="Current Password"
                        value={currentPassword}
                        onChangeText={text => setCurrentPassword(text)}
                        withLabel="Current Password"
                        borderColor="#98A2B3"
                        icon={Images.password}
                        secureTextEntry
                        eyeIconColor={COLORS.primaryColor}
                    />

                    <CustomInput
                        placeholder="New Password"
                        value={newPassword}
                        onChangeText={text => setNewPassword(text)}
                        withLabel="New Password"
                        borderColor="#98A2B3"
                        icon={Images.password}
                        secureTextEntry
                        eyeIconColor={COLORS.primaryColor}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <GradientButton title="Change Password" onPress={() => { }} />
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default ChangePassword;

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
