import { useAlert } from '@/components/AlertContext';
import TransactionPinModal from '@/components/TransactionPinModal';
import { walletService } from '@/services/api';
import { billPaymentService } from '@/services/billpayment.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

const THEME = {
    primary: '#0A2540',
    accent: '#FF9F43',
    success: '#00D4AA',
    error: '#FF5B5B',
};

interface ElectricityProvider {
    id: string;
    name: string;
    service_number?: string;
}

interface ElectricitySuccessData {
    token?: string;
    [key: string]: any;
}

export default function BuyElectricityScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const bgColor = isDark ? '#000000' : '#F9FAFB';
    const cardBgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1F2937';
    const textBodyColor = isDark ? '#D1D5DB' : '#6B7280';
    const borderColor = isDark ? '#374151' : '#E5E7EB';

    const { showError } = useAlert();
    const [providers, setProviders] = useState<ElectricityProvider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<ElectricityProvider | null>(null);
    const [meterNumber, setMeterNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isPinModalVisible, setIsPinModalVisible] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState<ElectricitySuccessData | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [balance, setBalance] = useState<number | null>(null);

    const ELECTRICITY_PROVIDERS = [
        { id: '1', name: 'Ikeja Electric' },
        { id: '2', name: 'Eko Electric' },
        { id: '3', name: 'Kano Electric' },
        { id: '4', name: 'Port Harcourt Electric' },
        { id: '5', name: 'Jos Electric' },
        { id: '6', name: 'Ibadan Electric' },
        { id: '7', name: 'Kaduna Electric' },
        { id: '8', name: 'Abuja Electric' },
        { id: '9', name: 'Enugu Electric' },
        { id: '10', name: 'Benin Electric' },
        { id: '11', name: 'Yola Electric' },
    ];

    useEffect(() => {
        setProviders(ELECTRICITY_PROVIDERS);
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await walletService.getWallet();
            if (response.data.success && response.data.data) {
                setBalance(response.data.data.wallet.balance);
            }
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const fetchProviders = async () => {
        try {
            const response = await billPaymentService.getElectricityProviders();
            if (response.success && Array.isArray(response.data)) {
                setProviders(response.data);
            }
        } catch (error) {
            showError('Failed to load electricity providers');
        }
    };

    const handleVerifyMeter = async () => {
        if (!selectedProvider || !meterNumber || !meterType) {
            showError('Please select provider and enter meter number');
            return;
        }
        setIsVerifying(true);
        setCustomerName('');
        try {
            const res = await billPaymentService.verifyElectricityMeter(
                (selectedProvider.id || selectedProvider.service_number) as string,
                meterNumber,
                meterType
            );
            if (res.success) {
                setCustomerName(res.data.customer_name);
            } else {
                showError(res.message || 'Meter verification failed');
            }
        } catch (error: any) {
            showError(error.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const initiatePurchase = () => {
        if (!selectedProvider || !meterNumber || !amount || !phoneNumber) {
            showError('Please fill all fields');
            return;
        }
        if (parseFloat(amount) < 100) {
            showError('Minimum amount is ₦100');
            return;
        }
        setIsPinModalVisible(true);
    };

    const handlePurchase = async (pin: string) => {
        setIsPinModalVisible(false);
        if (!selectedProvider) return;
        setIsLoading(true);
        try {
            const response = await billPaymentService.purchaseElectricity({
                provider: selectedProvider.id || selectedProvider.service_number,
                meternumber: meterNumber,
                amount: amount,
                metertype: meterType,
                phone: phoneNumber,
                pin
            });

            if (response.success) {
                setSuccessData(response.data);
                setShowSuccessModal(true);
            } else {
                showError(response.message || 'Purchase failed');
            }
        } catch (error: any) {
            showError(error.message || 'Purchase failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.header, { backgroundColor: cardBgColor }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Buy Electricity</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Select Provider</Text>
                        {balance !== null && (
                            <Text style={[styles.balanceText, { color: THEME.accent }]}>
                                Balance: ₦{balance.toLocaleString()}
                            </Text>
                        )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providersList}>
                        {providers.map((p: any) => (
                            <TouchableOpacity
                                key={p.id || p.service_number}
                                style={[
                                    styles.providerCard,
                                    {
                                        backgroundColor: cardBgColor,
                                        borderColor: selectedProvider?.id === p.id ? THEME.accent : borderColor,
                                    },
                                ]}
                                onPress={() => setSelectedProvider(p)}
                            >
                                <Text style={{ color: textColor }}>{p.name}</Text>
                            </TouchableOpacity>
                        ))}
                        {providers.length === 0 && (
                            <Text style={{ color: textBodyColor }}>Loading providers...</Text>
                        )}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Meter Type</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[styles.typeButton, meterType === 'prepaid' && styles.activeType]}
                            onPress={() => setMeterType('prepaid')}
                        >
                            <Text style={[styles.typeText, meterType === 'prepaid' && styles.activeTypeText]}>Prepaid</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, meterType === 'postpaid' && styles.activeType]}
                            onPress={() => setMeterType('postpaid')}
                        >
                            <Text style={[styles.typeText, meterType === 'postpaid' && styles.activeTypeText]}>Postpaid</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Meter Number</Text>
                    <View style={[styles.inputContainer, { backgroundColor: cardBgColor, borderColor }]}>
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder="Enter meter number"
                            placeholderTextColor={textBodyColor}
                            value={meterNumber}
                            onChangeText={setMeterNumber}
                            keyboardType="numeric"
                            onBlur={handleVerifyMeter}
                        />
                        {isVerifying && <ActivityIndicator size="small" color={THEME.accent} />}
                    </View>
                    {customerName ? (
                        <Text style={styles.customerName}>Customer: {customerName}</Text>
                    ) : null}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Amount</Text>
                    <View style={[styles.inputContainer, { backgroundColor: cardBgColor, borderColor }]}>
                        <Text style={{ color: textBodyColor, marginRight: 8 }}>₦</Text>
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder="Min ₦100"
                            placeholderTextColor={textBodyColor}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Phone Number</Text>
                    <View style={[styles.inputContainer, { backgroundColor: cardBgColor, borderColor }]}>
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder="Enter phone number"
                            placeholderTextColor={textBodyColor}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.buyButton, (!selectedProvider || !meterNumber || !amount || !phoneNumber) && styles.disabledButton]}
                    onPress={initiatePurchase}
                    disabled={isLoading || !selectedProvider || !meterNumber || !amount || !phoneNumber}
                >
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buyButtonText}>Purchase</Text>}
                </TouchableOpacity>
            </ScrollView>

            <TransactionPinModal
                visible={isPinModalVisible}
                onClose={() => setIsPinModalVisible(false)}
                onSuccess={handlePurchase}
                amount={parseFloat(amount) || 0}
                transactionType="Electricity Bill"
            />

            <Modal visible={showSuccessModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: cardBgColor }]}>
                        <Ionicons name="checkmark-circle" size={80} color={THEME.success} />
                        <Text style={[styles.modalTitle, { color: textColor }]}>Purchase Successful</Text>
                        {successData?.token && (
                            <View style={styles.tokenContainer}>
                                <Text style={styles.tokenLabel}>TOKEN</Text>
                                <Text style={styles.tokenValue}>{successData.token}</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setShowSuccessModal(false);
                                router.back();
                            }}
                        >
                            <Text style={styles.closeButtonText}>Done</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '600' },
    scrollContent: { padding: 20 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700' },
    balanceText: { fontSize: 13, fontWeight: '600' },
    providersList: { flexDirection: 'row' },
    providerCard: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        marginRight: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    typeContainer: { flexDirection: 'row', gap: 10 },
    typeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        alignItems: 'center',
    },
    activeType: { borderColor: THEME.accent, backgroundColor: THEME.accent + '20' },
    typeText: { fontSize: 14, color: '#666' },
    activeTypeText: { color: THEME.accent, fontWeight: '600' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 56,
    },
    input: { flex: 1, fontSize: 16 },
    customerName: { marginTop: 5, color: THEME.success, fontWeight: '500' },
    buyButton: {
        backgroundColor: THEME.accent,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    buyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    disabledButton: { backgroundColor: '#CCC' },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', padding: 30, borderRadius: 20, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: '700', marginVertical: 15 },
    tokenContainer: { backgroundColor: '#F0F0F0', padding: 20, borderRadius: 10, width: '100%', alignItems: 'center' },
    tokenLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
    tokenValue: { fontSize: 24, fontWeight: '800', color: THEME.primary, letterSpacing: 2 },
    closeButton: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 30, backgroundColor: THEME.primary, borderRadius: 10 },
    closeButtonText: { color: '#FFF', fontWeight: '600' },
});
