import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { Feather } from '@expo/vector-icons';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import theme from '../../theme';

export default function _layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerHideStatusBarOnOpen: true,
          drawerActiveBackgroundColor: '#21253B',
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor: '#A0A3BD',
          drawerLabelStyle: { marginLeft: -20 },
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: 'Trang chủ',
            headerTitle: 'Trang chủ',
            drawerIcon: ({ size, color }) => (
              <Icon name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Hồ sơ',
            headerTitle: 'Hồ sơ',
            drawerIcon: ({ size, color }) => (
              <Feather name="user" color={color} size={size} />
            ),
          }}
        />
        {/* <Drawer.Screen
          name="notification"
          options={{
            drawerLabel: 'Thông báo',
            headerTitle: 'Thông báo',
            drawerIcon: ({ size, color }) => (
              <Feather name="bell" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Cài đặt',
            headerTitle: 'Cài đặt',
            drawerIcon: ({ size, color }) => (
              <Feather name="settings" color={color} size={size} />
            ),
          }}
        /> */}
      </Drawer>
    </GestureHandlerRootView>
  );
}
