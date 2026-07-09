import {StyleSheet, View} from 'react-native';
import React from 'react';

import CustomText from '../../../components/CustomText';
import fonts from '../../../assets/fonts';

const STATUS_STYLES = {
  pending: {backgroundColor: '#FFE7E7', color: '#EB5757'},
  done: {backgroundColor: '#E7F1D9', color: '#719055'},
  inProgress: {backgroundColor: '#F8EEDA', color: '#A67F4E'},
  waiting: {backgroundColor: '#F1EFE8', color: '#88878A'},
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

const InfoCard = ({title, titleStatus, titleStatusType, items = [], backgroundColor = '#FFFFFF', bodyBackgroundColor = '#F8F9FE'}) => {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.header}>
        <CustomText
          label={title}
          fontSize={13}
          fontFamily={fonts.bold}
          color="#0C1B54"
        />
        {titleStatus ? (
          <StatusBadge label={titleStatus} statusType={titleStatusType} />
        ) : null}
      </View>

      <View style={[styles.body, { backgroundColor: bodyBackgroundColor }]}>
        {items.map((row, index) => {
          const isLast = index === items.length - 1;

          return (
            <View key={`${row.item}-${index}`}>
              <View style={styles.row}>
                <CustomText
                  label={row.item}
                  fontSize={13}
                  fontFamily={fonts.medium}
                  color="#6D7698"
                />

                {row.itemValue ? (
                  <CustomText
                    label={row.itemValue}
                    fontSize={13}
                    fontFamily={fonts.bold}
                    color="#0C1B54"
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
    borderRadius: 8,
    height: 28,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#98A2B3',
  },
});
