import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomModal from '../../../components/CustomModal';
import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const ROUTES = [
  { id: '1', name: 'Route 1 - Canal Road', busNumber: 'Bus #01' },
  { id: '2', name: 'Route 2 - Satiana Road', busNumber: 'Bus #02' },
  { id: '3', name: 'Route 3 - Faisalabad', busNumber: 'Bus #03' },
  { id: '4', name: 'Route 4 - Jaranwala Road', busNumber: 'Bus #04' },
];

const SelectRoute = ({ visible, onClose, onSelectRoute, selectedRoute }) => {

  const insets = useSafeAreaInsets();
  
  return (
    <CustomModal
      isVisible={visible}
      onDisable={onClose}
      isChange
      animationIn="slideInUp"
      animationOut="slideOutDown"
      mainMargin={0}
      backdropOpacity={0.5}
      statusBarTranslucent
    >
      <View style={[styles.routeSheet, {paddingBottom: Math.max(insets.bottom, 16) + 14 }]}>
        <CustomText
          label="Select Route"
          fontSize={18}
          fontFamily={fonts.semiBold}
          marginBottom={16}
        />

        {ROUTES.map(route => {
          const selected = selectedRoute === route.name;
          return (
            <TouchableOpacity
              key={route.id}
              style={[styles.routeItem, selected && styles.routeItemSelected]}
              activeOpacity={0.7}
              onPress={() => onSelectRoute?.(route)}
            >
              <CustomText
                label={route.name}
                fontFamily={selected ? fonts.semiBold : fonts.regular}
                color={selected ? COLORS.primaryColor : '#101828'}
              />
              <CustomText
                label={route.busNumber}
                fontSize={12}
                color="#667085"
                marginTop={4}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </CustomModal>
  );
};

export default SelectRoute;

const styles = StyleSheet.create({
    routeSheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        // paddingBottom: 30,
      },
      routeItem: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EAECF0',
        marginBottom: 14,
      },
      routeItemSelected: {
        borderColor: COLORS.primaryColor,
        backgroundColor: '#F4F3FF',
      },
    });