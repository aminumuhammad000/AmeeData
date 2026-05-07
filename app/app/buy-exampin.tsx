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
    View,
    Clipboard
} from 'react-native';

const THEME = {
    primary: '#0A2540',
    accent: '#FF9F43',
    success: '#00D4AA',
    error: '#FF5B5B',
};

interface ExamProvider {
    id: string;
    name: string;
    price: number;
}

const EXAM_PROVIDERS: ExamProvider[] = [
    { id: '1', name: 'WAEC', price: 3360 },
    { id: '2', name: 'NECO', price: 2180 },
    { id: '3', name: 'NABTEB', price: 950 },
];

interface ExamPinSuccessData {
    pins: string;
    [key: string]: any;
}

export default function BuyExamPinScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const bgColor = isDark ? '#000000' : '#F9FAFB';
    const cardBgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1F2937';
    const textBodyColor = isDark ? '#D1D5DB' : '#6B7280';
    const borderColor = isDark ? '#374151' : '#E5E7EB';

    const { showError, showSuccess } = useAlert();
    const [selectedProvider, setSelectedProvider] = useState<ExamProvider | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [isPinModalVisible, setIsPinModalVisible] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState<ExamPinSuccessData | null>(null);
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
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

    const getTotalAmount = () => {
        if (!selectedProvider) return 0;
        return selectedProvider.price * (parseInt(quantity) || 0);
    };

    const initiatePurchase = () => {
        if (!selectedProvider || !quantity) {
            showError('Please select provider and enter quantity');
            return;
        }
        const total = getTotalAmount();
        if (balance !== null && total > balance) {
            showError('Insufficient balance');
            return;
        }
        setIsPinModalVisible(true);
    };

    const handlePurchase = async (pin: string) => {
        setIsPinModalVisible(false);
        if (!selectedProvider) return;
        setIsLoading(true);
        try {
            const response = await billPaymentService.purchaseExamPin({
                provider: selectedProvider.id,
                quantity: quantity,
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

    const copyPins = () => {
        if (successData?.pins) {
            Clipboard.setString(successData.pins);
            showSuccess('PINs copied to clipboard!');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.header, { backgroundColor: cardBgColor }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Buy Exam PIN</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Select Exam</Text>
                        {balance !== null && (
                            <Text style={[styles.balanceText, { color: THEME.accent }]}>
                                Balance: ₦{balance.toLocaleString()}
                            </Text>
                        )}
                    </View>
                    <View style={styles.providersGrid}>
                        {EXAM_PROVIDERS.map((p) => (
                            <TouchableOpacity
                                key={p.id}
                                style={[
                                    styles.providerCard,
                                    {
                                        backgroundColor: cardBgColor,
                                        borderColor: selectedProvider?.id === p.id ? THEME.accent : borderColor,
                                    },
                                ]}
                                onPress={() => setSelectedProvider(p)}
                            >
                                <Ionicons name="school-outline" size={24} color={selectedProvider?.id === p.id ? THEME.accent : textBodyColor} />
                                <Text style={[styles.providerName, { color: textColor }]}>{p.name}</Text>
                                <Text style={[styles.providerPrice, { color: THEME.accent }]}>₦{p.price.toLocaleString()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Quantity</Text>
                    <View style={[styles.inputContainer, { backgroundColor: cardBgColor, borderColor }]}>
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder="Enter quantity"
                            placeholderTextColor={textBodyColor}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {selectedProvider && (
                    <View style={[styles.summaryCard, { backgroundColor: cardBgColor, borderColor }]}>
                        <Text style={[styles.summaryTitle, { color: textColor }]}>Order Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: textBodyColor }]}>Exam Type</Text>
                            <Text style={[styles.summaryValue, { color: textColor }]}>{selectedProvider.name}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: textBodyColor }]}>Unit Price</Text>
                            <Text style={[styles.summaryValue, { color: textColor }]}>₦{selectedProvider.price.toLocaleString()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: textBodyColor }]}>Quantity</Text>
                            <Text style={[styles.summaryValue, { color: textColor }]}>{quantity}</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: borderColor }]} />
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: textColor, fontWeight: '700' }]}>Total Amount</Text>
                            <Text style={[styles.totalValue, { color: THEME.accent }]}>₦{getTotalAmount().toLocaleString()}</Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.buyButton, (!selectedProvider || !quantity) && styles.disabledButton]}
                    onPress={initiatePurchase}
                    disabled={isLoading || !selectedProvider || !quantity}
                >
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buyButtonText}>Purchase PINs</Text>}
                </TouchableOpacity>
            </ScrollView>

            <TransactionPinModal
                visible={isPinModalVisible}
                onClose={() => setIsPinModalVisible(false)}
                onSuccess={handlePurchase}
                amount={getTotalAmount()}
                transactionType="Exam PIN Purchase"
            />

            <Modal visible={showSuccessModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: cardBgColor }]}>
                        <View style={styles.successBadge}>
                            <Ionicons name="checkmark-circle" size={80} color={THEME.success} />
                        </View>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Purchase Successful</Text>
                        <Text style={[styles.modalSubtitle, { color: textBodyColor }]}>Your Exam PINs are ready</Text>
                        
                        {successData?.pins && (
                            <View style={[styles.pinsContainer, { backgroundColor: isDark ? '#111418' : '#F3F4F6' }]}>
                                <Text style={styles.pinsLabel}>EXAM PINS</Text>
                                <Text style={[styles.pinsValue, { color: textColor }]}>{successData.pins}</Text>
                                <TouchableOpacity style={styles.copyButton} onPress={copyPins}>
                                    <Ionicons name="copy-outline" size={16} color={THEME.accent} />
                                    <Text style={styles.copyText}>Copy All</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: THEME.primary }]}
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
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700' },
    balanceText: { fontSize: 13, fontWeight: '600' },
    providersGrid: { flexDirection: 'row', gap: 12 },
    providerCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        gap: 8,
    },
    providerName: { fontSize: 15, fontWeight: '700' },
    providerPrice: { fontSize: 13, fontWeight: '600' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 56,
    },
    input: { flex: 1, fontSize: 16 },
    summaryCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 14 },
    summaryValue: { fontSize: 14, fontWeight: '600' },
    divider: { height: 1, marginVertical: 12 },
    totalValue: { fontSize: 18, fontWeight: '700' },
    buyButton: {
        backgroundColor: THEME.accent,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    disabledButton: { backgroundColor: '#CCC' },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', padding: 24, borderRadius: 24, alignItems: 'center' },
    successBadge: { marginBottom: 16 },
    modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, marginBottom: 24 },
    pinsContainer: { padding: 20, borderRadius: 16, width: '100%', alignItems: 'center' },
    pinsLabel: { fontSize: 11, fontWeight: '700', color: '#666', marginBottom: 12, letterSpacing: 1 },
    pinsValue: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16, letterSpacing: 1 },
    copyButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    copyText: { color: THEME.accent, fontWeight: '600', fontSize: 13 },
    closeButton: { marginTop: 32, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, width: '100%', alignItems: 'center' },
    closeButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
