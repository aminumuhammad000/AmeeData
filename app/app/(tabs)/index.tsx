import { useProfile } from '@/components/ProfileContext';
import { useTheme } from '@/components/ThemeContext';
import { authService } from '@/services/auth.service';
import { billPaymentService } from '@/services/billpayment.service';
import * as Contacts from 'expo-contacts';

import { userService } from '@/services/user.service';
import { WalletData, walletService } from '@/services/wallet.service';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter, useNavigation } from 'expo-router';
import { transactionService, Transaction as ApiTransaction } from '@/services/transaction.service';
import { notificationService } from '@/services/api';

import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'airtime' | 'data'>('airtime');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [selectedAirtimeIndex, setSelectedAirtimeIndex] = useState<number | null>(null);
  const [selectedDataIndex, setSelectedDataIndex] = useState<number | null>(null);
  const { profileData } = useProfile();
  const [wallet, setWallet] = useState<WalletData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pinPrompted, setPinPrompted] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);


  // Load data when screen comes into focus (e.g., after login)
  useFocusEffect(
    useCallback(() => {
      checkAuthAndLoadData();
    }, [])
  );

  const checkAuthAndLoadData = async () => {
    try {
      // Check if user is authenticated before loading data
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await loadAllData();
      } else {
        // No token, just load cached user data
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setLoading(false);
      }
    } catch (error) {
      console.log('Auth check error:', error);
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserProfile(),
        loadWalletData(),
        loadRecentTransactions(),
        loadNotifications()
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      // Don't show intrusive alert, just log error
      // User can still use the app with cached/default data
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      // Check authentication before making request
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Failed to load profile from server, using cached data');
        const userData = await authService.getCurrentUser();
        setUser(userData);
        return;
      }

      const response = await userService.getProfile();
      if (response.success) {
        setUser(response.data);
        // Prompt to set PIN if not set (legacy/new users)
        if (!pinPrompted && !response.data?.transaction_pin) {
          setPinPrompted(true);
          Alert.alert(
            'Set Transaction PIN',
            'For your security, please set your 4-digit transaction PIN to proceed with purchases.',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Set PIN', onPress: () => router.push('/security') }
            ]
          );
        }
      }
    } catch (error: any) {
      console.log('Error loading profile:', error);
      // Fallback to local storage
      const userData = await authService.getCurrentUser();
      setUser(userData);
    }
  };

  const loadWalletData = async () => {
    try {
      // Check authentication before making request
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setWallet(null);
        return;
      }

      const response = await walletService.getWallet();
      if (response.success && response.data) {
        setWallet(response.data);
      } else {
        setWallet(null);
      }
    } catch (error: any) {
      console.log('Error loading wallet:', error);
      setWallet(null);
    }
  };



  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.data.success && response.data.data) {
        const unread = response.data.data.filter((n: any) => !n.read).length;
        setUnreadNotifications(unread);
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const theme = {
    primary: '#6C2BD9',
    accent: '#6C2BD9',
    backgroundLight: '#F8F9FA',
    backgroundDark: '#111921',
    textHeadings: '#1E293B',
    textBody: '#475569',
  };

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const cardBg = isDark ? '#1F2937' : '#F3F4F6';

  const airtimeAmounts = ['₦100', '₦200', '₦500', '₦1000', '₦2000', '₦5000'];

  const dataPlans = [
  ];

  // Dashboard data plans (fetched)
  const [dashPlans, setDashPlans] = useState<Array<{ label: string; price: number; duration: string }>>([]);
  const [dashPlansLoading, setDashPlansLoading] = useState(false);
  const [dashPlansError, setDashPlansError] = useState<string | null>(null);

  const loadRecentTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await transactionService.getTransactions(1, 5);
      if (response.success && response.data && Array.isArray(response.data.transactions)) {
        const mapped = response.data.transactions.map(mapApiTransactionToLocal);
        setRecentTransactions(mapped);
      } else {
        setRecentTransactions([]);
      }
    } catch (error) {
      console.log('Error loading recent transactions:', error);
      setRecentTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const mapApiTransactionToLocal = (transaction: ApiTransaction) => {
    const date = new Date(transaction.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let dateString = '';
    if (date.toDateString() === today.toDateString()) {
      dateString = `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateString = `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return {
      id: transaction._id,
      name: formatTransactionType(transaction.type),
      amount: `₦${transaction.amount.toLocaleString()}`,
      status: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
      date: dateString,
      bgColor: getTransactionColor(transaction.type),
    };
  };

  const formatTransactionType = (type: string) =>
    type.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'airtime_topup': return '#FFCB05';
      case 'data_purchase': return '#EF4444';
      case 'bill_payment': return '#2563EB';
      case 'wallet_topup': return '#10B981';
      default: return '#6B7280';
    }
  };


  const selectContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        try {
          const contact = await Contacts.presentContactPickerAsync();
          if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            let number = contact.phoneNumbers[0].number;
            if (number) {
              number = number.replace(/\D/g, '');
              if (number.startsWith('234')) number = '0' + number.slice(3);
              if (number.length === 13 && number.startsWith('234')) number = '0' + number.slice(3);
              setPhoneNumber(number);
            }
          }
        } catch (err) {
          console.log(err);
          // Silent fail or simple log
        }
      } else {
        Alert.alert('Info', 'No contacts found');
      }
    } else {
      const { status: currentStatus, canAskAgain } = await Contacts.getPermissionsAsync();
      if (!canAskAgain && currentStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'You have denied contact access. Please enable it in your phone settings to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      } else {
        Alert.alert('Permission Denied', 'Permission to access contacts was denied. We need this to help you select phone numbers easily.');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const operators = ['MTN', 'Airtel', 'Glo', '9mobile', 'DSTV', 'GoTV'];

  const handleQuickProceed = () => {
    if (selectedTab !== 'airtime') {
      Alert.alert('Info', 'Quick Top-up proceed currently supports Airtime.');
      return;
    }
    const amountLabel = selectedAirtimeIndex !== null ? airtimeAmounts[selectedAirtimeIndex] : '';
    const amount = amountLabel.replace(/[^\d]/g, '');
    if (!phoneNumber || !amount) {
      Alert.alert('Missing info', 'Enter phone number and select an amount.');
      return;
    }
    router.push({
      pathname: '/buy-airtime',
      params: { phone: phoneNumber, amount },
    } as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.profilePic}
            onPress={() => router.push('/profile')}
          >
            <Image
              source={{ uri: profileData?.profileImage || 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View>
            <Text style={[styles.welcomeLabel, { color: textBodyColor }]}>
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'} 👋
            </Text>
            <Text style={[styles.welcomeText, { color: textColor }]}>{profileData?.firstName || 'Guest'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push('/help-support')}
          >
            <Ionicons name="help-circle-outline" size={20} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={textColor} />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: textBodyColor }]}>Loading...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        >
          {/* Wallet Balance Card */}
          <View style={styles.balanceCardContainer}>
            <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Your Balance</Text>
                <TouchableOpacity
                  style={styles.hideButton}
                  onPress={() => setIsBalanceHidden(!isBalanceHidden)}
                >
                  <Ionicons
                    name={isBalanceHidden ? "eye-outline" : "eye-off-outline"}
                    size={16}
                    color="#D1D5DB"
                  />
                  <Text style={styles.hideText}>{isBalanceHidden ? 'Show' : 'Hide'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.balanceAmount}>
                {isBalanceHidden ? '₦••••••' : formatCurrency(wallet?.balance || 0)}
              </Text>
              <TouchableOpacity
                style={[styles.addMoneyBtn, { backgroundColor: '#FFFFFF' }]}
                onPress={() => router.push('/add-money')}
              >
                <Ionicons name="add" size={20} color={theme.primary} />
                <Text style={[styles.addMoneyText, { color: theme.primary }]}>Add Money</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/buy-airtime')}>
              <View style={[styles.actionIcon, { backgroundColor: cardBg }]}>
                <Ionicons name="call" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.actionTextSmall, { color: textColor }]}>Airtime</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/buy-data')}>
              <View style={[styles.actionIcon, { backgroundColor: cardBg }]}>
                <Ionicons name="wifi" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.actionTextSmall, { color: textColor }]}>Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/wallet')}>
              <View style={[styles.actionIcon, { backgroundColor: cardBg }]}>
                <Ionicons name="wallet" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.actionTextSmall, { color: textColor }]}>Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/referrals')}>
              <View style={[styles.actionIcon, { backgroundColor: cardBg }]}>
                <Ionicons name="gift" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.actionTextSmall, { color: textColor }]}>Referral</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => router.push('/transactions')}>
                <Text style={[styles.seeAllText, { color: theme.accent }]}>See All</Text>
              </TouchableOpacity>
            </View>

            {transactionsLoading ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 20 }} />
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <TouchableOpacity
                  key={tx.id}
                  style={[styles.transactionItem, { backgroundColor: cardBg }]}
                  onPress={() => router.push('/transactions')}
                >
                  <View style={[styles.txIcon, { backgroundColor: tx.bgColor + '20' }]}>
                    <Ionicons 
                      name={tx.name.toLowerCase().includes('topup') || tx.name.toLowerCase().includes('wallet') ? 'add' : 'remove'} 
                      size={20} 
                      color={tx.bgColor} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txName, { color: textColor }]}>{tx.name}</Text>
                    <Text style={[styles.txDate, { color: textBodyColor }]}>{tx.date}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txAmount, { color: textColor }]}>
                      {tx.name.toLowerCase().includes('topup') || tx.name.toLowerCase().includes('wallet') ? '+' : '-'}{tx.amount}
                    </Text>
                    <Text style={[styles.txStatus, { 
                      color: tx.status === 'Successful' ? '#10B981' : tx.status === 'Failed' ? '#EF4444' : '#FF9F43' 
                    }]}>
                      {tx.status}
                    </Text>
                  </View>

                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.emptyTx, { backgroundColor: cardBg }]}>
                <Text style={{ color: textBodyColor }}>No transactions yet</Text>
              </View>
            )}
          </View>


          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  transactionsSection: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txName: {
    fontSize: 14,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txStatus: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  emptyTx: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Keep original styles for others
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profilePic: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  welcomeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  notificationBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  balanceCardContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  hideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hideText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  addMoneyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionTextLarge: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  formContainer: {
    gap: 12,
  },
  inputIcon: {
    marginLeft: 8,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  planLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  planDuration: {
    fontSize: 10,
  },
  proceedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
