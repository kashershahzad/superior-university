import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {get} from '../../../services/ApiRequest';
import CustomModal from '../../../components/CustomModal';
import CustomText from '../../../components/CustomText';
import {Images} from '../../../assets/images';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';
import {ToastMessage} from '../../../utils/ToastMessage';

/**
 * listType:
 * - 'stops' (default) → GET routes/{id}/stops
 * - 'buses' → GET routes/{id}/buses
 */
const SelectStop = ({
  visible,
  onClose,
  routeId,
  selectedStopId,
  onSelectStop,
  listType = 'stops',
}) => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const isStops = listType === 'stops';

  useEffect(() => {
    if (!visible) return;
    if (!routeId) {
      setItems([]);
      return;
    }
    fetchItems();
  }, [visible, routeId, listType]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = isStops
        ? `routes/${routeId}/stops`
        : `routes/${routeId}/buses`;
      const res = await get(endpoint);

      if (res?.data?.success) {
        const data = res.data.data;
        if (isStops) {
          const list = Array.isArray(data)
            ? data
            : data?.stops || data?.data || [];
          setItems(list);
        } else {
          setItems(data?.buses || (Array.isArray(data) ? data : []));
        }
      } else {
        ToastMessage(
          res?.error?.message ||
            (isStops ? 'Failed to load stops' : 'Failed to load buses'),
          'error',
        );
        setItems([]);
      }
    } catch (err) {
      console.log('SelectStop fetch error:', err);
      ToastMessage(isStops ? 'Failed to load stops' : 'Failed to load buses', 'error');
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
          label={isStops ? 'Select Stop' : 'Select Stop'}
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
            label="No stops found for this route"
            fontSize={13}
            fontFamily={fonts.medium}
            color="#667085"
            textAlign="center"
            marginTop={12}
            marginBottom={12}
            removeTranslation
          />
        ) : (
          items.map(item => {
            const selected = Number(selectedStopId) === Number(item.id);
            const title = isStops
              ? item.name || item.display_name || `Stop #${item.id}`
              : item.display_name || `Bus #${item.bus_number}`;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, selected && styles.itemSelected]}
                activeOpacity={0.7}
                onPress={() =>
                  onSelectStop?.({
                    id: item.id,
                    name: title,
                    busNumber: item.bus_number,
                    capacity: item.capacity,
                  })
                }>
                <CustomText
                  label={title}
                  removeTranslation
                  fontFamily={selected ? fonts.semiBold : fonts.regular}
                  color={selected ? COLORS.primaryColor : '#101828'}
                />
                {!isStops && item.bus_number ? (
                  <>
                    <View style={styles.metaRow}>
                      <Image source={Images.busIcon} style={styles.metaIcon} />
                      <CustomText
                        label={`Bus #${item.bus_number}`}
                        removeTranslation
                        fontSize={12}
                        color="#667085"
                      />
                    </View>
                    {item.capacity != null ? (
                      <View style={styles.metaRow}>
                        <CustomText
                          label={`Capacity: ${item.capacity}`}
                          removeTranslation
                          fontSize={12}
                          color="#667085"
                        />
                      </View>
                    ) : null}
                  </>
                ) : null}
                {isStops && item.pickup_time ? (
                  <View style={styles.metaRow}>
                    <Image source={Images.clock} style={styles.metaIcon} />
                    <CustomText
                      label={item.pickup_time}
                      removeTranslation
                      fontSize={12}
                      color="#667085"
                    />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </CustomModal>
  );
};

export default SelectStop;

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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    tintColor: '#667085',
  },
});
