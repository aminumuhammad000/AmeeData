import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Modal,
    Dimensions,
} from 'react-native';
import { transactionService, Transaction as ApiTransaction } from '@/services/transaction.service';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TransactionDetailsModalProps {
    visible: boolean;
    transactionId: string | null;
    onClose: () => void;
}

export default function TransactionDetailsModal({
    visible,
    transactionId,
    onClose,
}: TransactionDetailsModalProps) {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tx, setTx] = useState<ApiTransaction | null>(null);

    const theme = {
        primary: '#0A2540',
        accent: '#FF9F43',
        backgroundLight: '#F8F9FA',
        backgroundDark: '#111921',
        cardLight: '#FFFFFF',
        cardDark: '#1F2937',
        textHeadings: '#1E293B',
        textBody: '#475569',
    };

    const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
    const cardBg = isDark ? theme.cardDark : theme.cardLight;
    const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
    const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
    const borderColor = isDark ? '#374151' : '#E5E7EB';

    useEffect(() => {
        const load = async () => {
            if (!transactionId) return;

            try {
                setLoading(true);
                setError(null);

                // Call the correct API method
                const res = await transactionService.getTransactionById(transactionId);

                // Log the response for debugging
                console.log('Transaction API Response:', res);

                // Parse the response - handle different possible structures
                let transactionData = null;

                if (res?.data?.transaction) {
                    transactionData = res.data.transaction;
                } else if (res?.transaction) {
                    transactionData = res.transaction;
                } else if (res?.data) {
                    transactionData = res.data;
                } else {
                    transactionData = res;
                }

                console.log('Parsed transaction data:', transactionData);
                setTx(transactionData as ApiTransaction);
            } catch (e: any) {
                console.error('Error loading transaction:', e);
                setError(e?.message || 'Failed to load transaction');
            } finally {
                setLoading(false);
            }
        };

        if (visible && transactionId) {
            load();
        }
    }, [visible, transactionId]);

    const Row = ({ label, value }: { label: string; value?: string | number }) => (
        <View style={styles.row}>
            <Text style={[styles.label, { color: textBodyColor }]}>{label}</Text>
            <Text style={[styles.value, { color: textColor }]}>{String(value ?? '—')}</Text>
        </View>
    );

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'successful':
            case 'completed':
                return '#10B981';
            case 'failed':
                return '#EF4444';
            case 'pending':
                return '#FF9F43';
            default:
                return textBodyColor;
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: borderColor }]}>
                        <Text style={[styles.title, { color: textColor }]}>Transaction Details</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={textColor} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text style={[styles.loadingText, { color: textBodyColor }]}>Loading...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.center}>
                            <Ionicons name="alert-circle" size={48} color="#EF4444" />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity
                                style={[styles.retryBtn, { backgroundColor: theme.primary }]}
                                onPress={onClose}
                            >
                                <Text style={styles.retryBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    ) : !tx ? (
                        <View style={styles.center}>
                            <Ionicons name="document-text-outline" size={48} color={textBodyColor} />
                            <Text style={[styles.errorText, { color: textBodyColor }]}>Transaction not found</Text>
                        </View>
                    ) : (
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Status Badge */}
                            <View style={styles.statusContainer}>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: getStatusColor(tx.status) + '20' }
                                    ]}
                                >
                                    <Ionicons
                                        name={
                                            tx.status === 'successful' ? 'checkmark-circle' :
                                                tx.status === 'failed' ? 'close-circle' :
                                                    'time'
                                        }
                                        size={24}
                                        color={getStatusColor(tx.status)}
                                    />
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: getStatusColor(tx.status) }
                                        ]}
                                    >
                                        {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1)}
                                    </Text>
                                </View>
                            </View>

                            {/* Amount Card */}
                            <View style={[styles.amountCard, { backgroundColor: theme.primary }]}>
                                <Text style={styles.amountLabel}>Total Amount</Text>
                                <Text style={styles.amountValue}>₦{tx.total_charged.toLocaleString()}</Text>
                            </View>

                            {/* Details Card */}
                            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                                <Row label="Transaction Type" value={tx.type?.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} />
                                <Row label="Amount" value={`₦${tx.amount.toLocaleString()}`} />
                                <Row label="Fee" value={`₦${(tx.fee ?? 0).toLocaleString()}`} />
                                <Row label="Reference" value={tx.reference_number} />
                                {tx.destination_account && <Row label="Destination" value={tx.destination_account} />}
                                <Row label="Payment Method" value={tx.payment_method} />
                                {tx.plan_id && <Row label="Plan ID" value={tx.plan_id} />}
                                {tx.operator_id && <Row label="Operator" value={tx.operator_id} />}
                                <Row label="Date" value={new Date(tx.created_at).toLocaleString()} />
                                {tx.description && <Row label="Description" value={tx.description} />}
                                {tx.error_message && (
                                    <View style={[styles.row, { alignItems: 'flex-start' }]}>
                                        <Text style={[styles.label, { color: textBodyColor }]}>Error</Text>
                                        <Text style={[styles.value, { color: '#EF4444' }]}>{tx.error_message}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Action Buttons */}
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: cardBg, borderColor }]}
                                onPress={onClose}
                            >
                                <Ionicons name="download-outline" size={20} color={theme.primary} />
                                <Text style={[styles.actionBtnText, { color: theme.primary }]}>Download Receipt</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        height: SCREEN_HEIGHT * 0.85,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    errorText: {
        marginTop: 12,
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '700',
    },
    amountCard: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    amountLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 8,
    },
    amountValue: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '700',
    },
    card: {
        borderRadius: 12,
        padding: 16,
        gap: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 16,
        flexShrink: 1,
        textAlign: 'right',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
