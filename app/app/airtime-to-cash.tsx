import { useAlert } from '@/components/AlertContext';
import { airtimeToCashService } from '@/services/airtime_to_cash.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

const theme = {
    primary: '#0A2540',
    accent: '#FF9F43',
    success: '#00D4AA',
    error: '#FF5B5B',
};

export default function AirtimeToCashScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const bgColor = isDark ? '#000000' : '#F9FAFB';
    const cardBgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1F2937';
    const textBodyColor = isDark ? '#D1D5DB' : '#6B7280';
    const borderColor = isDark ? '#374151' : '#E5E7EB';

    const { showError } = useAlert();
    const [amount, setAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [settings, setSettings] = useState<any[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        await Promise.all([loadHistory(), loadSettings()]);
        setIsLoading(false);
    };

    const loadHistory = async () => {
        try {
            const res = await airtimeToCashService.getMyRequests();
            if (res.success) {
                setHistory(res.data);
            }
        } catch (error) {
            console.log('Error loading history:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const res = await airtimeToCashService.getSettings();
            if (res.success) {
                setSettings(res.data);
            }
        } catch (error) {
            console.log('Error loading settings:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleSubmit = async () => {
        if (!selectedNetwork || !phoneNumber || !amount) {
            showError('Please fill all fields');
            return;
        }

        const amt = Number(amount);
        if (amt < selectedNetwork.min_amount || amt > selectedNetwork.max_amount) {
            showError(`Amount must be between ₦${selectedNetwork.min_amount} and ₦${selectedNetwork.max_amount}`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await airtimeToCashService.submitRequest({
                network: selectedNetwork.network,
                phone_number: phoneNumber,
                amount: amt
            });
            if (res.success) {
                setShowSuccessModal(true);
                loadHistory();
            }
        } catch (error: any) {
            showError(error.message || 'Failed to submit request');
        } finally {
            setIsLoading(false);
        }
    };

    const closeSuccess = () => {
        setShowSuccessModal(false);
        setAmount('');
        setPhoneNumber('');
        setSelectedNetwork(null);
    };

    const getNetworkColor = (network: string) => {
        const net = network.toLowerCase();
        if (net.includes('mtn')) return '#FFCC00';
        if (net.includes('glo')) return '#00A95C';
        if (net.includes('airtel')) return '#FF0000';
        if (net.includes('9mobile')) return '#00693E';
        return theme.primary;
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.header, { backgroundColor: cardBgColor }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Airtime to Cash</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
            >

                {/* Network Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Select Network to Send From</Text>
                    <View style={styles.networksGrid}>
                        {settings.map((item) => (
                            <TouchableOpacity
                                key={item._id}
                                style={[
                                    styles.networkCard,
                                    {
                                        backgroundColor: cardBgColor,
                                        borderColor: selectedNetwork?._id === item._id ? getNetworkColor(item.network) : borderColor,
                                        borderWidth: selectedNetwork?._id === item._id ? 2 : 1,
                                    },
                                ]}
                                onPress={() => setSelectedNetwork(item)}
                            >
                                <View style={[styles.networkIcon, { backgroundColor: `${getNetworkColor(item.network)}20` }]}>
                                    <Ionicons name="phone-portrait" size={24} color={getNetworkColor(item.network)} />
                                </View>
                                <Text style={[styles.networkName, { color: textColor }]}>{item.network}</Text>
                                <Text style={{ fontSize: 10, color: textBodyColor }}>{item.conversion_rate}% Rate</Text>
                            </TouchableOpacity>
                        ))}
                        {settings.length === 0 && !isLoading && (
                            <Text style={{ color: textBodyColor, textAlign: 'center', width: '100%', marginVertical: 20 }}>
                                No airtime conversion options available currently.
                            </Text>
                        )}
                    </View>
                </View>

                {/* Instructions */}
                {selectedNetwork && (
                    <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(255, 159, 67, 0.1)' : '#FFF7ED', borderColor: theme.accent }]}>
                        <Ionicons name="information-circle" size={24} color={theme.accent} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.infoTitle, { color: textColor }]}>Transfer Instructions</Text>
                            <Text style={{ color: textBodyColor, fontSize: 13 }}>
                                Please transfer the airtime to the number below.
                            </Text>
                            <View style={styles.adminNumberContainer}>
                                <Text style={[styles.adminNumber, { color: theme.primary }]}>
                                    {selectedNetwork.phone_number}
                                </Text>
                            </View>
                            <Text style={{ color: textBodyColor, fontSize: 11, marginTop: 4 }}>
                                Min: ₦{selectedNetwork.min_amount.toLocaleString()} | Max: ₦{selectedNetwork.max_amount.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Form */}
                <View style={styles.section}>
                    <Text style={[styles.inputLabel, { color: textBodyColor }]}>Amount Sent</Text>
                    <View style={[styles.inputContainer, { backgroundColor: cardBgColor, borderColor }]}>
                        <Text style={{ color: textBodyColor, marginRight: 8, fontSize: 16 }}>₦</Text>
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder="0.00"
                            placeholderTextColor={textBodyColor}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.inputLabel, { color: textBodyColor }]}>Sender Phone Number</Text>
                    <View style={[styles.inputContainer, { backgroundColor: cardBgColor, borderColor }]}>
                        <Ionicons name="call-outline" size={20} color={textBodyColor} style={{ marginRight: 10 }} />
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder="Enter the number you sent from"
                            placeholderTextColor={textBodyColor}
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            maxLength={11}
                        />
                    </View>
                </View>

                {selectedNetwork && amount && (
                    <View style={[styles.summaryCard, { backgroundColor: cardBgColor }]}>
                        <View style={styles.summaryRow}>
                            <Text style={{ color: textBodyColor }}>You Send:</Text>
                            <Text style={{ color: textColor, fontWeight: '600' }}>₦{amount || '0'}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={{ color: textBodyColor }}>You Receive ({selectedNetwork.conversion_rate}%):</Text>
                            <Text style={{ color: theme.success, fontWeight: '700', fontSize: 18 }}>
                                ₦{(Number(amount) * selectedNetwork.conversion_rate / 100).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: theme.primary, opacity: isLoading || !selectedNetwork ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={isLoading || !selectedNetwork}
                >
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>I Have Sent It</Text>}
                </TouchableOpacity>

                {/* History */}
                <Text style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}>Recent Requests</Text>
                {history.map((item, index) => (
                    <View key={index} style={[styles.historyCard, { backgroundColor: cardBgColor }]}>
                        <View>
                            <Text style={[styles.historyNetwork, { color: textColor }]}>{item.network.toUpperCase()}</Text>
                            <Text style={{ color: textBodyColor, fontSize: 12 }}>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: textColor, fontWeight: '600' }}>₦{item.amount}</Text>
                            <Text style={{
                                color: item.status === 'approved' ? theme.success : item.status === 'rejected' ? theme.error : theme.accent,
                                fontSize: 12, fontWeight: '600'
                            }}>
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                ))}
                {history.length === 0 && !isLoading && (
                    <Text style={{ color: textBodyColor, textAlign: 'center', marginTop: 10 }}>No history found.</Text>
                )}
                <View style={{ height: 50 }} />

            </ScrollView>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={styles.successModalBackdrop}>
                    <View style={[styles.successModalCard, { backgroundColor: cardBgColor }]}>
                        <Ionicons name="checkmark-circle" size={80} color={theme.success} style={{ marginBottom: 20 }} />
                        <Text style={[styles.successTitle, { color: textColor }]}>Request Submitted!</Text>
                        <Text style={[styles.successMessage, { color: textBodyColor, textAlign: 'center', marginBottom: 24 }]}>
                            Your request to convert airtime to cash has been submitted. We will process it shortly.
                        </Text>
                        <TouchableOpacity style={styles.closeSuccessBtn} onPress={closeSuccess}>
                            <Text style={styles.closeSuccessText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
        elevation: 2, shadowOpacity: 0.1, shadowRadius: 3
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    backButton: { padding: 8 },
    scrollContent: { padding: 20 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    networksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    networkCard: {
        width: '48%', padding: 16, borderRadius: 12, alignItems: 'center',
    },
    networkIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    networkName: { fontWeight: '600' },
    infoCard: {
        flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 24,
    },
    infoTitle: { fontWeight: '600', marginBottom: 4 },
    adminNumberContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start'
    },
    adminNumber: { fontWeight: '700', fontSize: 16, letterSpacing: 1 },
    inputLabel: { marginBottom: 8, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 50 },
    input: { flex: 1, fontSize: 16, fontWeight: '600' },
    summaryCard: { padding: 20, borderRadius: 16, marginBottom: 24 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    submitBtn: { padding: 18, borderRadius: 12, alignItems: 'center' },
    submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    historyCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 8 },
    historyNetwork: { fontWeight: '700', marginBottom: 4 },
    successModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successModalCard: { width: '100%', borderRadius: 24, padding: 32, alignItems: 'center' },
    successTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    successMessage: { fontSize: 14 },
    closeSuccessBtn: { paddingVertical: 12, paddingHorizontal: 40, backgroundColor: '#F3F4F6', borderRadius: 12 },
    closeSuccessText: { color: '#374151', fontWeight: '600' }
});
