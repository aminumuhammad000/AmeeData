import { useAlert } from '@/components/AlertContext';
import { useTheme } from '@/components/ThemeContext';
import { walletService } from '@/services/api';
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
    View
} from 'react-native';

const THEME_COLORS = {
    primary: '#0A2540',
    accent: '#FF9F43',
    success: '#00D4AA',
    error: '#FF5B5B',
};

export default function WalletSettingsScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { showSuccess, showError, showInfo } = useAlert();

    const [account, setAccount] = useState<VirtualAccountResponse | any | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [gateway, setGateway] = useState<'payrant' | 'vtstack'>('vtstack');

    const bgColor = isDark ? '#000000' : '#F8F9FA';
    const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1E293B';
    const textBodyColor = isDark ? '#9CA3AF' : '#475569';
    const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch active gateway
            const gatewayRes = await walletService.getGatewaySettings();
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
        await processAccountCreation();
    };

    const processAccountCreation = async () => {
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
            icon: 'card-outline',
            label: 'Payment Methods',
            sublabel: 'Manage your saved cards and banks',
            route: '/payment-methods',
            color: '#3B82F6'
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
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Wallet Settings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLORS.accent} />}
            >
                {/* Virtual Account Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textBodyColor }]}>Your Dedicated Account</Text>

                    {loading && !account ? (
                        <View style={[styles.loadingCard, { backgroundColor: cardBg, borderColor }]}>
                            <ActivityIndicator color={THEME_COLORS.accent} />
                        </View>
                    ) : account ? (
                        <View style={[styles.accountCard, { backgroundColor: THEME_COLORS.primary }]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.bankName}>{account.bank_name?.toUpperCase() || 'PALMPAY'}</Text>
                                <Ionicons name="shield-checkmark" size={20} color={THEME_COLORS.success} />
                            </View>

                            <View style={styles.accountBody}>
                                <Text style={styles.accountLabel}>Account Number</Text>
                                <View style={styles.accountRow}>
                                    <Text style={styles.accountNumber}>{account.account_number}</Text>
                                    <TouchableOpacity onPress={() => copyToClipboard(account.account_number)}>
                                        <Ionicons name="copy-outline" size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.accountOwner}>{account.account_name}</Text>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={styles.secureText}>Funds sent here are credited instantly to your wallet.</Text>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.emptyAccountGrid, { backgroundColor: cardBg, borderColor, borderStyle: 'dashed' }]}
                            onPress={handleCreateAccount}
                            disabled={creatingAccount}
                        >
                            {creatingAccount ? (
                                <ActivityIndicator color={THEME_COLORS.accent} />
                            ) : (
                                <>
                                    <Ionicons name="add-circle-outline" size={32} color={THEME_COLORS.accent} />
                                    <Text style={[styles.emptyAccountText, { color: textColor }]}>Generate Dedicated Account</Text>
                                    <Text style={[styles.emptyAccountSubtext, { color: textBodyColor }]}>For faster and automated funding</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Menu Items */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textBodyColor }]}>Wallet Management</Text>
                    <View style={[styles.menuCard, { backgroundColor: cardBg, borderColor }]}>
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

                {/* Security Warning */}
                <View style={styles.securityBanner}>
                    <View style={[styles.securityIconBox, { backgroundColor: 'rgba(255, 159, 67, 0.1)' }]}>
                        <Ionicons name="shield-half" size={24} color={THEME_COLORS.accent} />
                    </View>
                    <View style={styles.securityContent}>
                        <Text style={[styles.securityTitle, { color: textColor }]}>Privacy Matters</Text>
                        <Text style={[styles.securityText, { color: textBodyColor }]}>
                            Your account details are protected with bank-grade encryption. Never share your transaction PIN with anyone.
                        </Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    placeholder: { width: 40 },
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    loadingCard: { height: 160, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    accountCard: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    bankName: { color: '#FFF', fontSize: 16, fontWeight: '800', opacity: 0.9, letterSpacing: 1 },
    accountBody: { marginBottom: 20 },
    accountLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
    accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    accountNumber: { color: '#FFF', fontSize: 28, fontWeight: '800', letterSpacing: 2 },
    accountOwner: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginTop: 8 },
    cardFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16 },
    secureText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontStyle: 'italic' },
    emptyAccountGrid: { height: 150, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyAccountText: { fontSize: 16, fontWeight: '700' },
    emptyAccountSubtext: { fontSize: 12 },
    menuCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuText: { flex: 1 },
    menuLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    menuSublabel: { fontSize: 12 },
    securityBanner: {
        flexDirection: 'row',
        margin: 20,
        marginTop: 32,
        padding: 20,
        backgroundColor: 'rgba(255, 159, 67, 0.05)',
        borderRadius: 20,
        gap: 16,
        alignItems: 'center'
    },
    securityIconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    securityContent: { flex: 1 },
    securityTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    securityText: { fontSize: 13, lineHeight: 18 },
});
