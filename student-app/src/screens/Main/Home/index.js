import React, {useEffect, useState, useCallback} from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';

import {get} from '../../../services/ApiRequest';
import {COLORS} from '../../../utils/COLORS';
import Feeunpaid from './Feeunpaid';
import FeePaid from './FeePaid';

const Home = () => {
  const [feeStatus, setFeeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // const fetchDashboard = async () => {
  //   try {
  //     const res = await get('student/dashboard');
  //     if (res?.data?.success) {
  //       const data = res.data.data ?? null;
  //       setDashboardData(data);
  //       setFeeStatus(data?.fee_status ?? null);
  //     }
  //   } catch (err) {
  //     console.log('Dashboard fetch error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchDashboard();
  // }, []);

  const fetchDashboard = useCallback(async (isPullRefresh = false) => {
    try {
      if (isPullRefresh) setRefreshing(true);
      const res = await get('student/dashboard');
      if (res?.data?.success) {
        const data = res.data.data ?? null;
        setDashboardData(data);
        setFeeStatus(data?.fee_status ?? null);
      }
    } catch (err) {
      console.log('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      </View>
    );
  }

  if (feeStatus === 'paid') {
    return <FeePaid key="fee-paid" data={dashboardData} refreshing={refreshing} onRefresh={fetchDashboard} />;
  }

  return <Feeunpaid key="fee-unpaid" data={dashboardData} refreshing={refreshing} onRefresh={fetchDashboard}/>;
};

export default Home;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
