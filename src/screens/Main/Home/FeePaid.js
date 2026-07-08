import { StyleSheet, View } from 'react-native';
import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import ScreenWrapper from '../../../components/ScreenWrapper';
import fonts from '../../../assets/fonts';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import InfoCard from './InfoCard';

const DEFAULT_BUS_LOCATION = {
  latitude: 31.4704,
  longitude: 74.2507,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const FeePaid = () => {
  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="#701A73"
      scrollEnabled
      footerUnScrollable={() => {
        return (
          <View style={styles.footerContainer}>
            <ImageFast
              source={Images.discontinue}
              style={styles.discontinueIcon}
              resizeMode="contain"
            />
            <CustomText
              label="Discontinue Service"
              color="#701A73"
              fontSize={14}
              fontFamily={fonts.medium}
            />
          </View>
        );
      }}
      headerUnScrollable={() => {
        return (
          <View style={styles.headerWrapper}>
            <View style={styles.headerContent}>
              <View style={{ marginTop: -20 }}>
                <CustomText
                  label="My Transport"
                  color="#FEFEFE"
                  fontSize={24}
                  fontFamily={fonts.bold}
                />
                <CustomText
                  label="Fee Paid"
                  color="#D9D6FE"
                  fontSize={14}
                  fontFamily={fonts.medium}
                />
              </View>
              <ImageFast
                source={Images.bus}
                style={styles.busImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.cardOverlay}>
              <View style={styles.card}>
                <CustomText
                  label="Total Expense"
                  color="#101828"
                  fontSize={14}
                  fontFamily={fonts.medium}
                />
                <CustomText
                  label="Period 1 Jan 2024 - 30 Dec 2024"
                  color="#101828"
                  fontSize={12}
                  fontFamily={fonts.regular}
                />
                <View style={styles.infoContainer}>
                  <View style={styles.infoWrapper}>
                    <View style={styles.feeRow}>
                      <ImageFast
                        source={Images.fee}
                        style={styles.feeImage}
                        resizeMode="contain"
                      />
                      <CustomText
                        label="Fee"
                        color="#475467"
                        fontSize={12}
                        fontFamily={fonts.medium}
                      />
                    </View>
                    <CustomText
                      label="Paid"
                      color="#101828"
                      fontSize={22}
                      fontFamily={fonts.regular}
                      marginTop={3}
                      marginLeft={2}
                      removeTranslation
                    />
                  </View>

                  <View style={styles.infoWrapper}>
                    <View style={styles.feeRow}>
                      <ImageFast
                        source={Images.bus2}
                        style={styles.feeImage}
                        resizeMode="contain"
                      />
                      <CustomText
                        label="Buss"
                        color="#475467"
                        fontSize={12}
                        fontFamily={fonts.medium}
                      />
                    </View>
                    <CustomText
                      label="03"
                      color="#101828"
                      fontSize={22}
                      fontFamily={fonts.regular}
                      marginTop={3}
                      marginLeft={2}
                      removeTranslation
                    />
                  </View>

                  <View style={styles.infoWrapper}>
                    <View style={styles.feeRow}>
                      <ImageFast
                        source={Images.timer}
                        style={styles.feeImage}
                        resizeMode="contain"
                      />
                      <CustomText
                        label="Pickup ETA"
                        color="#475467"
                        fontSize={12}
                        fontFamily={fonts.medium}
                      />
                    </View>
                    <CustomText
                      label="08:15"
                      color="#101828"
                      fontSize={22}
                      fontFamily={fonts.regular}
                      marginTop={3}
                      marginLeft={2}
                      removeTranslation
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }}>
      <View style={styles.busLiveLocation}>
        <CustomText
          label="Bus Live Location"
          color="#101828"
          fontSize={12}
          fontFamily={fonts.medium}
        />
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
      <View style={styles.feeDetails}>
        <InfoCard
          title="Fee Details"
          titleStatusType="pending"
          items={[
            {item: 'Route', itemValue: '3-Faisalabad'},
            {item: 'Driver Name', itemValue: 'Tariq Mehmood'},
            {item: 'Bus', itemValue: '#3 Jail Road'},
            {item: 'Submitted Date', itemValue: '21 May 2025'},
          ]}
        />
      </View>
    </ScreenWrapper>
  );
};

export default FeePaid;

const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: '18%',
    backgroundColor: '#701A73',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'visible',
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  busImage: {
    width: 140,
    height: 110,
    left: '8%',
  },
  cardOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: -70,
    zIndex: 10,
    elevation: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.12,
    // shadowRadius: 8,
    // elevation: 8,
  },
  bodySpacer: {
    height: 110,
  },
  infoContainer: {
    marginTop: 16,
    flexDirection: 'row',
    gap: "2%",
  },
  infoWrapper: {
    backgroundColor: '#F9F9F9',
    width: '32%',
    borderRadius: 8,
    height: 72,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EBECEE',
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  feeImage: {
    width: 24,
    height: 24,
  },
  busLiveLocation: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    marginHorizontal: 16,
    marginTop: 80,
  },
  feeDetails: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  map: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F1F3F8',
    height: 48,
    marginBottom: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#701A73',
    marginHorizontal: 40,
  },
  discontinueIcon: {
    width: 24,
    height: 24,
  },
});
