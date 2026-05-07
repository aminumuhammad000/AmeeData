import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedTab, setSelectedTab] = useState<'airtime' | 'data'>('airtime');
  const [phoneNumber, setPhoneNumber] = useState('');

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

  const recentTransactions = [
    {
      id: 1,
      name: 'MTN Airtime Top-up',
      phone: '08012345678',
      amount: '-₦500.00',
      status: 'Successful',
      logo: 'https://cdn.jsdelivr.net/gh/madebybowtie/FlagKit@2.2/Assets/SVG/NG.svg',
      bgColor: '#FFCB05',
    },
    {
      id: 2,
      name: 'Airtel Data',
      phone: '09087654321',
      amount: '-₦1,500.00',
      status: 'Successful',
      logo: 'https://cdn.jsdelivr.net/gh/madebybowtie/FlagKit@2.2/Assets/SVG/NG.svg',
      bgColor: '#EF4444',
    },
    {
      id: 3,
      name: 'DSTV Subscription',
      phone: '1234567890',
      amount: '-₦4,500.00',
      status: 'Failed',
      logo: 'https://cdn.jsdelivr.net/gh/madebybowtie/FlagKit@2.2/Assets/SVG/NG.svg',
      bgColor: '#2563EB',
    },
  ];


  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <View style={styles.headerLeft}>
          <View style={styles.profilePic}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
          </View>
          <Text style={[styles.welcomeText, { color: textColor }]}>Welcome, David</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Wallet Balance Card */}
        <View style={styles.balanceCardContainer}>
          <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Your Balance</Text>
              <TouchableOpacity style={styles.hideButton}>
                <Ionicons name="eye-off-outline" size={16} color="#D1D5DB" />
                <Text style={styles.hideText}>Hide</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>₦50,000.00</Text>
            <TouchableOpacity style={[styles.addMoneyBtn, { backgroundColor: theme.accent }]}>
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
            <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(10, 37, 64, 0.3)' : 'rgba(10, 37, 64, 0.2)' }]}>
              <Ionicons name="phone-portrait-outline" size={24} color={isDark ? '#FFFFFF' : theme.primary} />
            </View>
            <Text style={[styles.actionText, { color: textBodyColor }]}>Buy Airtime</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/buy-data')}
          >
            <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(10, 37, 64, 0.3)' : 'rgba(10, 37, 64, 0.2)' }]}>
              <Ionicons name="wifi-outline" size={24} color={isDark ? '#FFFFFF' : theme.primary} />
            </View>
            <Text style={[styles.actionText, { color: textBodyColor }]}>Buy Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/buy-electricity')}
          >
            <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(10, 37, 64, 0.3)' : 'rgba(10, 37, 64, 0.2)' }]}>
              <Ionicons name="flash-outline" size={24} color={isDark ? '#FFFFFF' : theme.primary} />
            </View>
            <Text style={[styles.actionText, { color: textBodyColor }]}>Electricity</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/more')}
          >
            <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(10, 37, 64, 0.3)' : 'rgba(10, 37, 64, 0.2)' }]}>
              <Ionicons name="grid-outline" size={24} color={isDark ? '#FFFFFF' : theme.primary} />
            </View>
            <Text style={[styles.actionText, { color: textBodyColor }]}>More</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Top-up Form */}
        <View style={styles.topupSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Top-up</Text>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'airtime' && styles.activeTab]}
              onPress={() => setSelectedTab('airtime')}
            >
              <Text style={[styles.tabText, selectedTab === 'airtime' && { color: isDark ? '#FFFFFF' : theme.primary }]}>
                Airtime
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'data' && styles.activeTab]}
              onPress={() => setSelectedTab('data')}
            >
              <Text style={[styles.tabText, selectedTab === 'data' && { color: isDark ? '#FFFFFF' : theme.primary }]}>
                Data
              </Text>
            </TouchableOpacity>
          </View>

          {/* Phone Input */}
          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: cardBg }]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Phone Number"
                placeholderTextColor={textBodyColor}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              <Ionicons name="call-outline" size={20} color={textBodyColor} style={styles.inputIcon} />
            </View>

            {/* Amount Buttons */}
            <View style={styles.amountGrid}>
              {airtimeAmounts.map((amount, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.amountBtn, {
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                    backgroundColor: 'transparent'
                  }]}
                >
                  <Text style={[styles.amountText, { color: textColor }]}>{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Proceed Button */}
            <TouchableOpacity style={[styles.proceedBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.proceedText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={{ color: isDark ? theme.accent : theme.primary, fontSize: 14, fontWeight: '500' }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: cardBg }]}>
                <View style={[styles.transactionLogo, { backgroundColor: transaction.bgColor }]}>
                  <View style={styles.logoPlaceholder} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionName, { color: textColor }]}>{transaction.name}</Text>
                  <Text style={[styles.transactionPhone, { color: textBodyColor }]}>{transaction.phone}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, { color: textColor }]}>{transaction.amount}</Text>
                  <Text style={[
                    styles.transactionStatus,
                    { color: transaction.status === 'Successful' ? '#10B981' : '#EF4444' }
                  ]}>
                    {transaction.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, {
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        borderTopColor: isDark ? '#374151' : '#E5E7EB'
      }]}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={isDark ? theme.accent : theme.primary} />
          <Text style={[styles.navText, { color: isDark ? theme.accent : theme.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time-outline" size={24} color={textBodyColor} />
          <Text style={[styles.navText, { color: textBodyColor }]}>Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color={textBodyColor} />
          <Text style={[styles.navText, { color: textBodyColor }]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="headset-outline" size={24} color={textBodyColor} />
          <Text style={[styles.navText, { color: textBodyColor }]}>Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  notificationBtn: {
    padding: 8,
  },
  balanceCardContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  balanceCard: {
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  hideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hideText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  addMoneyText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  topupSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 32,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0A2540',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputIcon: {
    marginLeft: 8,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountBtn: {
    width: '30%',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  proceedBtn: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  proceedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  recentSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 16,
  },
  transactionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionPhone: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 14,
  },
  operatorsSection: {
    marginTop: 32,
  },
  operatorsList: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  operatorItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  operatorLogoPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
