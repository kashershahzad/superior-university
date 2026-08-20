import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

import { Images } from '../../../assets/images';
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
import { get } from '../../../services/ApiRequest';
import { getCurrentCoords } from '../../../utils/GetLocation';

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
    const [loading, setLoading] = useState(true);
    const [fee, setFee] = useState(null);
    const [distanceKm, setDistanceKm] = useState(null);
    const [displayName, setDisplayName] = useState(null);

    const {
        status = 'unpaid',
        isMapLocked = true,
        unlockText = 'Pay fee to unlock track',
    } = route.params || {};

    const fetchFee = async () => {
        try {
            const res = await get('student/fee');
            if (res?.data?.success) {
                // Full payload: { fee_status, details: { route, bus, ... } }
                setFee(res.data.data || null);
            }
        } catch (e) {
            console.log('Fee fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchTracking = async () => {
        try {
            const coords = await getCurrentCoords();
            const res = await get('student/transport/tracking', {
                latitude: coords.latitude,
                longitude: coords.longitude,
            });
            if (res?.data?.success) {
                setDistanceKm(res.data.data?.distance_km ?? null);
                setDisplayName(res.data.data?.display_name ?? null);
            }
        } catch (e) {
            console.log('Tracking error:', e);
        }
    };

    useEffect(() => {
        fetchFee();
        fetchTracking();
    }, []);

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
                                    <Image
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
                        <Image
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
                                <View style={styles.mapWrap}>
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
                                </View>
                            ) : null}
                            {unlockText ? (
                                <View style={styles.busLocationInfo}>
                                    <View style={styles.dot} />
                                    <CustomText
                                        label={
                                            (fee?.fee_status || status) === 'pending' ||
                                            (fee?.fee_status || status) === 'unpaid'
                                                ? 'Pay fee to unlock track'
                                                : `Bus ${displayName || ''} ${distanceKm == null ? '0' : distanceKm}KM away`
                                        }
                                        color="#701A73"
                                        fontSize={12}
                                        fontFamily={fonts.medium}
                                        removeTranslation
                                    />
                                </View>
                            ) : null}
                        </View>
                        <InfoCard
                            title="Fee Details"
                            titleStatus={fee?.details?.status}
                            titleStatusType={
                                fee?.details?.status === 'active' || fee?.fee_status === 'paid'
                                    ? 'done'
                                    : 'pending'
                            }
                            items={[
                                { item: 'Route', itemValue: fee?.details?.route || '-' },
                                { item: 'Bus', itemValue: fee?.details?.bus || '-' },
                                { item: 'Submitted Date', itemValue: fee?.details?.submitted_date || '-' },
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
    mapWrap: {
        width: '100%',
        height: 178,
        borderWidth: 1,
        borderColor: '#EBECEE',
        borderRadius: 12,
        marginTop: 12,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: 178,
        overflow: 'hidden',
    },
    buttonContainer: {
        marginBottom: 16,
        paddingHorizontal: 20,
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