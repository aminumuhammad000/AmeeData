import { useAlert } from '@/components/AlertContext';
import TransactionPinModal from '@/components/TransactionPinModal';
import { billPaymentService } from '@/services/billpayment.service';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
  View,
} from 'react-native';

const THEME = {
    primary: '#0A2540',
    accent: '#FF9F43',
    success: '#00D4AA',
    error: '#FF5B5B',
};

interface DataPlanItem {
    id: string;
    data: string;
    validity: string;
    price: number;
    category?: string;
}

export default function BuyDataScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#000000' : '#F9FAFB';
  const cardBgColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const textBodyColor = isDark ? '#D1D5DB' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const { showSuccess, showError, showInfo } = useAlert();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<DataPlanItem | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<DataPlanItem[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const networks = [
    { id: 'mtn', name: 'MTN', color: '#FFCC00', icon: 'phone-portrait' },
    { id: 'glo', name: 'Glo', color: '#00A95C', icon: 'phone-portrait' },
    { id: 'airtel', name: 'Airtel', color: '#FF0000', icon: 'phone-portrait' },
    { id: '9mobile', name: '9mobile', color: '#00693E', icon: 'phone-portrait' },
  ];

  const filters = ['All', 'Small', 'Medium', 'Large', 'Mega'];

  // Load plans when network changes
  useEffect(() => {
    const loadPlans = async () => {
      if (!selectedNetwork) { setPlans([]); setPlansError(null); return; }
      try {
        setPlansLoading(true);
        setPlansError(null);
        const res = await billPaymentService.getDataPlans(selectedNetwork);
        if (res?.success && Array.isArray(res.data)) {
          const mapped = res.data.map((p: any, i: number) => {
            const name = p.plan_name || p.data_value || p.name || 'Plan';
            let category = 'Medium';

            // Logic to determine category based on data size in name
            const norm = name.toLowerCase().replace(/\s/g, '');
            let sizeMB = 0;

            if (norm.includes('tb')) {
              sizeMB = parseFloat(norm) * 1024 * 1024;
            } else if (norm.includes('gb')) {
              sizeMB = parseFloat(norm) * 1024;
            } else if (norm.includes('mb')) {
              sizeMB = parseFloat(norm);
            }

            if (sizeMB > 0) {
              if (sizeMB < 1024) category = 'Small'; // < 1GB
              else if (sizeMB <= 5 * 1024) category = 'Medium'; // 1-5GB
              else if (sizeMB <= 20 * 1024) category = 'Large'; // 5-20GB
              else category = 'Mega'; // > 20GB
            } else {
              // Fallback
              const price = Number(p.price || p.amount || 0);
              if (price < 500) category = 'Small';
              else if (price < 2000) category = 'Medium';
              else if (price < 10000) category = 'Large';
              else category = 'Mega';
            }

            return {
              id: String(p.planid || p.plan_id || p.id || p.plan || `plan-${i}`),
              data: name,
              validity: p.validity || p.duration || '30 Days',
              price: Number(p.price || p.amount || 0),
              category
            };
          });
          setPlans(mapped);
        } else {
          setPlans([]);
        }
      } catch (e: any) {
        setPlansError(e?.message || 'Failed to load plans');
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    loadPlans();
  }, [selectedNetwork]);

  const filteredPlans = useMemo(() => {
    if (selectedFilter === 'All') return plans;
    return plans.filter(p => p.category === selectedFilter);
  }, [plans, selectedFilter]);

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
            if (number) {
              number = number.replace(/\D/g, '');
              if (number.startsWith('234')) number = '0' + number.slice(3);
              if (number.length === 13 && number.startsWith('234')) number = '0' + number.slice(3);
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
    if (!phoneNumber || !selectedNetwork || !selectedPlan) {
      showError('Please fill all required fields');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      showError('Phone number must be exactly 11 digits');
      return;
    }
    setIsPinModalVisible(true);
  };

  const handleBuyData = async (pin: string) => {
    setIsPinModalVisible(false);
    if (!selectedNetwork || !selectedPlan) return;

    setTimeout(async () => {
      setIsLoading(true);
      try {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const response = await billPaymentService.purchaseData({
          network: selectedNetwork!,
          phone: cleanPhone,
          plan: selectedPlan.id.toString(),
          ported_number: true,
          pin,
        });

        if (response.success) {
          setShowSuccessModal(true);
        } else {
          showError(response.message || 'Failed to purchase data');
        }
      } catch (error: any) {
        showError(error.message || 'Failed to purchase data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const closeSuccess = () => {
    setShowSuccessModal(false);
    setPhoneNumber('');
    setSelectedPlan(null);
    setSelectedNetwork(null);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: cardBgColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Buy Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Network Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Select Network</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {networks.map((network) => (
              <TouchableOpacity
                key={network.id}
                style={[
                  styles.networkCard,
                  {
                    backgroundColor: cardBgColor,
                    borderColor: selectedNetwork === network.id ? network.color : borderColor,
                    borderWidth: selectedNetwork === network.id ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  setSelectedNetwork(network.id);
                  setSelectedPlan(null);
                }}
              >
                <View style={[styles.networkIcon, { backgroundColor: `${network.color}20` }]}>
                  <Ionicons name={network.icon as any} size={20} color={network.color} />
                </View>
                <Text style={[styles.networkName, { color: textColor }]}>{network.name}</Text>
                {selectedNetwork === network.id && (
                  <View style={[styles.checkMark, { backgroundColor: network.color }]}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Phone Number with Improved Contact Button */}
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
          </View>
          {/* Contact Button Outside */}
          <TouchableOpacity
            onPress={selectContact}
            style={[
              styles.contactBtnFull,
              { borderColor: THEME.accent, backgroundColor: isDark ? 'rgba(255, 159, 67, 0.1)' : '#FFF7ED' }
            ]}
          >
            <Ionicons name="people" size={20} color={THEME.accent} />
            <Text style={{ color: THEME.accent, fontWeight: '600', marginLeft: 8 }}>Select from Contacts</Text>
          </TouchableOpacity>
        </View>

        {/* Data Plans with Improved Filter Layout */}
        {selectedNetwork && (
          <View style={styles.section}>
            <View style={styles.plansHeaderContainer}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Data Plans</Text>

              {/* Filters pushed to next line/block */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                {filters.map(filter => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      { backgroundColor: selectedFilter === filter ? THEME.primary : 'transparent', borderWidth: 1, borderColor: selectedFilter === filter ? THEME.primary : borderColor }
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={{ color: selectedFilter === filter ? '#FFF' : textBodyColor, fontSize: 12, fontWeight: '600' }}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {plansLoading ? (
              <ActivityIndicator color={THEME.primary} style={{ marginTop: 20 }} />
            ) : plansError ? (
              <Text style={{ color: THEME.error }}>{plansError}</Text>
            ) : (
              <View style={styles.plansGrid}>
                {filteredPlans.map((plan, index) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: selectedPlan?.id === plan.id ? THEME.primary : cardBgColor,
                        borderColor: selectedPlan?.id === plan.id ? THEME.accent : borderColor,
                      },
                    ]}
                    onPress={() => setSelectedPlan(plan)}
                  >
                    <Text style={[styles.planData, { color: selectedPlan?.id === plan.id ? '#FFF' : textColor }]}>
                      {plan.data}
                    </Text>
                    <Text style={[styles.planValidity, { color: selectedPlan?.id === plan.id ? '#D1D5DB' : textBodyColor }]}>
                      {plan.validity}
                    </Text>
                    <Text style={[styles.planPrice, { color: selectedPlan?.id === plan.id ? THEME.accent : THEME.primary }]}>
                      ₦{plan.price.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Buy Button */}
        <TouchableOpacity
          style={[
            styles.buyButton,
            {
              backgroundColor: (!phoneNumber || !selectedNetwork || !selectedPlan || isLoading)
                ? (isDark ? '#374151' : '#D1D5DB')
                : THEME.accent,
            },
          ]}
          onPress={initiatePurchase}
          disabled={!phoneNumber || !selectedNetwork || !selectedPlan || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buyButtonText}>Buy Data</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      <TransactionPinModal
        visible={isPinModalVisible}
        onClose={() => setIsPinModalVisible(false)}
        onSuccess={handleBuyData}
        amount={selectedPlan?.price || 0}
        transactionType={`Data - ${selectedNetwork?.toUpperCase()} ${selectedPlan?.data}`}
      />

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.successModalBackdrop}>
          <View style={[styles.successModalCard, { backgroundColor: cardBgColor }]}>
            <Ionicons name="checkmark-circle" size={80} color={THEME.success} style={{ marginBottom: 20 }} />
            <Text style={[styles.successTitle, { color: textColor }]}>Successful!</Text>
            <Text style={[styles.successMessage, { color: textBodyColor, textAlign: 'center', marginBottom: 24 }]}>
              You have successfully purchased {selectedPlan?.data} for {phoneNumber}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)'
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backButton: { padding: 8 },
  scrollContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  networksGrid: { flexDirection: 'row', gap: 12 },
  networkCard: {
    width: 100,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  networkIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8
  },
  networkName: { fontSize: 13, fontWeight: '600' },
  checkMark: {
    position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center'
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 16, height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  contactBtnFull: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed'
  },
  plansHeaderContainer: { marginBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  plansGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  planCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  planData: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  planValidity: { fontSize: 12, marginBottom: 8 },
  planPrice: { fontSize: 15, fontWeight: '600' },
  buyButton: {
    paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 40
  },
  buyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  successModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successModalCard: { width: '100%', borderRadius: 24, padding: 32, alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  successMessage: { fontSize: 14 },
  closeSuccessBtn: { paddingVertical: 12, paddingHorizontal: 40, backgroundColor: '#F3F4F6', borderRadius: 12 },
  closeSuccessText: { color: '#374151', fontWeight: '600' }
});
