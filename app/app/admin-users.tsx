import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import AdminUsersScreen from '@/screens/AdminUsersScreen';

export default function AdminUsersRoute() {
  const { isDark } = useTheme();
  const bg = isDark ? '#111921' : '#F8F9FA';
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <AdminUsersScreen />
    </View>
  );
}
