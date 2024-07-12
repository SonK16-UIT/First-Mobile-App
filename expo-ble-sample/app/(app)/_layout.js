import { View, Text } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import HomeHeader from '../../components/HomeHeader';
import Icon from 'react-native-vector-icons/Ionicons';

export default function _layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          header: () => <HomeHeader title="Trang chủ" />,
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="rasp"
        options={{
          title: "Rasp",
          header: () => <HomeHeader title="Trang chủ" />,
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      /> */}
    </Tabs>
  );
}
