import { useProfile } from '@/components/ProfileContext';
import { useTheme } from '@/components/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { walletService } from '@/services/wallet.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const theme_colors = {
  primary: '#6C2BD9',
  accent: '#FF9F43',
  backgroundLight: '#F8F9FA',
  backgroundDark: '#0A0A0B',
  textHeadings: '#1E293B',
  textBody: '#475569',
  success: '#00D4AA',
};

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { profileData, getFullName } = useProfile();
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserProfile(),
        loadWalletData(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error: any) {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    }
  };

  const loadWalletData = async () => {
    try {
      const response = await walletService.getWallet();
      if (response.success) {
        setWallet(response.data);
      }
    } catch (error: any) {
      console.error('Error loading wallet:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const bgColor = isDark ? theme_colors.backgroundDark : theme_colors.backgroundLight;
  const textColor = isDark ? '#FFFFFF' : theme_colors.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme_colors.textBody;
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';

  const menuSections = [
    {
      title: 'Account Settings',
      items: [
        { icon: 'person-outline', label: 'Personal Information', route: '/edit-profile', color: '#6C2BD9' },
        { icon: 'wallet-outline', label: 'Wallet Settings', route: '/wallet-settings', color: '#10B981' },
        { icon: 'share-social-outline', label: 'Referrals', route: '/referrals', color: '#F59E0B' },
      ],
    },
    {
      title: 'Security',
      items: [
        { icon: 'lock-closed-outline', label: 'Transaction PIN', route: '/security', color: '#8B5CF6' },
        { icon: 'finger-print-outline', label: 'Biometrics', route: '/security', color: '#EC4899' },
      ],
    },
    {
      title: 'Support & Info',
      items: [
        { icon: 'help-circle-outline', label: 'Help & Support', route: '/help-support', color: '#06B6D4' },
        { icon: 'notifications-outline', label: 'Notifications', route: '/notifications', color: '#F43F5E' },
        { icon: 'information-circle-outline', label: 'About AmeeData', route: '/about', color: '#64748B' },
      ],
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={theme_colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme_colors.accent} />}
      >
        {/* Header Profile Info */}
        <View style={[styles.profileHeader, { backgroundColor: theme_colors.primary }]}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.userInfoContainer}>
            <View style={[styles.avatarContainer, { borderColor: theme_colors.accent }]}>
              <Image
                source={{ uri: profileData?.profileImage || user?.profile_picture || 'https://i.pravatar.cc/150?u=vtpay' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>
              {profileData ? getFullName() : (user ? `${user.first_name} ${user.last_name}` : 'User')}
            </Text>
            <Text style={styles.userEmail}>{profileData?.email || user?.email || ''}</Text>

            <View style={styles.badgeContainer}>
              <View style={[styles.verifiedBadge, { backgroundColor: user?.kyc_status === 'verified' ? theme_colors.success : theme_colors.accent }]}>
                <Ionicons name={user?.kyc_status === 'verified' ? "checkmark-circle" : "alert-circle"} size={14} color="#FFF" />
                <Text style={styles.verifiedText}>{user?.kyc_status === 'verified' ? 'Verified Account' : 'KYC Pending'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>₦{wallet?.balance?.toLocaleString() || '0'}</Text>
            <Text style={[styles.statLabel, { color: textBodyColor }]}>Wallet Balance</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.statValue, { color: textColor }]}>{user?.referral_code || '---'}</Text>
            <Text style={[styles.statLabel, { color: textBodyColor }]}>Referral Code</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: textBodyColor }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[styles.menuItem, itemIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }]}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: textColor }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={textBodyColor} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF4B4B" />
          <Text style={styles.logoutText}>Logout from Account</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: {
    paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingHorizontal: 20,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  userInfoContainer: { alignItems: 'center' },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, position: 'relative', marginBottom: 16 },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF9F43', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#6C2BD9' },
  userName: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12 },
  badgeContainer: { flexDirection: 'row' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  verifiedText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: -25, gap: 15 },
  statBox: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  menuSection: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  sectionCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.3)',
    gap: 10,
    marginBottom: 20
  },
  logoutText: { color: '#FF4B4B', fontSize: 16, fontWeight: '700' }
});
