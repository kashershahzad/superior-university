import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

import { Images } from '../../../assets/images';
import ImageFast from '../../../components/ImageFast';
import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import InfoCard from '../Home/InfoCard';
import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomButton from '../../../components/CustomButton';
import { COLORS } from '../../../utils/COLORS';
import GradientButton from '../Home/GradientButton';
import ModalBox from '../Home/ModalBox';

const DEFAULT_BUS_LOCATION = {
    latitude: 31.4704,
    longitude: 74.2974,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

const Fees = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const route = useRoute();

    const {
        status = 'unpaid',
        isMapLocked = true,
        unlockText = 'Pay fee to unlock track',
      } = route.params || {};

    return (
        <>
            <ScreenWrapper
                backgroundColor="#F1F3F8"
                paddingHorizontal={0}
                statusBarColor="transparent"
                translucent
                // scrollEnabled
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
                                        navigation.goBack();
                                    }}>
                                    <ImageFast
                                        source={Images.backArrow}
                                        style={{ width: 18, height: 18 }}
                                    />
                                </TouchableOpacity>
                                <CustomText label="Fee" fontSize={16} fontFamily={fonts.bold} color="#101828" />
                            </View>
                        </View>
                    );
                }}>
                <View style={styles.container}>
                    <View>
                    <ImageFast
                        source={Images.serviceFee}
                        style={{ height: 130, width: '100%' }}
                        resizeMode="contain"
                    />
                    <View style={styles.busLiveLocation}>
                        <CustomText
                            label="Bus Live Location"
                            color="#101828"
                            fontSize={12}
                            fontFamily={fonts.medium}
                        />
                        {isMapLocked ? (
                        <MapView
                            style={styles.map}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            rotateEnabled={false}
                            pitchEnabled={false}
                            initialRegion={DEFAULT_BUS_LOCATION}>
                            <Marker
                                coordinate={{
                                    latitude: DEFAULT_BUS_LOCATION.latitude,
                                    longitude: DEFAULT_BUS_LOCATION.longitude,
                                }}
                            />
                        </MapView>
                        ): null}
                        {isMapLocked && unlockText ?(
                        <View style={styles.busLocationInfo}>
                            <View style={styles.dot}/>
                            <CustomText
                                label={unlockText}
                                color="#701A73"
                                fontSize={12}
                                fontFamily={fonts.medium}
                            />
                        </View>
                        ): null}
                    </View>
                    <InfoCard
                        title="Fee Details"
                        titleStatus="Pending"
                        titleStatusType="pending"
                        items={[
                            { item: 'Route', itemValue: '3-Faisalabad' },
                            { item: 'Bus', itemValue: '#3 Jail Road' },
                            { item: 'Submitted Date', itemValue: '21 May 2025' },
                        ]}
                    />
                    </View>
                    <View style={styles.buttonContainer}>
                    <GradientButton
                        title="Upload Fee Voucher"
                        onPress={() => setIsModalVisible(true)}
                    />
                    </View>
                </View>
            </ScreenWrapper>
            <ModalBox
                type="upload"
                isVisible={isModalVisible}
                topImg={Images.uploadImg}
                onClose={() => setIsModalVisible(false)}
                onConfirm={() => { setIsModalVisible(false) }}
                onKeepService={() => { setIsModalVisible(false) }}
                onUpload={() => { setIsModalVisible(false) }}
            />
        </>
    )
}

export default Fees;

const styles = StyleSheet.create({
    headerWrapper: {
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        gap: 114,
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
        paddingBottom: 16,
        paddingHorizontal: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    busLiveLocation: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        marginBottom: 8,
    },
    map: {
        width: '100%',
        height: 180,
        borderRadius: 8,
        marginTop: 12,
        overflow: 'hidden',
    },
    buttonContainer: {
        marginBottom: 16,
    },
    busLocationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 12,
        backgroundColor: '#701A73',
    },
});