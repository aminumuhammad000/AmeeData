import { useAlert } from '@/components/AlertContext';
import { Notification, notificationsService } from '@/services/notifications.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showSuccess, showError } = useAlert();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const theme = {
    primary: '#0A2540',
    accent: '#FF9F43',
    backgroundLight: '#F8F9FA',
    backgroundDark: '#111921',
    textHeadings: '#1E293B',
    textBody: '#475569',
  };

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await notificationsService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      showSuccess('All notifications marked as read');
    } catch (error: any) {
      showError(error.message);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'transaction': return { name: 'wallet', color: '#10B981' };
      case 'promotion': return { name: 'gift', color: '#F59E0B' };
      case 'alert': return { name: 'alert-circle', color: '#EF4444' };
      default: return { name: 'notifications', color: theme.accent };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Notifications</Text>
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
          <Text style={[styles.markAllText, { color: theme.accent }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        >
          <View style={styles.notificationsList}>
            {notifications.map((notification) => {
              const icon = getIcon(notification.type);
              return (
                <TouchableOpacity
                  key={notification._id}
                  style={[
                    styles.notificationItem,
                    { backgroundColor: !notification.is_read ? (isDark ? '#1F2937' : '#F0F9FF') : cardBg }
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.notificationIcon, { backgroundColor: `${icon.color}20` }]}>
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={[styles.notificationTitle, { color: textColor }]}>
                        {notification.title}
                      </Text>
                      {!notification.is_read && (
                        <View style={[styles.unreadDot, { backgroundColor: theme.accent }]} />
                      )}
                    </View>
                    <Text style={[styles.notificationMessage, { color: textBodyColor }]} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: textBodyColor }]}>
                      {formatTime(notification.created_at)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {notifications.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color={textBodyColor} opacity={0.5} />
                <Text style={[styles.emptyText, { color: textBodyColor }]}>No notifications yet</Text>
              </View>
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  markAllBtn: { padding: 8 },
  markAllText: { fontSize: 13, fontWeight: '600' },
  notificationsList: { paddingHorizontal: 16, marginTop: 16, gap: 12 },
  notificationItem: { flexDirection: 'row', padding: 16, borderRadius: 16, gap: 12 },
  notificationIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  notificationContent: { flex: 1 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notificationTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  notificationMessage: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  notificationTime: { fontSize: 11, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, fontWeight: '500' }
});
