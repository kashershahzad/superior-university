import {StyleSheet, View} from 'react-native';
import React from 'react';

import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';

const STATUS_STYLES = {
  pending: {backgroundColor: '#FEECEB', color: '#F97066'},
  done: {backgroundColor: '#E8F5E9', color: '#618833'},
  inProgress: {backgroundColor: '#FFF3E0', color: '#B08968'},
  waiting: {backgroundColor: '#F0F0F0', color: '#9E9E9E'},
};

const getStatusStyle = (status, statusType) => {
  if (statusType && STATUS_STYLES[statusType]) {
    return STATUS_STYLES[statusType];
  }

  const normalized = String(status || '').toLowerCase();

  if (normalized.includes('done')) return STATUS_STYLES.done;
  if (normalized.includes('progress')) return STATUS_STYLES.inProgress;
  if (normalized.includes('wait')) return STATUS_STYLES.waiting;

  return STATUS_STYLES.pending;
};

const StatusBadge = ({label, statusType}) => {
  const badgeStyle = getStatusStyle(label, statusType);

  return (
    <View style={[styles.badge, {backgroundColor: badgeStyle.backgroundColor}]}>
      <CustomText
        label={label}
        fontSize={12}
        fontFamily={fonts.medium}
        color={badgeStyle.color}
      />
    </View>
  );
};

const InfoCard = ({title, titleStatus, titleStatusType, items = []}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <CustomText
          label={title}
          fontSize={16}
          fontFamily={fonts.bold}
          color="#001B48"
        />
        {titleStatus ? (
          <StatusBadge label={titleStatus} statusType={titleStatusType} />
        ) : null}
      </View>

      <View style={styles.body}>
        {items.map((row, index) => {
          const isLast = index === items.length - 1;

          return (
            <View key={`${row.item}-${index}`}>
              <View style={styles.row}>
                <CustomText
                  label={row.item}
                  fontSize={14}
                  fontFamily={fonts.regular}
                  color="#6C7293"
                />

                {row.itemValue ? (
                  <CustomText
                    label={row.itemValue}
                    fontSize={14}
                    fontFamily={fonts.bold}
                    color="#001B48"
                    textAlign="right"
                    containerStyle={styles.valueText}
                  />
                ) : row.itemStatus ? (
                  <StatusBadge
                    label={row.itemStatus}
                    statusType={row.statusType}
                  />
                ) : null}
              </View>

              {!isLast ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default InfoCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  body: {
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  valueText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D0D5DD',
  },
});
