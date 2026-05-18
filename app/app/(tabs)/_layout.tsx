import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/components/ThemeContext';

export default function TabLayout() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const theme = {
    primary: '#6C2BD9',
    accent: '#FF9F43',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? theme.accent : theme.primary,
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700', // Bolded all labels for better visibility
          marginTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 4 }} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="icare"
        options={{
          title: 'I Care',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: focused ? theme.primary : '#E9D5FF', // Light purple when inactive
              opacity: focused ? 1 : 0.8, // Slightly faded when inactive
              borderRadius: 24,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: focused ? 0.4 : 0.1, // Stronger shadow when active
              shadowRadius: 8,
              elevation: focused ? 8 : 2,
              borderWidth: 2,
              borderColor: isDark ? '#1F2937' : '#FFFFFF',
            }}>
              <Ionicons name="heart" size={24} color={focused ? "#FFF" : theme.primary} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? "person" : "person-outline"} size={20} color={color} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 4 }} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="referrals"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
