import { useAlert } from '@/components/AlertContext';
import { useTheme } from '@/components/ThemeContext';
import { walletService as walletDataService } from '@/services/wallet.service';
import { authService } from '@/services/auth.service';
import { payrantService, VirtualAccountResponse } from '@/services/payrant.service';
import { vtstackService } from '@/services/vtstack.service';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native';

const THEME_COLORS = {
    primary: '#6C2BD9',
    accent: '#FF9F43',
    success: '#00D4AA',
    error: '#FF5B5B',
};

export default function WalletTab() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { showSuccess, showError, showInfo } = useAlert();

    const [account, setAccount] = useState<VirtualAccountResponse | any | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [gateway, setGateway] = useState<'payrant' | 'vtstack'>('vtstack');
    const [wallet, setWallet] = useState<any>(null);

    const bgColor = isDark ? '#111921' : '#F8F9FA';
    const cardBg = isDark ? '#1F2937' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1E293B';
    const textBodyColor = isDark ? '#9CA3AF' : '#475569';
    const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch wallet balance
            const walletRes = await walletDataService.getWallet();
            if (walletRes.success) {
                setWallet(walletRes.data);
            }

            // Fetch active gateway
            const gatewayRes = await walletDataService.getGatewaySettings();
            const activeGateway = gatewayRes.data.data?.gateway as 'payrant' | 'vtstack' || 'vtstack';
            setGateway(activeGateway);

            if (activeGateway === 'payrant') {
                const accountsRes = await payrantService.getVirtualAccount();
                if (accountsRes && 'account_number' in accountsRes) {
                    setAccount(accountsRes as VirtualAccountResponse);
                }
            } else if (activeGateway === 'vtstack') {
                const vtRes = await vtstackService.getMyAccounts();
                if (vtRes.success && vtRes.data.length > 0) {
                    const acc = vtRes.data[0];
                    setAccount({
                        account_number: acc.accountNumber,
                        account_name: acc.accountName,
                        bank_name: acc.bankName,
                        account_reference: acc.reference,
                        provider: 'vtstack',
                        status: acc.status
                    });
                } else {
                    setAccount(null);
                }
            }
        } catch (error: any) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        showInfo('Copied to clipboard!');
    };

    const handleCreateAccount = async () => {
        try {
            setCreatingAccount(true);
            const user = await authService.getCurrentUser();
            if (!user) throw new Error('User not found');

            if (gateway === 'payrant') {
                const accountData = {
                    documentType: 'nin',
                    documentNumber: user?.phone_number || '',
                    virtualAccountName: `${user?.first_name} ${user?.last_name}`,
                    customerName: `${user?.first_name} ${user?.last_name}`,
                    email: user?.email || '',
                    accountReference: `REF-${Date.now()}`
                };

                const res = await payrantService.createVirtualAccount(accountData);
                if (res) {
                    setAccount(res);
                    showSuccess('Virtual account created successfully');
                    onRefresh();
                }
            } else if (gateway === 'vtstack') {
                // Generate random 11-digit number starting with 22
                const generatedBvn = '22' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
                const res = await vtstackService.createAccount(generatedBvn);
                if (res.success) {
                    showSuccess('Virtual account created successfully');
                    onRefresh();
                }
            }
        } catch (error: any) {
            showError(error.message || 'Failed to create account');
        } finally {
            setCreatingAccount(false);
        }
    };

    const menuItems = [
        {
            icon: 'add-circle-outline',
            label: 'Add Money',
            sublabel: 'Fund your wallet via card or transfer',
            route: '/add-money',
            color: THEME_COLORS.primary
        },
        {
            icon: 'card-outline',
            label: 'Payment Methods',
            sublabel: 'Manage your saved cards and banks',
            route: '/payment-methods',
            color: '#6C2BD9'
        },
        {
            icon: 'lock-closed-outline',
            label: 'Transaction PIN',
            sublabel: 'Secure your wallet with a 4-digit PIN',
            route: '/security',
            color: '#8B5CF6'
        },
        {
            icon: 'list-outline',
            label: 'Transaction History',
            sublabel: 'View all your recent transactions',
            route: '/(tabs)/transactions',
            color: '#10B981'
        }
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: bgColor }]}>
                <Text style={[styles.headerTitle, { color: textColor }]}>My Wallet</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLORS.primary} />}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Balance Card */}
                <View style={[styles.balanceCard, { backgroundColor: THEME_COLORS.primary }]}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>₦{wallet?.balance?.toLocaleString() || '0.00'}</Text>
                    <View style={styles.balanceFooter}>
                        <View style={styles.balanceInfo}>
                            <Text style={styles.infoLabel}>Bonus Balance</Text>
                            <Text style={styles.infoValue}>₦{wallet?.bonus_balance?.toLocaleString() || '0.00'}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.addBtn}
                            onPress={() => router.push('/add-money')}
                        >
                            <Ionicons name="add" size={20} color={THEME_COLORS.primary} />
                            <Text style={styles.addBtnText}>Add Money</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Virtual Account Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textBodyColor }]}>Dedicated Funding Account</Text>

                    {loading && !account ? (
                        <View style={[styles.loadingCard, { backgroundColor: cardBg, borderColor }]}>
                            <ActivityIndicator color={THEME_COLORS.primary} />
                        </View>
                    ) : account ? (
                        <View style={[styles.accountCard, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.bankName, { color: textColor }]}>{account.bank_name?.toUpperCase() || 'PALMPAY'}</Text>
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                                    <Text style={styles.verifiedText}>Automated</Text>
                                </View>
                            </View>

                            <View style={styles.accountBody}>
                                <Text style={[styles.accountLabel, { color: textBodyColor }]}>Account Number</Text>
                                <View style={styles.accountRow}>
                                    <Text style={[styles.accountNumber, { color: textColor }]}>{account.account_number}</Text>
                                    <TouchableOpacity onPress={() => copyToClipboard(account.account_number)} style={styles.copyIconButton}>
                                        <Ionicons name="copy-outline" size={20} color={THEME_COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.accountOwner, { color: textColor }]}>{account.account_name}</Text>
                            </View>

                            <View style={styles.cardFooter}>
                                <Ionicons name="information-circle-outline" size={16} color={textBodyColor} />
                                <Text style={[styles.secureText, { color: textBodyColor }]}>Instant credit upon transfer.</Text>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.emptyAccountGrid, { backgroundColor: cardBg, borderColor, borderStyle: 'dashed' }]}
                            onPress={handleCreateAccount}
                            disabled={creatingAccount}
                        >
                            {creatingAccount ? (
                                <ActivityIndicator color={THEME_COLORS.primary} />
                            ) : (
                                <>
                                    <View style={styles.addIconCircle}>
                                        <Ionicons name="add" size={32} color={THEME_COLORS.primary} />
                                    </View>
                                    <Text style={[styles.emptyAccountText, { color: textColor }]}>Generate Dedicated Account</Text>
                                    <Text style={[styles.emptyAccountSubtext, { color: textBodyColor }]}>For faster and automated funding</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Management Options */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textBodyColor }]}>Wallet Management</Text>
                    <View style={[styles.menuCard, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.menuItem,
                                    index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                                ]}
                                onPress={() => router.push(item.route as any)}
                            >
                                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                                </View>
                                <View style={styles.menuText}>
                                    <Text style={[styles.menuLabel, { color: textColor }]}>{item.label}</Text>
                                    <Text style={[styles.menuSublabel, { color: textBodyColor }]}>{item.sublabel}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={textBodyColor} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: { fontSize: 24, fontWeight: '800' },
    scrollContent: { padding: 20 },
    balanceCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#6C2BD9',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
    balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: '800', marginBottom: 24 },
    balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    balanceInfo: { },
    infoLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 2 },
    infoValue: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    addBtn: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 4
    },
    addBtnText: { color: '#6C2BD9', fontWeight: '700', fontSize: 14 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    loadingCard: { height: 160, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    accountCard: {
        borderRadius: 20,
        padding: 20,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    bankName: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
    verifiedBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#10B981', 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 8,
        gap: 4
    },
    verifiedText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    accountBody: { marginBottom: 16 },
    accountLabel: { fontSize: 11, marginBottom: 4, fontWeight: '600' },
    accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    accountNumber: { fontSize: 24, fontWeight: '800', letterSpacing: 1 },
    copyIconButton: { padding: 4 },
    accountOwner: { fontSize: 14, fontWeight: '600' },
    cardFooter: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12
    },
    secureText: { fontSize: 11, fontStyle: 'italic' },
    emptyAccountGrid: { height: 160, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 8 },
    addIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(108, 43, 217, 0.1)', justifyContent: 'center', alignItems: 'center' },
    emptyAccountText: { fontSize: 16, fontWeight: '700' },
    emptyAccountSubtext: { fontSize: 12 },
    menuCard: { borderRadius: 20, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuText: { flex: 1 },
    menuLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    menuSublabel: { fontSize: 12 },
});
