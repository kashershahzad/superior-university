import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image, Platform, StyleSheet} from 'react-native';
import React from 'react';

import Notifications from '../screens/Main/Notifications';
import MapScreen from '../screens/Main/MapScreen';
import Profile from '../screens/Main/Profile';
import Chat from '../screens/Main/Chat';
import Home from '../screens/Main/Home';

import {tabIcons} from '../assets/images/tabIcons';
import {COLORS} from '../utils/COLORS';
import i18n from '../language/i18n';
import fonts from '../assets/fonts';

const Tab = createBottomTabNavigator();
const TabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={() => ({
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: fonts.regular,
        },
        tabBarStyle: {
          height: Platform.OS == 'android' ? 70 : 80,
          backgroundColor: COLORS.white,
          elevation: 10,
          paddingBottom: Platform.OS == 'android' ? 12 : 22,
          borderTopWidth: 0.6,
          borderTopColor: COLORS.lightGray,
          paddingTop: 5,
        },
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.primaryColor,
        headerShown: false,
      })}>
      <Tab.Screen
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={tabIcons.home}
              style={[
                styles.icon,
                {tintColor: focused ? COLORS.primaryColor : COLORS.tabIcon},
              ]}
            />
          ),
        }}
        name={i18n.t('Home')}
        component={Home}
      />

      <Tab.Screen
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={tabIcons.home}
              style={[
                styles.icon,
                {tintColor: focused ? COLORS.primaryColor : COLORS.tabIcon},
              ]}
            />
          ),
        }}
        name={i18n.t('Map')}
        component={MapScreen}
      />

      <Tab.Screen
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={tabIcons.home}
              style={[
                styles.icon,
                {tintColor: focused ? COLORS.primaryColor : COLORS.tabIcon},
              ]}
            />
          ),
        }}
        name={i18n.t('Notifications')}
        component={Notifications}
      />

      <Tab.Screen
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={tabIcons.home}
              style={[
                styles.icon,
                {tintColor: focused ? COLORS.primaryColor : COLORS.tabIcon},
              ]}
            />
          ),
        }}
        name={i18n.t('Chat')}
        component={Chat}
      />

      <Tab.Screen
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={tabIcons.home}
              style={[
                styles.icon,
                {tintColor: focused ? COLORS.primaryColor : COLORS.tabIcon},
              ]}
            />
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
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  homeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  text: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    bottom: 12,
  },
});
