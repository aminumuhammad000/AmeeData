import { useAlert } from '@/components/AlertContext';
import TransactionPinModal from '@/components/TransactionPinModal';
import { billPaymentService } from '@/services/billpayment.service';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
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

export default function BuyAirtimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; amount?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#000000' : '#F9FAFB';
  const cardBgColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const textBodyColor = isDark ? '#D1D5DB' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const { showSuccess, showError, showInfo } = useAlert();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedNetworkIndex, setSelectedNetworkIndex] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);

  const [networks, setNetworks] = useState<Array<{ id: string; name: string; color: string; icon: string }>>([
    { id: 'mtn', name: 'MTN', color: '#FFCC00', icon: 'phone-portrait' },
    { id: 'glo', name: 'Glo', color: '#00A95C', icon: 'phone-portrait' },
    { id: 'airtel', name: 'Airtel', color: '#FF0000', icon: 'phone-portrait' },
    { id: '9mobile', name: '9mobile', color: '#00693E', icon: 'phone-portrait' },
  ]);
  const [netLoading, setNetLoading] = useState(false);
  const [netError, setNetError] = useState<string | null>(null);

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (params?.phone && typeof params.phone === 'string') {
      setPhoneNumber(params.phone);
    }
    if (params?.amount && typeof params.amount === 'string') {
      const amt = Number(params.amount);
      if (!Number.isNaN(amt) && amt > 0) {
        setSelectedAmount(amt);
      }
    }
  }, [params]);

  useEffect(() => {
    const loadNetworks = async () => {
      try {
        setNetLoading(true);
        setNetError(null);
        const res = await billPaymentService.getNetworks();
        if (res?.success && Array.isArray(res.data)) {
          const mapped = res.data.map((n: any, i: number) => {
            const baseId = (n.network_code || n.network_id || n.network || n.name || '')
              .toString()
              .trim()
              .toLowerCase()
              .replace(/\s+/g, '-');
            const id = baseId || `net-${i}`;

            // Map network colors to match Buy Data screen
            let color = '#0A2540'; // default
            const networkName = (n.name || n.network || n.network_code || '').toLowerCase();
            if (networkName.includes('mtn')) color = '#FFCC00';
            else if (networkName.includes('glo')) color = '#00A95C';
            else if (networkName.includes('airtel')) color = '#FF0000';
            else if (networkName.includes('9mobile') || networkName.includes('etisalat')) color = '#00693E';

            return {
              id,
              name: n.name || n.network || n.network_code || 'Network',
              color,
              icon: 'phone-portrait',
            };
          });
          if (mapped.length) setNetworks(mapped);
        }
      } catch (e: any) {
        setNetError(e?.message || 'Failed to load networks');
      } finally {
        setNetLoading(false);
      }
    };
    loadNetworks();
  }, []);

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
            // Clean number
            if (number) {
              number = number.replace(/\D/g, '');
              // Handle +234
              if (number.startsWith('234')) {
                number = '0' + number.slice(3);
              }
              // Handle 234 without +
              if (number.length === 13 && number.startsWith('234')) {
                number = '0' + number.slice(3);
              }
              setPhoneNumber(number);
            }
          }
        } catch (err) {
          console.log(err);
          showInfo('Could not open contacts');
        }
      } else {
        showInfo('No contacts found');
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
        showError('Permission to access contacts was denied. We need this to help you select phone numbers easily.');
      }
    }
  };

  const initiatePurchase = () => {
    if (!phoneNumber || !selectedNetwork || (!selectedAmount && !customAmount)) {
      showError('Please fill all required fields');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      showError('Phone number must be exactly 11 digits');
      return;
    }

    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount < 50) {
      showError('Minimum airtime amount is ₦50');
      return;
    }

    if (amount > 50000) {
      showError('Maximum airtime amount is ₦50,000');
      return;
    }

    setIsPinModalVisible(true);
  };

  const handleBuyAirtime = async (pin: string) => {
    setIsPinModalVisible(false);

    // Slight delay to allow modal to close smoothly
    setTimeout(async () => {
      setIsLoading(true);

      try {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const amount = selectedAmount || parseFloat(customAmount);

        const response = await billPaymentService.purchaseAirtime({
          network: selectedNetwork!,
          phone: cleanPhone,
          amount: amount,
          airtime_type: 'VTU',
          ported_number: true,
          pin,
        });

        if (response.success) {
          setShowSuccessModal(true);
        } else {
          showError(response.message || 'Failed to purchase airtime');
        }
      } catch (error: any) {
        showError(error.message || 'Failed to purchase airtime. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const closeSuccess = () => {
    setShowSuccessModal(false);
    setPhoneNumber('');
    setSelectedAmount(null);
    setCustomAmount('');
    setSelectedNetwork(null);
    setTimeout(() => {
      router.back();
    }, 500);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: cardBgColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Buy Airtime</Text>
        <TouchableOpacity onPress={selectContact}>
          <Ionicons name="people" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Select Network</Text>
          {netLoading && <Text style={{ color: textBodyColor, marginBottom: 8 }}>Loading networks...</Text>}
          {netError && <Text style={{ color: theme.error, marginBottom: 8 }}>{netError}</Text>}
          <View style={styles.networksGrid}>
            {networks.map((network, idx) => (
              <TouchableOpacity
                key={network.id || idx}
                style={[
                  styles.networkCard,
                  {
                    backgroundColor: cardBgColor,
                    borderColor: selectedNetworkIndex === idx ? network.color : borderColor,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => { setSelectedNetwork(network.id); setSelectedNetworkIndex(idx); }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.networkIcon,
                    {
                      backgroundColor: `${network.color}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={network.icon as any}
                    size={24}
                    color={network.color}
                  />
                </View>
                <Text style={[styles.networkName, { color: textColor }]}>
                  {network.name}
                </Text>
                {selectedNetworkIndex === idx && (
                  <View style={[styles.checkMark, { backgroundColor: network.color }]}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Phone Number</Text>
          <View style={[styles.inputContainer, { backgroundColor: cardBgColor, borderColor }]}>
            <Ionicons name="call-outline" size={20} color={textBodyColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Enter phone number"
              placeholderTextColor={textBodyColor}
              value={phoneNumber}
              onChangeText={(t) => setPhoneNumber(t.replace(/\D/g, '').slice(0, 11))}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <TouchableOpacity onPress={selectContact} style={styles.contactBtn}>
              <Ionicons name="book-outline" size={22} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Select Amount</Text>
          <View style={styles.amountsGrid}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountCard,
                  {
                    backgroundColor:
                      selectedAmount === amount ? (isDark ? theme.primary : theme.primary) : cardBgColor,
                    borderColor: selectedAmount === amount ? theme.accent : borderColor,
                  },
                ]}
                onPress={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.amountText,
                    { color: selectedAmount === amount ? '#FFFFFF' : textColor },
                  ]}
                >
                  ₦{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Or Enter Custom Amount</Text>
          <View style={[styles.inputContainer, { backgroundColor: cardBgColor, borderColor }]}>
            <Text style={[styles.currencySymbol, { color: textBodyColor }]}>₦</Text>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Enter amount"
              placeholderTextColor={textBodyColor}
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount(null);
              }}
              keyboardType="numeric"
            />
          </View>
          <Text style={[styles.helperText, { color: textBodyColor }]}>
            Minimum: ₦50 • Maximum: ₦50,000
          </Text>
        </View>

        {(selectedAmount || customAmount) && phoneNumber && selectedNetwork && (
          <View style={[styles.summaryCard, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.summaryTitle, { color: textColor }]}>Transaction Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: textBodyColor }]}>Network:</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>
                {networks.find(n => n.id === selectedNetwork)?.name}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: textBodyColor }]}>Phone Number:</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{phoneNumber}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: textBodyColor }]}>Amount:</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>
                ₦{selectedAmount || customAmount}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: textColor, fontWeight: '600' }]}>
                Total:
              </Text>
              <Text style={[styles.totalAmount, { color: theme.accent }]}>
                ₦{selectedAmount || customAmount}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.buyButton,
            {
              backgroundColor: (!phoneNumber || phoneNumber.replace(/\D/g, '').length !== 11 || !selectedNetwork || (!selectedAmount && !customAmount) || isLoading)
                ? (isDark ? '#374151' : '#D1D5DB')
                : theme.accent,
            },
          ]}
          onPress={initiatePurchase}
          disabled={!phoneNumber || phoneNumber.replace(/\D/g, '').length !== 11 || !selectedNetwork || (!selectedAmount && !customAmount) || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buyButtonText}>
              Buy Airtime
            </Text>
          )}
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1C1C1E' : '#EFF6FF' }]}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={isDark ? theme.accent : '#3B82F6'}
          />
          <Text style={[styles.infoText, { color: isDark ? textBodyColor : '#1E40AF' }]}>
            Airtime will be delivered instantly to the phone number provided
          </Text>
        </View>
      </ScrollView>

      {/* Transaction PIN Modal */}
      <TransactionPinModal
        visible={isPinModalVisible}
        onClose={() => setIsPinModalVisible(false)}
        onSuccess={handleBuyAirtime}
        amount={selectedAmount || customAmount || 0}
        transactionType="Airtime Purchase"
      />

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successModalBackdrop}>
          <View style={[styles.successModalCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={theme.success} />
            </View>

            <Text style={[styles.successTitle, { color: isDark ? '#FFFFFF' : theme.primary }]}>
              Airtime Purchase Successful!
            </Text>

            <View style={styles.successDetails}>
              <View style={styles.successDetailRow}>
                <Text style={[styles.successLabel, { color: textBodyColor }]}>
                  Network:
                </Text>
                <Text style={[styles.successValue, { color: isDark ? '#FFFFFF' : theme.primary }]}>
                  {networks.find(n => n.id === selectedNetwork)?.name || ''}
                </Text>
              </View>

              <View style={styles.successDetailRow}>
                <Text style={[styles.successLabel, { color: textBodyColor }]}>
                  Phone Number:
                </Text>
                <Text style={[styles.successValue, { color: isDark ? '#FFFFFF' : theme.primary }]}>
                  {phoneNumber}
                </Text>
              </View>

              <View style={styles.successDetailRow}>
                <Text style={[styles.successLabel, { color: textBodyColor }]}>
                  Amount:
                </Text>
                <Text style={[styles.successValue, { color: theme.success }]}>
                  ₦{(selectedAmount || parseInt(customAmount) || 0).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={[styles.successCheckmark, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="checkmark" size={20} color={theme.success} />
              <Text style={[styles.successMessage, { color: theme.success }]}>
                Airtime delivered instantly
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeSuccessBtn}
              onPress={closeSuccess}
            >
              <Text style={styles.closeSuccessText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  networksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  networkCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  networkIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  networkName: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  contactBtn: {
    padding: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  amountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountCard: {
    width: '30%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  buyButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  successModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  successDetails: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  successValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  successCheckmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  successMessage: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeSuccessBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  closeSuccessText: {
    fontWeight: '600',
    color: '#374151',
  }
});
