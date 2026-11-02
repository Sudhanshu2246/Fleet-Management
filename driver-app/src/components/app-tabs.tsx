import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#B7F34A', // Electric Lime
        tabBarInactiveTintColor: '#717C72', // Muted text
        tabBarStyle: {
          backgroundColor: '#141815', // Sidebar / Tab nav dark background
          borderTopColor: '#303830', // Subtle dark border
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 82 : 60,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather name="map" size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Feather name="clock" size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Docs',
          tabBarIcon: ({ color }) => <Feather name="file-text" size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Feather name="user" size={20} color={color} />
        }}
      />
      {/* Hidden screen but keeps the tab bar visible */}
      <Tabs.Screen
        name="map-fullscreen"
        options={{
          href: null,
          title: 'Fullscreen Map',
        }}
      />
    </Tabs>
  );
}
