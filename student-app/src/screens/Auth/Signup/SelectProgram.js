import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {get} from '../../../services/ApiRequest';
import CustomModal from '../../../components/CustomModal';
import CustomText from '../../../components/CustomText';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import {ToastMessage} from '../../../utils/ToastMessage';

const SelectProgram = ({
  visible,
  onClose,
  selectedProgramId,
  selectedProgram,
  onSelectProgram,
}) => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    fetchPrograms();
  }, [visible]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await get('programs');
      console.log('program res', res);

      const data = res?.data?.data ?? res?.data;
      const list = Array.isArray(data)
        ? data
        : data?.programs || [];

      if (list.length > 0 || res?.data?.success) {
        setItems(list);
      } else {
        ToastMessage(
          res?.error?.message || 'Failed to load programs',
          'error',
        );
        setItems([]);
      }
    } catch (err) {
      console.log('SelectProgram fetch error:', err);
      ToastMessage('Failed to load programs', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      isVisible={visible}
      onDisable={onClose}
      isChange
      animationIn="slideInUp"
      animationOut="slideOutDown"
      mainMargin={0}
      backdropOpacity={0.5}
      statusBarTranslucent>
      <View
        style={[
          styles.sheet,
          {paddingBottom: Math.max(insets.bottom, 16) + 14},
        ]}>
        <CustomText
          label="Select Program"
          fontSize={18}
          fontFamily={fonts.semiBold}
          marginBottom={16}
          removeTranslation
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primaryColor}
            style={{marginVertical: 20}}
          />
        ) : items.length === 0 ? (
          <CustomText
            label="No programs found"
            fontSize={13}
            fontFamily={fonts.medium}
            color="#667085"
            textAlign="center"
            marginTop={12}
            marginBottom={12}
            removeTranslation
          />
        ) : (
          items.map((item, index) => {
            const title =
              item.name || item.title || item.program || item.code || `Program`;
            const itemId = item.id ?? item.code ?? title;
            const selected =
              (selectedProgramId != null &&
                String(selectedProgramId) === String(itemId)) ||
              selectedProgram === title;

            return (
              <TouchableOpacity
                key={`${itemId}-${index}`}
                style={[styles.item, selected && styles.itemSelected]}
                activeOpacity={0.7}
                onPress={() =>
                  onSelectProgram?.({
                    id: item.id ?? itemId,
                    name: title,
                    code: item.code,
                  })
                }>
                <CustomText
                  label={title}
                  removeTranslation
                  fontFamily={selected ? fonts.semiBold : fonts.regular}
                  color={selected ? COLORS.primaryColor : '#101828'}
                />
                {item.code && item.code !== title ? (
                  <CustomText
                    label={item.code}
                    removeTranslation
                    fontSize={12}
                    color="#667085"
                    marginTop={4}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </CustomModal>
  );
};

export default SelectProgram;

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 14,
  },
  itemSelected: {
    borderColor: COLORS.primaryColor,
    backgroundColor: '#F4F3FF',
  },
});
