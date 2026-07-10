import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Platform, StyleSheet, View } from 'react-native';
import React from 'react';

import Profile from '../screens/Main/Profile';
import Home from '../screens/Main/Home';
import Reciepts from '../screens/Main/Notifications';

import { tabIcons } from '../assets/images/tabIcons';
import { COLORS } from '../utils/COLORS';
import i18n from '../language/i18n';
import fonts from '../assets/fonts';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const Tab = createBottomTabNavigator();
const TabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={() => ({
        // tabBarLabelStyle: {
        //   fontSize: 12,
        //   fontFamily: fonts.regular,
        // },
        tabBarStyle: {
          height: Platform.OS == 'android' ? 80 : 80,
          backgroundColor: COLORS.primaryColor,
          elevation: 10,
          paddingBottom: Platform.OS == 'android' ? 18 : 22,
          paddingTop: 18,
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.white,
        headerShown: false,
      })}>
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconWrap}>
              <Image
                source={focused ? tabIcons.homeFilled : tabIcons.home}
                style={[
                  styles.icon,
                  { tintColor: COLORS.white },
                ]}
              />
              <View
                style={[
                  styles.activeLine,
                  { backgroundColor: focused ? COLORS.white : 'transparent' },
                ]}
              />
            </View>
          ),
        }}
        name={i18n.t('Home')}
        component={Home}
      />

      {/* <Tab.Screen
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
      /> */}

      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconWrap}>
              <Image
                source={focused ? tabIcons.recieptFilled : tabIcons.reciept}
                style={[
                  styles.icon,
                  { tintColor: COLORS.white },
                ]}
              />
              <View
                style={[
                  styles.activeLine,
                  { backgroundColor: focused ? COLORS.white : 'transparent' },
                ]}
              />
            </View>
          ),
        }}
        name={i18n.t('Reciepts')}
        component={Reciepts}
      />

      {/* <Tab.Screen
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
      /> */}

      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabIconWrap}>
              <Image
                source={focused ? tabIcons.profileFilled : tabIcons.profile}
                style={[
                  styles.icon,
                  { tintColor: COLORS.white },
                ]}
              />
              <View
                style={[
                  styles.activeLine,
                  { backgroundColor: focused ? COLORS.white : 'transparent' },
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
