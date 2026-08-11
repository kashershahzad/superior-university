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
import SelectRoute from '../../Auth/Signup/SelectRoute';

const PersonalData = () => {

    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [studentId, setStudentId] = useState('23-CS-1027');
    const [fullName, setFullName] = useState('Nimra Sultan');
    const [program, setProgram] = useState('Computer Science');
    const [semester, setSemester] = useState('4');
    const [route, setRoute] = useState('3-Faisalabad');
    const [busNumber, setBusNumber] = useState('003');
    const [routeModalVisible, setRouteModalVisible] = useState(false);

    const handleSelectRoute = (selected) => {
        setRoute(selected.name);
        setBusNumber(selected.busNumber);
        setRouteModalVisible(false);
    };

    return (
        <ScreenWrapper
            backgroundColor="#F1F3F8"
            paddingHorizontal={0}
            statusBarColor="transparent"
            translucent
            scrollEnabled
            footerUnScrollable={() => {
                return (
                    <View style={styles.footerContainer}>
                        <GradientButton title="Update" onPress={() => { }} />
                    </View>
                );
            }}
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
                            <CustomText label="Personal Data" fontSize={16} fontFamily={fonts.bold} color="#101828" />
                        </View>
                    </View>
                );
            }}
        >
            <View style={styles.container}>
                <CustomInput
                    placeholder="Enter Your ID"
                    value={studentId}
                    onChangeText={text => setStudentId(text)}
                    autoCapitalize="none"
                    withLabel="Student ID"
                    borderColor="#98A2B3"
                    icon={Images.studentId}
                />

                <CustomInput
                    placeholder="Enter Your Full Name"
                    value={fullName}
                    onChangeText={text => setFullName(text)}
                    withLabel="Full Name"
                    borderColor="#98A2B3"
                    iconName="user"
                />

                <CustomInput
                    placeholder="Enter Program"
                    value={program}
                    onChangeText={text => setProgram(text)}
                    withLabel="Program"
                    borderColor="#98A2B3"
                    icon={Images.program}
                />

                <CustomInput
                    placeholder="Enter Semester"
                    value={semester}
                    onChangeText={text => setSemester(text)}
                    withLabel="Semester"
                    borderColor="#98A2B3"
                    icon={Images.semester}
                    keyboardType="numeric"
                />

                <CustomInput
                    placeholder="Select your Route"
                    value={route}
                    withLabel="Select Route"
                    borderColor="#98A2B3"
                    icon={Images.route}
                    rightIconName="chevron-right"
                    onPress={() => setRouteModalVisible(true)}
                />

                <CustomInput
                    placeholder="Bus No"
                    value={busNumber}
                    withLabel="Bus Number (auto)"
                    borderColor="#98A2B3"
                    icon={Images.busIcon}
                    editable={false}
                />
                <SelectRoute
                    visible={routeModalVisible}
                    onClose={() => setRouteModalVisible(false)}
                    selectedRoute={route}
                    onSelectRoute={handleSelectRoute}
                />
            </View>
        </ScreenWrapper>
    );
};

export default PersonalData;

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
        gap: 6,
    },
    personalDataContainer: {
        gap: 8,
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
