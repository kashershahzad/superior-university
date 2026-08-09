import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image, Platform, StyleSheet, View} from 'react-native';
import React from 'react';

import Profile from '../screens/Main/Profile';
import Home from '../screens/Main/Home';
import Attendance from '../screens/Main/Attendance';

import {tabIcons} from '../assets/images/tabIcons';
import {COLORS} from '../utils/COLORS';
import i18n from '../language/i18n';
import fonts from '../assets/fonts';

const Tab = createBottomTabNavigator();

const TabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={() => ({
        tabBarStyle: {
          height: Platform.OS === 'android' ? 88 : 88,
          backgroundColor: COLORS.primaryColor,
          elevation: 10,
          paddingBottom: Platform.OS === 'android' ? 22 : 22,
          paddingTop: 18,
          borderTopWidth: 0, 
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.white,
        headerShown: false,
      })}>
      <Tab.Screen
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabIconWrap}>
              <Image
                source={focused ? tabIcons.homeFilled : tabIcons.home}
                style={[styles.icon, {tintColor: COLORS.white}]}
              />
              <View
                style={[
                  styles.activeLine,
                  {backgroundColor: focused ? COLORS.white : 'transparent'},
                ]}
              />
            </View>
          ),
        }}
        name={i18n.t('Home')}
        component={Home}
      />

      <Tab.Screen
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabIconWrap}>
              <Image
                source={focused ? tabIcons.recieptFilled : tabIcons.reciept}
                style={[styles.icon, {tintColor: COLORS.white}]}
              />
              <View
                style={[
                  styles.activeLine,
                  {backgroundColor: focused ? COLORS.white : 'transparent'},
                ]}
              />
            </View>
          ),
        }}
        name="Attendance"
        component={Attendance}
      />

      <Tab.Screen
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabIconWrap}>
              <Image
                source={focused ? tabIcons.profileFilled : tabIcons.profile}
                style={[styles.icon, {tintColor: COLORS.white}]}
              />
              <View
                style={[
                  styles.activeLine,
                  {backgroundColor: focused ? COLORS.white : 'transparent'},
                ]}
              />
            </View>
          ),
        }}
        name={i18n.t('Profile')}
        component={Profile}
      />
    </Tab.Navigator>
  );
};

export default TabStack;

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    bottom: 12,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  activeLine: {
    width: 12,
    height: 2,
    borderRadius: 2,
  },
});
