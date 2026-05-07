import { useAlert } from '@/components/AlertContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const theme = {
  primary: '#0A2540',
  accent: '#FF9F43',
  success: '#00D4AA',
  error: '#FF5B5B',
  backgroundLight: '#F8F9FA',
  backgroundDark: '#111921',
  textHeadings: '#1E293B',
  textBody: '#475569',
};

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showSuccess, showError } = useAlert();

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const [savedCards] = useState([
    {
      id: 1,
      type: 'visa',
      last4: '4567',
      expiryMonth: '12',
      expiryYear: '26',
      isDefault: true
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '8901',
      expiryMonth: '08',
      expiryYear: '25',
      isDefault: false
    }
  ]);

  const paymentOptions = [
    {
      title: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: 'business',
      available: true
    },
    {
      title: 'USSD Payment',
      description: 'Pay using *737# or similar codes',
      icon: 'keypad',
      available: true
    },
    {
      title: 'Mobile Money',
      description: 'Pay with mobile wallet',
      icon: 'phone-portrait',
      available: true
    },
    {
      title: 'Crypto Payment',
      description: 'Pay with cryptocurrency',
      icon: 'logo-bitcoin',
      available: false
    }
  ];

  const handleAddCard = () => {
    Alert.alert(
      'Add New Card',
      'This feature will redirect you to our secure payment processor to add a new card.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => showSuccess('Redirecting to secure payment form...') }
      ]
    );
  };

  const handleRemoveCard = (cardId: number) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => showSuccess('Payment method removed successfully')
        }
      ]
    );
  };

  const handleSetDefault = (cardId: number) => {
    showSuccess('Default payment method updated');
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return 'card' as const;
      case 'mastercard':
        return 'card' as const;
      default:
        return 'card' as const;
    }
  };

  const getCardName = (type: string) => {
    switch (type) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      default:
        return 'Card';
    }
  };

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
        <Text style={[styles.headerTitle, { color: textColor }]}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Saved Cards */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Saved Cards</Text>
            <TouchableOpacity 
              style={[styles.addButton, { borderColor: theme.primary }]}
              onPress={handleAddCard}
            >
              <Ionicons name="add" size={20} color={theme.primary} />
              <Text style={[styles.addButtonText, { color: theme.primary }]}>Add Card</Text>
            </TouchableOpacity>
          </View>
          
          {savedCards.length > 0 ? (
            savedCards.map((card) => (
              <View key={card.id} style={[styles.cardItem, { borderBottomColor: borderColor }]}>
                <View style={styles.cardInfo}>
                  <Ionicons name={getCardIcon(card.type)} size={24} color={theme.primary} />
                  <View style={styles.cardDetails}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardTitle, { color: textColor }]}>
                        {getCardName(card.type)} •••• {card.last4}
                      </Text>
                      {card.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: theme.success }]}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.cardExpiry, { color: textBodyColor }]}>
                      Expires {card.expiryMonth}/{card.expiryYear}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {!card.isDefault && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(card.id)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                        Set Default
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleRemoveCard(card.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.error }]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color={textBodyColor} />
              <Text style={[styles.emptyStateText, { color: textBodyColor }]}>
                No saved cards yet
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: textBodyColor }]}>
                Add a card to make payments faster and easier
              </Text>
            </View>
          )}
        </View>

        {/* Other Payment Methods */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Other Payment Options</Text>
          
          {paymentOptions.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.paymentOption, { 
                borderBottomColor: borderColor,
                opacity: option.available ? 1 : 0.5 
              }]}
              disabled={!option.available}
            >
              <View style={styles.optionInfo}>
                <Ionicons name={option.icon as any} size={24} color={theme.primary} />
                <View style={styles.optionDetails}>
                  <Text style={[styles.optionTitle, { color: textColor }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: textBodyColor }]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <View style={styles.optionStatus}>
                {option.available ? (
                  <Ionicons name="chevron-forward" size={20} color={textBodyColor} />
                ) : (
                  <Text style={[styles.comingSoonText, { color: textBodyColor }]}>
                    Coming Soon
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Information */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Security & Privacy</Text>
          
          <View style={styles.securityInfo}>
            <Ionicons name="shield-checkmark" size={24} color={theme.success} />
            <View style={styles.securityTextContainer}>
              <Text style={[styles.securityTitle, { color: textColor }]}>
                Your payment information is secure
              </Text>
              <Text style={[styles.securityDescription, { color: textBodyColor }]}>
                We use industry-standard encryption and never store your full card details. 
                All payments are processed through certified payment processors.
              </Text>
            </View>
          </View>
          
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <Ionicons name="lock-closed" size={16} color={theme.success} />
              <Text style={[styles.securityFeatureText, { color: textBodyColor }]}>
                256-bit SSL encryption
              </Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="shield" size={16} color={theme.success} />
              <Text style={[styles.securityFeatureText, { color: textBodyColor }]}>
                PCI DSS compliant
              </Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="checkmark-circle" size={16} color={theme.success} />
              <Text style={[styles.securityFeatureText, { color: textBodyColor }]}>
                Fraud protection
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 50 }} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDetails: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionDetails: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  optionStatus: {
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  securityTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  securityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  securityFeatures: {
    gap: 8,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityFeatureText: {
    fontSize: 14,
    marginLeft: 8,
  },
});