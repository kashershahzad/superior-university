import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/COLORS';
import Icons from './Icons';

const CustomCheckbox = ({
  value,
  onValueChange,
  checkedBgColor = COLORS.primaryColor,
  tickColor = COLORS.white,
}) => {
  return (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          value && {backgroundColor: checkedBgColor},
        ]}>
        {value && (
          <Icons
            name="check"
            family={'AntDesign'}
            size={12}
            color={tickColor}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primaryColor, // Primary color for the checkbox border
    marginRight: 10,
  },
  checkbox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default CustomCheckbox;
