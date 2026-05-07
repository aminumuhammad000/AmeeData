import { useAlert } from '@/components/AlertContext';
import { SupportContent, supportService } from '@/services/support.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StatusBar,
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
  backgroundLight: '#F8F9FA',
  backgroundDark: '#111921',
  textHeadings: '#1E293B',
  textBody: '#475569',
};

export default function HelpSupportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showSuccess, showError } = useAlert();

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const inputBgColor = isDark ? '#374151' : '#F9FAFB';

  const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [supportContent, setSupportContent] = useState<SupportContent | null>(null);

  useEffect(() => {
    fetchSupportContent();
  }, []);

  const fetchSupportContent = async () => {
    try {
      const response = await supportService.getSupportContent();
      if (response.success) {
        setSupportContent(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch support content:', error);
    }
  };

  const faqData = [
    {
      question: 'How do I buy airtime or data?',
      answer: 'To buy airtime or data, go to the home screen and select either "Buy Airtime" or "Buy Data". Choose your network provider, enter the phone number, select the amount, and confirm your purchase.'
    },
    {
      question: 'How long does it take for transactions to be processed?',
      answer: 'Most transactions are processed instantly. However, in some cases, it may take up to 5 minutes. If your transaction takes longer than expected, please contact our support team.'
    },
    {
      question: 'How do I add money to my wallet?',
      answer: 'You can add money to your wallet by tapping "Add Money" on the home screen. Choose your preferred payment method (bank transfer, card payment, or USSD) and follow the instructions.'
    },
    {
      question: 'What should I do if a transaction fails?',
      answer: 'If a transaction fails, the amount will be automatically refunded to your wallet within 24 hours. If you don\'t receive your refund, please contact our support team with your transaction reference.'
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to Profile > Security > Change Password. Enter your current password and your new password. Make sure your new password is at least 8 characters long and includes letters and numbers.'
    },
    {
      question: 'Is my money safe in the app?',
      answer: 'Yes, your money is completely safe. We use bank-level security encryption and comply with all financial regulations. Your wallet funds are held in secure escrow accounts.'
    }
  ];

  const contactOptions = [
    {
      title: 'Call Support',
      description: supportContent?.phoneNumber || 'Loading...',
      icon: 'call',
      action: () => {
        if (supportContent?.phoneNumber) {
          Linking.openURL(`tel:${supportContent.phoneNumber}`);
        }
      }
    },
    {
      title: 'Email Support',
      description: supportContent?.email || 'Loading...',
      icon: 'mail',
      action: () => {
        if (supportContent?.email) {
          Linking.openURL(`mailto:${supportContent.email}`);
        }
      }
    },
    {
      title: 'WhatsApp',
      description: supportContent?.whatsappNumber || 'Loading...',
      icon: 'logo-whatsapp',
      action: () => {
        if (supportContent?.whatsappNumber) {
          // Remove + and spaces for wa.me link
          const cleanNumber = supportContent.whatsappNumber.replace(/[^0-9]/g, '');
          Linking.openURL(`https://wa.me/${cleanNumber}`);
        }
      }
    }
  ];

  const handleSubmitTicket = async () => {
    if (!supportMessage.trim()) {
      showError('Please enter your message');
      return;
    }

    setIsSubmittingTicket(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSuccess('Support ticket submitted successfully! We\'ll get back to you within 24 hours.');
      setSupportMessage('');
    } catch (error) {
      showError('Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setSelectedFAQ(selectedFAQ === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Contact Support</Text>

          {contactOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={option.action}
            >
              <View style={styles.contactInfo}>
                <Ionicons name={option.icon as any} size={24} color={theme.primary} />
                <View style={styles.contactTextContainer}>
                  <Text style={[styles.contactTitle, { color: textColor }]}>{option.title}</Text>
                  <Text style={[styles.contactDescription, { color: textBodyColor }]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={textBodyColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Support Ticket */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Submit a Support Ticket</Text>

          <Text style={[styles.inputLabel, { color: textBodyColor }]}>Describe your issue</Text>
          <TextInput
            style={[styles.textArea, {
              backgroundColor: inputBgColor,
              borderColor: borderColor,
              color: textColor
            }]}
            value={supportMessage}
            onChangeText={setSupportMessage}
            placeholder="Please describe your issue in detail..."
            placeholderTextColor={textBodyColor}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, {
              backgroundColor: theme.primary,
              opacity: isSubmittingTicket ? 0.7 : 1
            }]}
            onPress={handleSubmitTicket}
            disabled={isSubmittingTicket}
          >
            <Text style={styles.submitButtonText}>
              {isSubmittingTicket ? 'Submitting...' : 'Submit Ticket'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Frequently Asked Questions</Text>

          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(index)}
              >
                <Text style={[styles.faqQuestionText, { color: textColor }]}>
                  {faq.question}
                </Text>
                <Ionicons
                  name={selectedFAQ === index ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={textBodyColor}
                />
              </TouchableOpacity>

              {selectedFAQ === index && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.faqAnswerText, { color: textBodyColor }]}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 120,
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingBottom: 16,
    paddingRight: 32,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resourceTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
  },
});