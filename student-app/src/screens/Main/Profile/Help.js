import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import GradientButton from '../Home/GradientButton';
import CustomInput from '../../../components/CustomInput';

const Help = () => {

    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

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
                                <Image
                                    source={Images.backArrow}
                                    style={{ width: 18, height: 18 }}
                                />
                            </TouchableOpacity>
                            <CustomText label="FAQ & Help" fontSize={16} fontFamily={fonts.bold} color="#101828" />
                        </View>
                    </View>
                );
            }}
        >
            <View style={styles.container}>
                <View style={styles.helpContainer}>
                    <CustomText label="How to generate a new card?" fontSize={16} fontFamily={fonts.bold} color="#101828" />
                    <CustomText label="To generate a new card, go to the profile section and click on the 'Generate Card' option. You will be redirected to a new page where you can generate a new card." fontSize={13} fontFamily={fonts.medium} color="#475467" />
                </View>
                <View style={styles.helpContainer}>
                    <CustomText label="How to change my password?" fontSize={16} fontFamily={fonts.bold} color="#101828" />
                    <CustomText label="To change your password, go to the profile section and click on the 'Change Password' option. You will be redirected to a new page where you can enter your current password and new password. Once you have entered the new password, click on the 'Change Password' button to save the changes." fontSize={13} fontFamily={fonts.medium} color="#475467" />
                </View>
                <View style={styles.helpContainer}>
                    <CustomText label="How to view my fee status?" fontSize={16} fontFamily={fonts.bold} color="#101828" />
                    <CustomText label="To view your fee status, go to the profile section and click on the 'Fee Status' option. You will be redirected to a new page where you can see your fee status." fontSize={13} fontFamily={fonts.medium} color="#475467" />
                </View>
                <View style={styles.helpContainer}>
                    <CustomText label="How to view my notifications?" fontSize={16} fontFamily={fonts.bold} color="#101828" />
                    <CustomText label="To view your notifications, go to the profile section and click on the 'Notifications' option. You will be redirected to a new page where you can see your notifications." fontSize={13} fontFamily={fonts.medium} color="#475467" />
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default Help;

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
    helpContainer: {
        gap: 8,
    },
});
