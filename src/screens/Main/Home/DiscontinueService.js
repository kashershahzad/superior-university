import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

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

const SERVICE_DETAILS = [
    { item: 'Current Service', itemValue: 'Bus #03' },
    { item: 'Request Date', itemValue: '22 May 2025' },
    { item: 'Effective Date', itemValue: '23 June 2025' },
];

const DiscontinueService = ({
    isVisible,
    onClose,
    onConfirm,
    onKeepService,
    topImg,
}) => {

    const [reason, setReason] = useState('');

    return (
        <CustomModal
            isChange
            isVisible={isVisible}
            onDisable={onClose}
            backdropOpacity={0.5}
            mainMargin={0}
        >
            <View style={styles.sheet}>
                <View style={styles.topImgWrap}>
                    <ImageFast
                        source={topImg}
                        style={styles.topImg}
                        resizeMode="contain"
                    />
                </View>
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
                        fontSize={13}
                        fontFamily={fonts.medium}
                        color="#475467"
                        marginTop={10}
                        marginBottom={8}
                    />
                    <CustomInput
                        placeholder="Shifting to personal commute..."
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        height={90}
                        textAlignVertical="top"
                        marginBottom={0}
                        borderColor="#98A2B3"
                        placeholderTextColor="#98A2B3"
                    />
                    <CustomText
                        label="Discontinuation takes effect 1 month after you request. You will continue to have bus access until then."
                        fontSize={12}
                        color="#475467"
                        marginTop={10}
                    // lineHeight={18}
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
                        marginTop={20}
                    />
                    <GradientButton
                        title="Keep my Service"
                        onPress={onKeepService || onClose}
                        marginTop={12}
                    />
                </View>
            </View>
        </CustomModal>
    )
};
export default DiscontinueService;
const styles = StyleSheet.create({
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 12,
        paddingTop: 80,
        paddingBottom: 24,
    },
    topImgWrap: {
        position: 'absolute',
        top: -50,
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
        paddingHorizontal: 29,
    },
});