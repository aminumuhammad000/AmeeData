import { useTheme } from '@/components/ThemeContext';
import { authService } from '@/services/auth.service';
import { billPaymentService } from '@/services/billpayment.service';
import * as Contacts from 'expo-contacts';

import { userService } from '@/services/user.service';
import { WalletData, walletService } from '@/services/wallet.service';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
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
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pinPrompted, setPinPrompted] = useState(false);

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
        loadDashPlans(),
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



  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

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
  const cardBg = isDark ? '#1F2937' : '#F3F4F6';

  const airtimeAmounts = ['₦100', '₦200', '₦500', '₦1000', '₦2000', '₦5000'];

  const dataPlans = [
  ];

  // Dashboard data plans (fetched)
  const [dashPlans, setDashPlans] = useState<Array<{ label: string; price: number; duration: string }>>([]);
  const [dashPlansLoading, setDashPlansLoading] = useState(false);
  const [dashPlansError, setDashPlansError] = useState<string | null>(null);

  const loadDashPlans = async () => {
    try {
      setDashPlansLoading(true);
      setDashPlansError(null);
      const res = await billPaymentService.getDataPlans(); // no network => fetch all
      if (res?.success && Array.isArray(res.data)) {
        const mapped = res.data.map((p: any) => ({
          label: p.plan_name || p.data_value || p.name || 'Plan',
          price: Number(p.price || p.amount || 0),
          duration: p.validity || p.duration || '',
        })).slice(0, 6);
        setDashPlans(mapped);
      } else {
        setDashPlans([]);
      }
    } catch (e: any) {
      setDashPlansError(e?.message || 'Failed to load plans');
      setDashPlans([]);
    } finally {
      setDashPlansLoading(false);
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
              source={{ uri: user?.profile_picture || 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View>
            <Text style={[styles.welcomeLabel, { color: textBodyColor }]}>Good Morning 👋</Text>
            <Text style={[styles.welcomeText, { color: textColor }]}>{user?.first_name || 'Guest'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={textColor} />
        </TouchableOpacity>
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
                style={[styles.addMoneyBtn, { backgroundColor: theme.accent }]}
                onPress={() => router.push('/add-money')}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addMoneyText}>Add Money</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/buy-airtime')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF' }]}>
                <Ionicons name="phone-portrait" size={24} color="#4F46E5" />
              </View>
              <Text style={[styles.actionText, { color: textBodyColor }]}>Buy Airtime</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/buy-data')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
                <Ionicons name="wifi" size={24} color="#10B981" />
              </View>
              <Text style={[styles.actionText, { color: textBodyColor }]}>Buy Data</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/airtime-to-cash')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.2)' : '#FCE7F3' }]}>
                <Ionicons name="cash-outline" size={24} color="#EC4899" />
              </View>
              <Text style={[styles.actionText, { color: textBodyColor }]}>Airtime 2 Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/more')}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EBF5FF' }]}>
                <Ionicons name="grid-outline" size={24} color="#2563EB" />
              </View>
              <Text style={[styles.actionText, { color: textBodyColor }]}>More</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Top-up Form - Enclosed in Card */}
          <View style={[styles.topupCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 16 }]}>Quick Top-up ⚡</Text>

            {/* Tabs */}
            <View style={[styles.segmentContainer, { backgroundColor: isDark ? '#111827' : '#F3F4F6' }]}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  selectedTab === 'airtime' && { backgroundColor: theme.primary }
                ]}
                onPress={() => setSelectedTab('airtime')}
              >
                <Text style={[
                  styles.segmentText,
                  { color: selectedTab === 'airtime' ? '#FFF' : textBodyColor }
                ]}>
                  Airtime
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  selectedTab === 'data' && { backgroundColor: theme.primary }
                ]}
                onPress={() => setSelectedTab('data')}
              >
                <Text style={[
                  styles.segmentText,
                  { color: selectedTab === 'data' ? '#FFF' : textBodyColor }
                ]}>
                  Data
                </Text>
              </TouchableOpacity>
            </View>

            {/* Phone Input */}
            <View style={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: textBodyColor }]}>Phone Number</Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#374151' : '#F9FAFB', borderColor: isDark ? '#4B5563' : '#E5E7EB', borderWidth: 1 }]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="080 1234 5678"
                  placeholderTextColor={textBodyColor}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity onPress={selectContact}>
                  <Ionicons name="people" size={20} color={theme.accent} style={styles.inputIcon} />
                </TouchableOpacity>
              </View>

              {/* Amount Buttons */}
              <Text style={[styles.inputLabel, { color: textBodyColor, marginTop: 8 }]}>Select Amount</Text>
              <View style={styles.amountGrid}>
                {selectedTab === 'airtime' ? (
                  airtimeAmounts.map((amount, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.amountBtn,
                        {
                          backgroundColor: selectedAirtimeIndex === index
                            ? theme.primary
                            : (isDark ? '#374151' : '#fff'),
                          borderColor: selectedAirtimeIndex === index ? theme.primary : (isDark ? '#4B5563' : '#E5E7EB'),
                          borderWidth: 1
                        }
                      ]}
                      onPress={() => setSelectedAirtimeIndex(index)}
                    >
                      <Text style={[
                        styles.amountText,
                        {
                          color: selectedAirtimeIndex === index
                            ? '#FFFFFF'
                            : textColor,
                          fontSize: 14
                        }
                      ]}>
                        {amount}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  (dashPlans.length ? dashPlans : []).map((plan, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dataPlanBtn,
                        {
                          backgroundColor: selectedDataIndex === index
                            ? theme.primary
                            : (isDark ? '#374151' : '#fff'),
                          borderColor: selectedDataIndex === index ? theme.primary : (isDark ? '#4B5563' : '#E5E7EB'),
                          borderWidth: 1
                        }
                      ]}
                      onPress={() => setSelectedDataIndex(index)}
                    >
                      <Text style={[
                        styles.planLabel,
                        {
                          color: selectedDataIndex === index
                            ? '#FFFFFF'
                            : textColor
                        }
                      ]}>
                        {plan.label}
                      </Text>
                      <Text style={[
                        styles.planPrice,
                        {
                          color: selectedDataIndex === index
                            ? '#FFFFFF'
                            : theme.accent
                        }
                      ]}>
                        ₦{Number(plan.price || 0).toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Proceed Button */}
              <TouchableOpacity
                style={[styles.proceedBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
                onPress={handleQuickProceed}
              >
                <Text style={styles.proceedText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topupCard: {
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  welcomeLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  amountBtn: {
    width: '30%',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataPlanBtn: {
    width: '30%',
    minHeight: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
  },
  proceedBtn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
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
    width: 45,
    height: 45,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  notificationBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  balanceCardContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
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
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
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
    fontSize: 14,
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
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
