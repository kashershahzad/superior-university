import {FlatList, StyleSheet, View, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import ScreenWrapper from '../../../components/ScreenWrapper';
import CustomText from '../../../components/CustomText';
import ImageFast from '../../../components/ImageFast';
import {Images} from '../../../assets/images';
import fonts from '../../../assets/fonts';
import InfoCard from '../Home/InfoCard';
import {get} from '../../../services/ApiRequest';
import {ToastMessage} from '../../../utils/ToastMessage';

const AttendanceHistory = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [history, setHistory] = useState([]);

  const fetchAttendanceHistory = async () => {
    try {
      const res = await get('uni-staff/attendance-history');

      if (res?.error) return;

      if (res?.data?.success) {
        setHistory(res.data?.data?.history || []);
      } else {
        ToastMessage(
          res?.data?.message || 'Failed to load attendance history',
          'error',
        );
      }
    } catch (err) {
      console.log('Attendance history error:', err);
      ToastMessage('Failed to load attendance history', 'error');
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    fetchAttendanceHistory();
  }, [isFocused]);

  const renderHistoryItem = ({item}) => {
    const items = [
      {item: 'Bus', itemValue: item.bus || ''},
      {item: 'Route', itemValue: item.route || ''},
      {item: 'Marked by', itemValue: item.marked_by || ''},
      {item: 'Time', itemValue: item.submitted_at_label || ''},
      {
        item: 'Present',
        itemValue: String(item.summary?.present ?? 0),
        itemValueColor: '#719055',
      },
      {
        item: 'Absent',
        itemValue: String(item.summary?.absent ?? 0),
        itemValueColor: '#EB5757',
      },
      {
        item: 'Pending',
        itemValue: String(item.summary?.pending ?? 0),
        itemValueColor: '#A67F4E',
      },
      {item: 'Total', itemValue: String(item.summary?.total ?? 0)},
    ];

    return (
      <InfoCard
        title={item.session_label || item.date_label || ''}
        titleStatus={item.is_submitted ? 'Submitted' : undefined}
        titleStatusType={item.is_submitted ? 'done' : undefined}
        items={items}
      />
    );
  };

  return (
    <ScreenWrapper
      backgroundColor="#F1F3F8"
      paddingHorizontal={0}
      statusBarColor="transparent"
      translucent
      headerUnScrollable={() => {
        return (
          <View
            style={[
              styles.headerWrapper,
              {marginTop: -insets.top, paddingTop: insets.top},
            ]}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.backButton}
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                    return;
                  }
                  navigation.navigate('Profile');
                }}>
                <ImageFast
                  source={Images.backArrow}
                  style={{width: 18, height: 18}}
                />
              </TouchableOpacity>
              <CustomText
                label="Attendance History"
                fontSize={16}
                fontFamily={fonts.bold}
                color="#101828"
              />
            </View>
          </View>
        );
      }}>
      <FlatList
        data={history}
        keyExtractor={item => String(item.id)}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <CustomText
              label="No attendance history found"
              color="#667085"
              fontSize={13}
              fontFamily={fonts.medium}
              textAlign="center"
              removeTranslation
            />
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default AttendanceHistory;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    gap: 84,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
});
