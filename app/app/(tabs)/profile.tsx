import { useProfile } from '@/components/ProfileContext';
import { useTheme } from '@/components/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { walletService } from '@/services/wallet.service';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  const { profileData, getFullName, updateProfile } = useProfile();
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
        updateProfile({
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          email: response.data.email,
          phoneNumber: response.data.phone_number,
          profileImage: response.data.profile_picture
        });
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

  const handleEditAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'We need permission to access your photos to change your avatar.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        const base64Image = `data:image/jpeg;base64,${asset.base64}`;

        setLoading(true);
        const response = await userService.updateProfile({ profile_picture: base64Image });
        if (response.success) {
          const imageUrl = response.data?.profile_picture || base64Image;
          setUser((prev: any) => ({ ...prev, profile_picture: imageUrl }));
          updateProfile({ profileImage: imageUrl });
          Alert.alert('Success', 'Profile picture updated successfully');
        } else {
          Alert.alert('Error', 'Failed to update profile picture');
        }
      }
    } catch (error) {
       console.log('Error updating avatar:', error);
       Alert.alert('Error', 'An error occurred while updating profile picture');
    } finally {
       setLoading(false);
    }
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
        { icon: 'person-outline', label: 'Personal Information', route: '/edit-profile' },
        { icon: 'share-social-outline', label: 'Referrals', route: '/referrals' },
      ],
    },
    {
      title: 'Security',
      items: [
        { icon: 'lock-closed-outline', label: 'Transaction PIN', route: '/security' },
      ],
    },
    {
      title: 'Support & Info',
      items: [
        { icon: 'help-circle-outline', label: 'Help & Support', route: '/help-support' },
        { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
        { icon: 'information-circle-outline', label: 'About AmeeData', route: '/about' },
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
        <View style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.userInfoContainer}>
            <View style={[styles.avatarContainer, { borderColor: borderColor }]}>
              <Image
                source={{ uri: user?.profile_picture || profileData?.profileImage || 'https://i.pravatar.cc/150?u=vtpay' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditAvatar}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.userName, { color: textColor }]}>
              {profileData ? getFullName() : (user ? `${user.first_name} ${user.last_name}` : 'User')}
            </Text>
            <Text style={[styles.userEmail, { color: textBodyColor }]}>{profileData?.email || user?.email || ''}</Text>

            <View style={styles.badgeContainer}>
              <View style={[styles.verifiedBadge, { backgroundColor: user?.kyc_status === 'verified' ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 159, 67, 0.1)' }]}>
                <Ionicons name={user?.kyc_status === 'verified' ? "checkmark-circle" : "alert-circle"} size={12} color={user?.kyc_status === 'verified' ? theme_colors.success : theme_colors.accent} />
                <Text style={[styles.verifiedText, { color: user?.kyc_status === 'verified' ? theme_colors.success : theme_colors.accent }]}>{user?.kyc_status === 'verified' ? 'Verified Account' : 'KYC Pending'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}>
            <Text style={[styles.statValue, { color: textColor }]}>₦{wallet?.balance?.toLocaleString() || '0'}</Text>
            <Text style={[styles.statLabel, { color: textBodyColor }]}>Wallet Balance</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}>
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
                  <Ionicons name={item.icon as any} size={20} color={textBodyColor} style={{ marginRight: 12 }} />
                  <Text style={[styles.menuLabel, { color: textColor }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={textBodyColor} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF4B4B" />
          <Text style={styles.logoutText}>Logout</Text>
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
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  userInfoContainer: { alignItems: 'center' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, position: 'relative', marginBottom: 12 },
  avatar: { width: '100%', height: '100%', borderRadius: 40 },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#6C2BD9', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  userName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: 12 },
  badgeContainer: { flexDirection: 'row' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  verifiedText: { fontSize: 11, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10, gap: 12 },
  statBox: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  menuSection: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    borderRadius: 16,
    gap: 8,
    marginBottom: 20
  },
  logoutText: { color: '#FF4B4B', fontSize: 14, fontWeight: '600' }
});
