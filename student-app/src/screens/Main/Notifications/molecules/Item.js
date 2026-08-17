import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import moment from 'moment';

import CustomText from '../../../../components/CustomText';
import Icons from '../../../../components/Icons';

import {COLORS} from '../../../../utils/COLORS';
import fonts from '../../../../assets/fonts';

const TYPE_META = {
  fee: {icon: 'cash-outline', color: '#B54708', bg: '#FEF0C7'},
  transport: {icon: 'bus-outline', color: '#026AA2', bg: '#E0F2FE'},
  general: {
    icon: 'notifications-outline',
    color: COLORS.primaryColor,
    bg: '#F4E8F6',
  },
};

const getMetaLabel = data => {
  if (!data || typeof data !== 'object') return '';
  if (data.voucher) return data.voucher;
  if (data.bus && data.stop) return `Bus #${data.bus} · ${data.stop}`;
  if (data.bus) return `Bus #${data.bus}`;
  if (data.stop) return data.stop;
  return '';
};

const Item = ({item, onPress}) => {
  const meta = TYPE_META[item?.type] || TYPE_META.general;
  const isUnread = item?.is_read === false;
  const extra = getMetaLabel(item?.data);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      // onPress={onPress}
      style={[styles.card, isUnread && styles.unreadCard]}>
      <View style={[styles.iconWrap, {backgroundColor: meta.bg}]}>
        <Icons family="Ionicons" name={meta.icon} size={20} color={meta.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <CustomText
            label={item?.title || 'Notification'}
            fontFamily={fonts.semiBold}
            fontSize={15}
            color="#101828"
            textStyle={styles.title}
            numberOfLines={1}
            removeTranslation
          />
          {isUnread ? <View style={styles.dot} /> : null}
        </View>

        {item?.body ? (
          <CustomText
            label={item.body}
            fontSize={13}
            fontFamily={fonts.regular}
            color="#667085"
            numberOfLines={2}
            marginTop={4}
            removeTranslation
          />
        ) : null}

        {extra ? (
          <CustomText
            label={extra}
            fontSize={12}
            fontFamily={fonts.medium}
            color={meta.color}
            marginTop={6}
            removeTranslation
          />
        ) : null}

        <CustomText
          label={item?.created_at ? moment(item.created_at).fromNow() : ''}
          fontSize={11}
          fontFamily={fonts.medium}
          color="#98A2B3"
          marginTop={8}
          removeTranslation
        />
      </View>
    </TouchableOpacity>
  );
};

export default Item;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEFF3',
  },
  unreadCard: {
    borderColor: '#E9D7F0',
    backgroundColor: '#FCF8FD',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryColor,
  },
});
