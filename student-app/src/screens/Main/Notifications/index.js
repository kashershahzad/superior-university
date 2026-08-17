import {ActivityIndicator, RefreshControl, FlatList, View, StyleSheet} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';

import ScreenWrapper from '../../../components/ScreenWrapper';
import NoDataFound from '../../../components/NoDataFound';
import Header from '../../../components/Header';
import CustomText from '../../../components/CustomText';

import Item from './molecules/Item';

import {get, post} from '../../../services/ApiRequest';
import {COLORS} from '../../../utils/COLORS';
import fonts from '../../../assets/fonts';

const Notifications = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bottomLoader, setBottomLoader] = useState(false);

  const fetchNotifications = useCallback(async (nextPage = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (nextPage === 1) setLoading(true);
      else setBottomLoader(true);

      const res = await get('student/notifications', {
        per_page: 20,
        unread_only: 0,
        page: nextPage,
      });

      if (res?.data?.success) {
        const payload = res.data?.data || {};
        const items = payload.items || [];

        setUnreadCount(payload.unread_count || 0);
        setLastPage(payload.pagination?.last_page || 1);
        setPage(payload.pagination?.current_page || nextPage);
        setData(prev => (nextPage === 1 ? items : [...prev, ...items]));
      }
    } catch (error) {
      console.log('Notifications fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setBottomLoader(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchNotifications(1, false);
    }
  }, [isFocused, fetchNotifications]);

  const handleLoadMore = () => {
    if (!bottomLoader && !loading && page < lastPage) {
      fetchNotifications(page + 1);
    }
  };

  const handlePress = item => {
    const updated = {
      ...item,
      is_read: true,
      read_at: item?.read_at || new Date().toISOString(),
    };

    if (!item?.is_read) {
      setData(prev => prev.map(n => (n.id === item.id ? updated : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
      post(`student/notifications/${item.id}/read`).catch(err => {
        console.log('Mark notification read error:', err);
      });
    }

    navigation.navigate('NotificationDetail', {item: updated});
  };

  return (
    <ScreenWrapper
      backgroundColor="#FAFAFA"
      statusBarColor="#FAFAFA"
      headerUnScrollable={() => (
        <View>
          <Header title="Notifications" hideBackArrow />
          {unreadCount > 0 ? (
            <CustomText
              label={`${unreadCount} unread`}
              fontSize={13}
              fontFamily={fonts.medium}
              color={COLORS.primaryColor}
              textAlign="center"
              marginBottom={8}
              removeTranslation
            />
          ) : null}
        </View>
      )}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(1, true)}
              tintColor={COLORS.primaryColor}
            />
          }
          ListFooterComponent={
            bottomLoader ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={COLORS.primaryColor} />
              </View>
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <NoDataFound
              title="No Notification Found"
              desc="You don’t have any notifications yet."
            />
          }
          renderItem={({item}) => (
            <Item item={item} onPress={() => handlePress(item)} />
          )}
        />
      )}
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingTop: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
  footer: {
    marginVertical: 16,
  },
});
