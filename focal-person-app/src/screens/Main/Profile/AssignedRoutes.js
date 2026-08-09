import {FlatList, StyleSheet, View, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';
import {get} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';

const AssignedRoutes = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [assignedData, setAssignedData] = useState(null);

  const bus = assignedData?.bus;
  const route = assignedData?.route;
  const stops = assignedData?.stops || [];

  const fetchAssignedRoutes = async () => {
    try {
      const res = await get('uni-staff/assigned-routes');

      if (res?.error) return;

      if (res?.data?.success) {
        setAssignedData(res.data.data);
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to load assigned routes',
          'error',
        );
      }
    } catch (err) {
      console.log('Assigned routes error:', err);
      ToastMessage('Failed to load assigned routes', 'error');
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchAssignedRoutes();
  }, [isFocused]);

  const renderStopItem = ({item}) => (
    <View style={styles.stopRow}>
      <View style={styles.stopOrder}>
        <CustomText
          label={String(item.stop_order ?? '')}
          color="#701A73"
          fontSize={12}
          fontFamily={fonts.bold}
          removeTranslation
        />
      </View>
      <View style={styles.stopText}>
        <CustomText
          label={item.name || ''}
          color="#101828"
          fontSize={14}
          fontFamily={fonts.medium}
          removeTranslation
        />
        {item.latitude != null && item.longitude != null ? (
          <CustomText
            label={`${item.latitude}, ${item.longitude}`}
            color="#667085"
            fontSize={11}
            fontFamily={fonts.regular}
            marginTop={2}
            removeTranslation
          />
        ) : null}
      </View>
    </View>
  );

  const listHeader = (
    <View style={styles.headerCards}>
      {!!assignedData?.message && (
        <CustomText
          label={assignedData.message}
          color="#667085"
          fontSize={13}
          fontFamily={fonts.medium}
          removeTranslation
        />
      )}

      {!assignedData?.has_assignment ? (
        <View style={styles.emptyWrap}>
          <CustomText
            label="No route assigned"
            color="#667085"
            fontSize={13}
            fontFamily={fonts.medium}
            textAlign="center"
            removeTranslation
          />
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <CustomText
              label="Bus"
              color="#344054"
              fontSize={12}
              fontFamily={fonts.semiBold}
            />
            <CustomText
              label={bus?.display_name || bus?.label || ''}
              color="#101828"
              fontSize={16}
              fontFamily={fonts.semiBold}
              marginTop={6}
              removeTranslation
            />
            <CustomText
              label={bus?.label || ''}
              color="#667085"
              fontSize={12}
              fontFamily={fonts.regular}
              marginTop={4}
              removeTranslation
            />
          </View>

          <View style={styles.card}>
            <CustomText
              label="Route"
              color="#344054"
              fontSize={12}
              fontFamily={fonts.semiBold}
            />
            <CustomText
              label={route?.name || ''}
              color="#101828"
              fontSize={16}
              fontFamily={fonts.semiBold}
              marginTop={6}
              removeTranslation
            />
            <View style={styles.routeMeta}>
              <CustomText
                label={`End: ${route?.end_point || '-'}`}
                color="#667085"
                fontSize={12}
                fontFamily={fonts.regular}
                removeTranslation
              />
              <CustomText
                label={`Pickup: ${route?.pickup_time || '-'}`}
                color="#667085"
                fontSize={12}
                fontFamily={fonts.regular}
                removeTranslation
              />
              <CustomText
                label={`Stops: ${route?.stops_count ?? stops.length}`}
                color="#667085"
                fontSize={12}
                fontFamily={fonts.regular}
                removeTranslation
              />
            </View>
          </View>

          <CustomText
            label="Stops"
            color="#344054"
            fontSize={12}
            fontFamily={fonts.semiBold}
            marginTop={4}
          />
        </>
      )}
    </View>
  );

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="transparent"
      translucent
      headerUnScrollable={() => {
        return (
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
                <ImageFast
                  source={Images.backArrow}
                  style={{width: 18, height: 18}}
                />
              </TouchableOpacity>
              <CustomText
                label="Assigned Routes"
                fontSize={16}
                fontFamily={fonts.bold}
                color="#101828"
              />
            </View>
          </View>
        );
      }}>
      <FlatList
        data={assignedData?.has_assignment ? stops : []}
        keyExtractor={item => String(item.id)}
        renderItem={renderStopItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          assignedData?.has_assignment ? (
            <View style={styles.emptyWrap}>
              <CustomText
                label="No stops found"
                color="#667085"
                fontSize={13}
                fontFamily={fonts.medium}
                textAlign="center"
                removeTranslation
              />
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  );
};

export default AssignedRoutes;

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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    flexGrow: 1,
  },
  headerCards: {
    gap: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  routeMeta: {
    marginTop: 8,
    gap: 4,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  stopOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopText: {
    flex: 1,
  },
  emptyWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
});
