import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import CustomInput from '../../../components/CustomInput';
import GradientButton from '../Home/GradientButton';
import CustomButton from '../../../components/CustomButton';
import SelectRoute from '../../Auth/Signup/SelectRoute';
import SelectStop from '../../Auth/Signup/SelectStop';

import {del, get, post} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';
import {COLORS} from '../../../utils/COLORS';
import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';

const ChangeRoute = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [currentRoute, setCurrentRoute] = useState(null);
  const [currentStop, setCurrentStop] = useState(null);
  const [currentBus, setCurrentBus] = useState(null);
  const [canRequest, setCanRequest] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [availableRoutes, setAvailableRoutes] = useState([]);

  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [reason, setReason] = useState('');

  const fetchRouteChange = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get('student/route-change');
      if (res?.data?.success) {
        const data = res.data.data || {};
        setCurrentRoute(data.current_route || null);
        setCurrentStop(data.current_stop || null);
        setCurrentBus(data.current_bus || null);
        setCanRequest(!!data.can_request);
        setPendingRequest(data.request || null);
        setAvailableRoutes(data.available_routes || []);
      } else {
        ToastMessage(
          res?.error?.message || 'Failed to load route change info',
          'error',
        );
      }
    } catch (err) {
      console.log('Route change fetch error:', err);
      ToastMessage('Failed to load route change info', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRouteChange();
    }, [fetchRouteChange]),
  );

  const handleSelectRoute = route => {
    setSelectedRoute({
      id: Number(route.id),
      name: route.name,
    });
    setSelectedStop(null);
    setRouteModalVisible(false);
  };

  const handleSelectStop = stop => {
    setSelectedStop({
      id: Number(stop.id),
      name: stop.name,
    });
    setStopModalVisible(false);
  };

  const openStopModal = () => {
    Keyboard.dismiss();
    if (!selectedRoute?.id) {
      ToastMessage('Please select a route first', 'error');
      return;
    }
    setStopModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedRoute?.id) {
      ToastMessage('Please select a route', 'error');
      return;
    }
    if (!selectedStop?.id) {
      ToastMessage('Please select a stop', 'error');
      return;
    }
    if (!String(reason || '').trim()) {
      ToastMessage('Please enter a reason', 'error');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await post('student/route-change', {
        route_id: selectedRoute.id,
        stop_id: selectedStop.id,
        reason: String(reason).trim(),
      });

      if (res?.data?.success) {
        ToastMessage(
          res.data?.message || 'Route change requested.',
          'success',
        );
        setSelectedRoute(null);
        setSelectedStop(null);
        setReason('');
        await fetchRouteChange();
      } else {
        ToastMessage(
          res?.error?.message || 'Failed to request route change',
          'error',
        );
      }
    } catch (err) {
      console.log('Route change request error:', err);
      ToastMessage('Failed to request route change', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const requestId = pendingRequest?.id || pendingRequest?.route_change_id;
    if (!requestId) {
      ToastMessage('Request not found', 'error');
      return;
    }
    if (cancelling) return;

    setCancelling(true);
    try {
      const res = await del(`student/route-change/${requestId}`);
      if (res?.data?.success) {
        ToastMessage(
          res.data?.message || 'Route change request cancelled.',
          'success',
        );
        await fetchRouteChange();
      } else {
        ToastMessage(
          res?.error?.message || 'Failed to cancel request',
          'error',
        );
      }
    } catch (err) {
      console.log('Cancel route change error:', err);
      ToastMessage('Failed to cancel request', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const pendingRouteName =
    pendingRequest?.route?.name ||
    pendingRequest?.new_route?.name ||
    pendingRequest?.requested_route?.name;
  const pendingStopName =
    pendingRequest?.stop?.name ||
    pendingRequest?.new_stop?.name ||
    pendingRequest?.requested_stop?.name;

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="transparent"
      translucent
      scrollEnabled
      headerUnScrollable={() => (
        <View
          style={[
            styles.headerWrapper,
            {marginTop: -insets.top, paddingTop: insets.top},
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
                style={{width: 18, height: 18}}
              />
            </TouchableOpacity>
            <CustomText
              label="Change Route"
              fontSize={16}
              fontFamily={fonts.bold}
              color="#101828"
              removeTranslation
            />
          </View>
        </View>
      )}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primaryColor} />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.card}>
            <CustomText
              label="Current Transport"
              fontSize={13}
              fontFamily={fonts.semiBold}
              color="#344054"
              marginBottom={12}
              removeTranslation
            />
            <InfoRow label="Route" value={currentRoute?.name || '-'} />
            <InfoRow label="Stop" value={currentStop?.name || '-'} />
            <InfoRow
              label="Bus"
              value={
                currentBus?.display_name ||
                (currentBus?.bus_number
                  ? `Bus #${currentBus.bus_number}`
                  : '-')
              }
            />
          </View>

          {pendingRequest ? (
            <View style={styles.card}>
              <CustomText
                label="Pending Request"
                fontSize={13}
                fontFamily={fonts.semiBold}
                color="#344054"
                marginBottom={12}
                removeTranslation
              />
              <InfoRow
                label="Status"
                value={pendingRequest.status || 'Pending'}
              />
              {pendingRouteName ? (
                <InfoRow label="New Route" value={pendingRouteName} />
              ) : null}
              {pendingStopName ? (
                <InfoRow label="New Stop" value={pendingStopName} />
              ) : null}
              {pendingRequest.reason ? (
                <InfoRow label="Reason" value={pendingRequest.reason} />
              ) : null}

              <CustomButton
                title="Cancel Request"
                backgroundColor="transparent"
                color={COLORS.primaryColor}
                borderWidth={1}
                borderColor={COLORS.primaryColor}
                borderRadius={24}
                height={48}
                marginTop={16}
                loading={cancelling}
                onPress={handleCancel}
              />
            </View>
          ) : null}

          {!pendingRequest && canRequest ? (
            <View style={styles.card}>
              <CustomText
                label="Request New Route"
                fontSize={13}
                fontFamily={fonts.semiBold}
                color="#344054"
                marginBottom={12}
                removeTranslation
              />

              <CustomInput
                placeholder="Select route"
                value={selectedRoute?.name || ''}
                withLabel="New Route"
                borderColor="#98A2B3"
                icon={Images.route}
                rightIconName="chevron-right"
                onPress={() => {
                  Keyboard.dismiss();
                  setRouteModalVisible(true);
                }}
              />

              <CustomInput
                placeholder="Select stop"
                value={selectedStop?.name || ''}
                withLabel="New Stop"
                borderColor="#98A2B3"
                icon={Images.route}
                rightIconName="chevron-right"
                onPress={openStopModal}
              />

              <CustomInput
                placeholder="Reason for route change"
                value={reason}
                onChangeText={setReason}
                withLabel="Reason"
                borderColor="#98A2B3"
                multiline
                height={100}
              />

              <GradientButton
                title="Submit Request"
                loading={submitting}
                onPress={handleSubmit}
                marginTop={8}
              />
            </View>
          ) : null}

          {!pendingRequest && !canRequest ? (
            <View style={styles.card}>
              <CustomText
                label="You cannot request a route change right now."
                fontSize={13}
                fontFamily={fonts.medium}
                color="#667085"
                textAlign="center"
                removeTranslation
              />
            </View>
          ) : null}
        </View>
      )}

      <SelectRoute
        visible={routeModalVisible}
        onClose={() => setRouteModalVisible(false)}
        selectedRoute={selectedRoute?.name}
        routes={availableRoutes.length ? availableRoutes : undefined}
        onSelectRoute={handleSelectRoute}
      />

      <SelectStop
        visible={stopModalVisible}
        onClose={() => setStopModalVisible(false)}
        routeId={selectedRoute?.id}
        selectedStopId={selectedStop?.id}
        listType="stops"
        onSelectStop={handleSelectStop}
      />
    </ScreenWrapper>
  );
};

const InfoRow = ({label, value}) => (
  <View style={styles.infoRow}>
    <CustomText
      label={label}
      fontSize={13}
      fontFamily={fonts.medium}
      color="#667085"
      removeTranslation
    />
    <CustomText
      label={value}
      fontSize={13}
      fontFamily={fonts.semiBold}
      color="#101828"
      textAlign="right"
      containerStyle={styles.infoValue}
      removeTranslation
    />
  </View>
);

export default ChangeRoute;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    gap: 64,
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
  loader: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  infoValue: {
    flex: 1,
  },
});
