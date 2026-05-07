import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface TabItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const BottomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    primary: '#0A2540',
    accent: '#FF9F43',
  };

  const tabs: TabItem[] = [
    { name: 'home', label: 'Home', icon: 'home', route: '/(tabs)' },
    { name: 'profile', label: 'Profile', icon: 'person-outline', route: '/(tabs)/profile' },
    { name: 'support', label: 'Support', icon: 'headset-outline', route: '/(tabs)/support' },
  ];

  const isActive = (route: string) => {
    if (route === '/(tabs)' && pathname === '/') return true;
    return pathname.includes(route.replace('/(tabs)', ''));
  };

  return (
    <View style={[styles.container, {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderTopColor: isDark ? '#374151' : '#E5E7EB',
    }]}>
      {tabs.map((tab) => {
        const active = isActive(tab.route);
        const iconColor = active
          ? (isDark ? theme.accent : theme.primary)
          : (isDark ? '#9CA3AF' : '#6B7280');

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.name === 'home' && active ? 'home' : tab.icon}
              size={24}
              color={iconColor}
            />
            <Text style={[styles.label, { color: iconColor }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 20,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default BottomTabBar;
