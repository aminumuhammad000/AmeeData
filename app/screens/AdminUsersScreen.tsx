import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminService } from '@/services/admin.service';

const theme = {
  primary: '#0A2540',
  accent: '#FF9F43',
  success: '#00D4AA',
  error: '#FF5B5B',
};

interface AdminUserItem {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended' | string;
}

export default function AdminUsersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#000000' : '#F9FAFB';
  const cardBgColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const textBodyColor = isDark ? '#D1D5DB' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 20;
  const debouncedQuery = useDebounce(query, 400);

  const loadUsers = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setError(null);
      }
      const currentPage = reset ? 1 : page;
      const res = await adminService.getAllUsers(currentPage, pageSize, debouncedQuery || undefined);
      if (res?.success) {
        const list: AdminUserItem[] = Array.isArray(res.data?.users || res.data?.items)
          ? (res.data.users || res.data.items)
          : [];
        const totalCount = Number(res.data?.total || res.data?.pagination?.total || list.length);
        setUsers(prev => (reset ? list : [...prev, ...list]));
        setTotal(totalCount);
        if (reset) setPage(1);
      } else {
        setError(res?.message || 'Failed to load users');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
    } finally {
      if (reset) setIsLoading(false);
      setRefreshing(false);
    }
  }, [page, pageSize, debouncedQuery]);

  useEffect(() => {
    // reload when debounced query changes
    loadUsers(true);
  }, [debouncedQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers(true);
  }, [loadUsers]);

  const onEndReached = useCallback(() => {
    const canLoadMore = users.length < total && !isLoading;
    if (!canLoadMore) return;
    setPage(prev => prev + 1);
  }, [users.length, total, isLoading]);

  useEffect(() => {
    if (page > 1) {
      loadUsers(false);
    }
  }, [page]);

  const renderItem = ({ item }: { item: AdminUserItem }) => (
    <View style={[styles.userCard, { backgroundColor: cardBgColor, borderColor }]}>
      <View style={styles.userAvatar}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>
          {`${(item.first_name || '').charAt(0)}${(item.last_name || '').charAt(0)}`.toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: textColor }]}>
          {(item.first_name || '') + ' ' + (item.last_name || '')}
        </Text>
        <Text style={{ color: textBodyColor, fontSize: 12 }}>{item.email}</Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: statusBg(item.status) }]}>
        <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: cardBgColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Users</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/admin-notifications')}>
          <Ionicons name="notifications-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={textBodyColor} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search by name or email"
          placeholderTextColor={textBodyColor}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={textBodyColor} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && users.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
          <Text style={{ color: textBodyColor, marginTop: 8 }}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
          ListEmptyComponent={!isLoading ? (
            <View style={styles.centered}>
              <Ionicons name="people-outline" size={36} color={textBodyColor} />
              <Text style={{ color: textBodyColor, marginTop: 8 }}>No users found</Text>
            </View>
          ) : null}
          ListFooterComponent={users.length > 0 && users.length < total ? (
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
              <ActivityIndicator color={theme.accent} />
            </View>
          ) : null}
        />
      )}

      {error && (
        <View style={[styles.errorBar, { backgroundColor: theme.error + '22', borderColor: theme.error + '55' }]}>
          <Ionicons name="alert-circle" size={16} color={theme.error} />
          <Text style={{ color: theme.error, marginLeft: 8 }}>{error}</Text>
          <TouchableOpacity onPress={() => { setError(null); loadUsers(true); }} style={{ marginLeft: 'auto' }}>
            <Ionicons name="refresh" size={18} color={theme.error} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function statusBg(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'active') return '#10B98120';
  if (s === 'inactive') return '#6B728020';
  if (s === 'suspended') return '#EF444420';
  return '#6B728020';
}

function statusColor(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'active') return '#10B981';
  if (s === 'inactive') return '#6B7280';
  if (s === 'suspended') return '#EF4444';
  return '#6B7280';
}

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current as any);
    timeoutRef.current = setTimeout(() => setDebounced(value), delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current as any);
    };
  }, [value, delay]);

  return debounced;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  placeholder: { width: 40 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  searchContainer: {
    margin: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 14 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    marginRight: 12,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '700' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700' },
  errorBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
