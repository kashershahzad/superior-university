import {StyleSheet, View} from 'react-native';
import React from 'react';
import ScreenWrapper from '../../../components/ScreenWrapper';
import fonts from '../../../assets/fonts';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';

const FeePaid = () => {
  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="#701A73"
      scrollEnabled
      headerUnScrollable={() => {
        return (
          <View style={styles.headerWrapper}>
            <View style={styles.headerContent}>
              <View>
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
      <View style={styles.bodySpacer} />
    </ScreenWrapper>
  );
};

export default FeePaid;

const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: "10%",
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
    bottom: -90,
    zIndex: 10,
    elevation: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  bodySpacer: {
    height: 110,
  },
  infoContainer: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoWrapper: {
    backgroundColor: '#F9F9F9',
    width: '30%',
    borderRadius: 8,
    height: 72,
    paddingHorizontal: 12,
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
});
