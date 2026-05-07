import { useAlert } from '@/components/AlertContext';
import { ThemeMode, useTheme } from '@/components/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const theme = {
  primary: '#0A2540',
  accent: '#FF9F43',
  success: '#00D4AA',
  error: '#FF5B5B',
  backgroundLight: '#F8F9FA',
  backgroundDark: '#111921',
  textHeadings: '#1E293B',
  textBody: '#475569',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, isDark, setThemeMode } = useTheme();
  const { showSuccess } = useAlert();
  const { user } = useAuth();

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const themeOptions = [
    {
      id: 'light' as ThemeMode,
      title: 'Light Mode',
      description: 'Always use light theme',
      icon: 'sunny'
    },
    {
      id: 'dark' as ThemeMode,
      title: 'Dark Mode',
      description: 'Always use dark theme',
      icon: 'moon'
    },
    {
      id: 'system' as ThemeMode,
      title: 'System Default',
      description: 'Follow system theme setting',
      icon: 'phone-portrait'
    }
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    showSuccess(`Theme changed to ${mode === 'system' ? 'system default' : mode + ' mode'}`);
  };

  const ThemeOption = ({ option }: { option: typeof themeOptions[0] }) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        themeMode === option.id && styles.selectedThemeOption,
        { borderColor: themeMode === option.id ? theme.primary : borderColor }
      ]}
      onPress={() => handleThemeChange(option.id)}
    >
      <View style={styles.themeOptionContent}>
        <View style={[
          styles.themeIconContainer,
          { backgroundColor: themeMode === option.id ? theme.primary : borderColor }
        ]}>
          <Ionicons
            name={option.icon as any}
            size={24}
            color={themeMode === option.id ? '#FFFFFF' : textBodyColor}
          />
        </View>
        <View style={styles.themeTextContainer}>
          <Text style={[styles.themeTitle, { color: textColor }]}>{option.title}</Text>
          <Text style={[styles.themeDescription, { color: textBodyColor }]}>
            {option.description}
          </Text>
        </View>
        {themeMode === option.id && (
          <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Theme Settings */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Appearance</Text>
          <Text style={[styles.sectionDescription, { color: textBodyColor }]}>
            Choose how the app looks on your device
          </Text>

          <View style={styles.themeOptionsContainer}>
            {themeOptions.map((option) => (
              <ThemeOption key={option.id} option={option} />
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Security</Text>
          <Text style={[styles.sectionDescription, { color: textBodyColor }]}>Manage your security settings</Text>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
            onPress={() => router.push('/change-password')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0A254020' : '#0A254015' }}>
                <Ionicons name="key-outline" size={20} color={theme.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>Change Password</Text>
                <Text style={{ color: textBodyColor, fontSize: 13 }}>Update your login password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textBodyColor} />
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#F3F4F6', marginVertical: 4 }} />

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
            onPress={() => router.push('/security')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0A254020' : '#0A254015' }}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>Transaction PIN</Text>
                <Text style={{ color: textBodyColor, fontSize: 13 }}>Set or update your 4-digit PIN</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textBodyColor} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Support</Text>
          <Text style={[styles.sectionDescription, { color: textBodyColor }]}>Get help and contact us</Text>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
            onPress={() => router.push('/help-support' as any)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0A254020' : '#06B6D415' }}>
                <Ionicons name="help-circle-outline" size={20} color="#06B6D4" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>Help & Support</Text>
                <Text style={{ color: textBodyColor, fontSize: 13 }}>FAQs and contact information</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textBodyColor} />
          </TouchableOpacity>
        </View>

        {/* Admin Panel Section - Only visible to admins */}
        {(user?.role === 'admin' || user?.role_id === 'admin') && (
          <View style={[styles.section, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Admin Panel</Text>
            <Text style={[styles.sectionDescription, { color: textBodyColor }]}>Manage users and system settings</Text>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
              onPress={() => router.push('/admin-users')}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0A254020' : '#0A254015' }}>
                  <Ionicons name="people-outline" size={20} color={theme.primary} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>Manage Users</Text>
                  <Text style={{ color: textBodyColor, fontSize: 13 }}>View and manage user accounts</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={textBodyColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6' }}
              onPress={() => router.push('/admin-notifications')}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0A254020' : '#0A254015' }}>
                  <Ionicons name="notifications-outline" size={20} color={theme.primary} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>Push Notifications</Text>
                  <Text style={{ color: textBodyColor, fontSize: 13 }}>Send broadcast messages</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={textBodyColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6' }}
              onPress={() => router.push('/admin-gateway')}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0A254020' : '#0A254015' }}>
                  <Ionicons name="settings-outline" size={20} color={theme.primary} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>Gateway Settings</Text>
                  <Text style={{ color: textBodyColor, fontSize: 13 }}>Configure virtual account display</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={textBodyColor} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  themeOptionsContainer: {
    gap: 12,
  },
  themeOption: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  selectedThemeOption: {
    backgroundColor: 'rgba(10, 37, 64, 0.05)',
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
});