import {StyleSheet, View} from 'react-native';
import React from 'react';
import moment from 'moment';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import Header from '../../../components/Header';
import Icons from '../../../components/Icons';

import {getMetaLabel, TYPE_META} from './molecules/Item';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const NotificationDetail = ({route}) => {
  const item = route?.params?.item || {};
  const meta = TYPE_META[item?.type] || TYPE_META.general;
  const extra = getMetaLabel(item?.data);
  const typeLabel = item?.type
    ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
    : 'General';

  return (
    <ScreenWrapper
      backgroundColor="#FAFAFA"
      statusBarColor="#FAFAFA"
      scrollEnabled
      headerUnScrollable={() => <Header title="Notification" />}>
      <View style={styles.card}>
        <View style={[styles.iconWrap, {backgroundColor: meta.bg}]}>
          <Icons
            family="Ionicons"
            name={meta.icon}
            size={26}
            color={meta.color}
          />
        </View>

        <CustomText
          label={typeLabel}
          fontSize={12}
          fontFamily={fonts.medium}
          color={meta.color}
          marginTop={16}
          removeTranslation
        />
        <CustomText
          label={item?.title || 'Notification'}
          fontSize={22}
          fontFamily={fonts.bold}
          color="#101828"
          marginTop={6}
          removeTranslation
        />
        <CustomText
          label={item?.created_at ? moment(item.created_at).format('DD MMM YYYY, hh:mm A') : ''}
          fontSize={12}
          fontFamily={fonts.medium}
          color="#98A2B3"
          marginTop={8}
          removeTranslation
        />

        {item?.body ? (
          <CustomText
            label={item.body}
            fontSize={15}
            fontFamily={fonts.regular}
            color="#475467"
            marginTop={20}
            lineHeight={22}
            removeTranslation
          />
        ) : null}

        {extra ? (
          <View style={[styles.chip, {backgroundColor: meta.bg}]}>
            <CustomText
              label={extra}
              fontSize={13}
              fontFamily={fonts.semiBold}
              color={meta.color}
              removeTranslation
            />
          </View>
        ) : null}
      </View>
    </ScreenWrapper>
  );
};

export default NotificationDetail;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECEFF3',
    marginTop: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
