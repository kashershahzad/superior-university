import React, {useState, useCallback} from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

import {get} from '../../../services/ApiRequest';
import {COLORS} from '../../../utils/COLORS';
import Feeunpaid from './Feeunpaid';
import FeePaid from './FeePaid';
import {setUserData} from '../../../store/reducer/usersSlice';
import {store} from '../../../store';

const Home = () => {
  const dispatch = useDispatch();
  const {userData} = useSelector(state => state.users);
  const [feeStatus, setFeeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const role = String(
    dashboardData?.role || userData?.role || '',
  ).toLowerCase();
  const isTeacher = role === 'teacher';

  const fetchDashboard = useCallback(async (isPullRefresh = false) => {
    try {
      if (isPullRefresh) setRefreshing(true);
      const res = await get('student/dashboard');
      if (res?.data?.success) {
        const data = res.data.data ?? null;
        setDashboardData(data);
        setFeeStatus(data?.fee_status ?? null);
        if (data?.role) {
          const currentUser = store.getState()?.users?.userData || {};
          dispatch(
            setUserData({
              ...currentUser,
              role: data.role,
            }),
          );
        }
      }
    } catch (err) {
      console.log('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  // Voucher generate/cancel ke baad wapas aao → flags refresh (generate hide / upload show)
  useFocusEffect(
    useCallback(() => {
      fetchDashboard(false);
    }, [fetchDashboard]),
  );

  if (loading && !dashboardData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      </View>
    );
  }

  // Teacher → always paid screen
  // Student + unpaid → Generate Fee Voucher (Feeunpaid)
  if (isTeacher) {
    return (
      <FeePaid
        key="fee-paid"
        data={dashboardData}
        refreshing={refreshing}
        onRefresh={fetchDashboard}
      />
    );
  }

  if (feeStatus === 'paid') {
    return (
      <FeePaid
        key="fee-paid"
        data={dashboardData}
        refreshing={refreshing}
        onRefresh={fetchDashboard}
      />
    );
  }

  return (
    <Feeunpaid
      key="fee-unpaid"
      data={dashboardData}
      refreshing={refreshing}
      onRefresh={fetchDashboard}
    />
  );
};

export default Home;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
