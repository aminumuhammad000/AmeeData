import { useAlert } from '@/components/AlertContext';
import { referralService, ReferralSetting, ReferralStats } from '@/services/referral.service';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

export default function ReferralsScreen() {
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [settings, setSettings] = useState<ReferralSetting | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { showSuccess, showError } = useAlert();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const theme = {
        primary: '#6C2BD9',
        accent: '#FF9F43',
        success: '#00D4AA',
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
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsRes, settingsRes] = await Promise.all([
                referralService.getStats(),
                referralService.getSettings()
            ]);
            if (statsRes?.data) setStats(statsRes.data);
            if (settingsRes?.data) setSettings(settingsRes.data);
        } catch (error: any) {
            showError(error.message || 'Failed to load referral data');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (stats?.referral_code) {
            await Clipboard.setStringAsync(stats.referral_code);
            showSuccess('Referral code copied to clipboard');
        }
    };

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: `Join me on AmeeData and earn ₦${settings?.referrer_bonus_amount || '...'} bonus! Use my referral code: ${stats?.referral_code}. Download Now: https://app.ameedata.com.ng`,
            });
        } catch (error: any) {
            showError(error.message);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: bgColor, flexDirection: 'row', alignItems: 'center' }]}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Refer & Earn</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Banner Card */}
                <View style={[styles.bannerCard, { backgroundColor: theme.primary }]}>
                    <View style={styles.bannerInfo}>
                        <Text style={styles.bannerTitle}>Earn ₦{settings?.referrer_bonus_amount?.toLocaleString() ?? '...'} per friend</Text>
                        <Text style={styles.bannerSubtitle}>
                            Invite your friends to AmeeData and earn a bonus when they make their first transaction of ₦{settings?.min_transaction_for_bonus?.toLocaleString() ?? '...'} or more.
                        </Text>
                    </View>
                    <View style={styles.bannerIconContainer}>
                        <Ionicons name="gift" size={64} color={theme.accent} />
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                        <Text style={[styles.statLabel, { color: textBodyColor }]}>Total Referrals</Text>
                        <Text style={[styles.statValue, { color: textColor }]}>{stats?.referral_count || 0}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                        <Text style={[styles.statLabel, { color: textBodyColor }]}>Total Earnings</Text>
                        <Text style={[styles.statValue, { color: theme.success }]}>₦{stats?.total_earnings?.toLocaleString() || 0}</Text>
                    </View>
                </View>

                {/* Code Section */}
                <View style={[styles.codeSection, { backgroundColor: cardBg }]}>
                    <Text style={[styles.codeLabel, { color: textBodyColor }]}>Your Referral Code</Text>
                    <View style={[styles.codeContainer, { backgroundColor: isDark ? '#111827' : '#F3F4F6' }]}>
                        <Text style={[styles.referralCode, { color: textColor }]}>{stats?.referral_code}</Text>
                        <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
                            <Ionicons name="copy-outline" size={20} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.shareBtn, { backgroundColor: theme.primary }]} onPress={onShare}>
                        <Ionicons name="share-social-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.shareBtnText}>Share Invite Link</Text>
                    </TouchableOpacity>
                </View>

                {/* Referrals List */}
                <View style={styles.referralListSection}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>My Referrals</Text>
                    {stats?.referrals && stats.referrals.length > 0 ? (
                        stats.referrals.map((item, index) => (
                            <View key={index} style={[styles.referralItem, { backgroundColor: cardBg }]}>
                                <View style={styles.referralAvatar}>
                                    <Text style={styles.avatarText}>{item.first_name[0]}{item.last_name[0]}</Text>
                                </View>
                                <View style={styles.referralInfo}>
                                    <Text style={[styles.referralName, { color: textColor }]}>{item.first_name} {item.last_name}</Text>
                                    <Text style={[styles.referralDate, { color: textBodyColor }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? 'rgba(0, 212, 170, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                                    <Text style={[styles.statusText, { color: item.status === 'active' ? theme.success : theme.accent }]}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={[styles.emptyState, { backgroundColor: cardBg }]}>
                            <Ionicons name="people-outline" size={48} color={textBodyColor} />
                            <Text style={[styles.emptyStateText, { color: textBodyColor }]}>You haven't referred anyone yet.</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    scrollContent: { padding: 16 },
    bannerCard: {
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    bannerInfo: { flex: 1 },
    bannerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
    bannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 18 },
    bannerIconContainer: { marginLeft: 16 },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
    statLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '800' },
    codeSection: { padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 24 },
    codeLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 20,
        minWidth: 160,
    },
    referralCode: { fontSize: 24, fontWeight: '800', letterSpacing: 4, marginRight: 12 },
    copyBtn: { padding: 4 },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
    },
    shareBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    referralListSection: { gap: 12 },
    referralItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, gap: 12 },
    referralAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF9F4320', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FF9F43', fontWeight: '700', fontSize: 16 },
    referralInfo: { flex: 1 },
    referralName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    referralDate: { fontSize: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '700' },
    emptyState: { padding: 40, borderRadius: 20, alignItems: 'center', gap: 12 },
    emptyStateText: { fontSize: 14, textAlign: 'center' },
});
