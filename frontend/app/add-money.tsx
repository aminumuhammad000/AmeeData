import { useAlert } from '@/components/AlertContext';
import { payrantService, VirtualAccountResponse } from '@/services/payrant.service';
import { vtstackService, VirtualAccount as VTStackAccount } from '@/services/vtstack.service';
import { walletService } from '@/services/wallet.service';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

// Constants
const THEME = {
  primary: '#0A2540',
  success: '#00D4AA',
  error: '#FF5B5B',
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textMuted: '#9CA3AF',
    border: '#374151',
  },
  light: {
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  }
};

export default function AddMoneyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showSuccess, showError, showInfo } = useAlert();
  const theme = isDark ? THEME.dark : THEME.light;

  const [payrantAccount, setPayrantAccount] = useState<VirtualAccountResponse | null>(null);
  const [vtstackAccounts, setVtstackAccounts] = useState<VTStackAccount[]>([]);
  const [gateway, setGateway] = useState<string>('both');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [payrantRes, vtstackRes, settingsRes] = await Promise.all([
        payrantService.getVirtualAccount().catch(() => null),
        vtstackService.getMyAccounts().catch(() => ({ success: false, data: [] })),
        walletService.getGatewaySettings().catch(() => ({ success: true, data: { gateway: 'both' } }))
      ]);

      if (payrantRes && typeof payrantRes === 'object') {
        if ('account_number' in payrantRes) {
          setPayrantAccount(payrantRes as VirtualAccountResponse);
        } else if ('exists' in payrantRes && payrantRes.exists === false) {
          setPayrantAccount(null);
        } else if ('data' in payrantRes && payrantRes.data) {
           // Handle case where it might be wrapped in data
           const possibleAccount = (payrantRes as any).data;
           if (possibleAccount && 'account_number' in possibleAccount) {
             setPayrantAccount(possibleAccount as VirtualAccountResponse);
           }
        }
      }

      if (vtstackRes && vtstackRes.success) {
        // Handle case where data might be nested or an array of arrays
        let accounts = vtstackRes.data;
        if (Array.isArray(accounts) && accounts.length > 0 && Array.isArray(accounts[0])) {
          accounts = accounts[0];
        }
        setVtstackAccounts(Array.isArray(accounts) ? accounts : []);
      }

      if (settingsRes && settingsRes.success && settingsRes.data) {
        setGateway(settingsRes.data.gateway);
      }
    } catch (error: any) {
      console.error('Load data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateAccount = async () => {
    try {
      setCreatingAccount(true);
      // Generate random 11-digit number starting with 22
      const generatedBvn = '22' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');

      const res = await vtstackService.createAccount(generatedBvn);
      if (res.success) {
        showSuccess('Virtual account created successfully');
        loadData();
      }
    } catch (error: any) {
      showError(error.message || 'Failed to create account');
    } finally {
      setCreatingAccount(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    showInfo('Copied to clipboard!');
  };

  const renderAccountCard = (item: any, providerLabel: string) => {
    const accountNumber = item.account_number || item.accountNumber || item.virtualAccountNo;
    const accountName = item.account_name || item.accountName || item.virtualAccountName;
    const bankName = item.bank_name || item.bankName || 'VIRTUAL BANK';

    if (!accountNumber) return null;

    return (
      <View style={[styles.accountCard, { backgroundColor: providerLabel === 'Payrant' ? THEME.primary : '#6366F1' }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.bankName}>{bankName.toUpperCase()}</Text>
          <View style={styles.chip} />
        </View>

        <View style={styles.accountBody}>
          <Text style={styles.accountLabel}>Account Number</Text>
          <View style={styles.accountRow}>
            <Text style={styles.accountNumber}>{accountNumber}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(accountNumber)}>
              <Ionicons name="copy-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.accountOwner}>{accountName}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Ionicons name="shield-checkmark" size={14} color={THEME.success} />
          <Text style={styles.secureText}>Protected by {providerLabel}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Fund Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={THEME.primary} />
          <Text style={styles.infoBannerText}>
            Transfer money to your dedicated account below to instantly fund your wallet.
          </Text>
        </View>

        {/* Accounts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Virtual Account</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={THEME.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View>
              {(gateway === 'payrant' || gateway === 'both') && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={[styles.providerSubTitle, { color: theme.textMuted }]}>Payrant Accounts</Text>
                  {payrantAccount ? (
                    renderAccountCard(payrantAccount, 'Payrant')
                  ) : (
                    <View style={[styles.emptyStateTiny, { backgroundColor: theme.card }]}>
                      <Text style={[styles.emptyTextTiny, { color: theme.text }]}>No Payrant account found</Text>
                    </View>
                  )}
                </View>
              )}

              {(gateway === 'vtstack' || gateway === 'both') && (
                <View>
                  <Text style={[styles.providerSubTitle, { color: theme.textMuted }]}>VTStack Accounts</Text>
                  {vtstackAccounts.length > 0 ? (
                    vtstackAccounts.map((acc, index) => (
                      <View key={index} style={{ marginBottom: 12 }}>
                        {renderAccountCard(acc, 'VTStack')}
                      </View>
                    ))
                  ) : (
                    <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                      <Ionicons name="wallet-outline" size={48} color={theme.textMuted} />
                      <Text style={[styles.emptyText, { color: theme.text }]}>No VTStack account found</Text>
                      <TouchableOpacity
                        style={[styles.createBtn, { backgroundColor: THEME.primary }]}
                        onPress={handleCreateAccount}
                        disabled={creatingAccount}
                      >
                        {creatingAccount ? (
                          <ActivityIndicator color="#FFF" />
                        ) : (
                          <Text style={styles.createBtnText}>Generate VTStack Account</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {gateway === 'none' && (
                <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                  <Text style={[styles.emptyText, { color: theme.text }]}>Virtual accounts are currently disabled by admin.</Text>
                </View>
              )}
            </View>
          )}
        </View>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  infoBannerText: {
    color: '#2C5282',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  accountCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bankName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    opacity: 0.9,
  },
  chip: {
    width: 36,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
  },
  accountBody: {
    marginBottom: 24,
  },
  accountLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accountNumber: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 2,
  },
  accountOwner: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  secureText: {
    color: '#00D4AA',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    marginBottom: 24,
  },
  createBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  providerSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  emptyStateTiny: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyTextTiny: {
    fontSize: 12,
    opacity: 0.7,
  },
});