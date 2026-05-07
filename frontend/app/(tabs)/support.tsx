import { useTheme } from "@/components/ThemeContext";
import { SupportContent, supportService } from "@/services/support.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SupportScreen() {
  const { isDark } = useTheme();
  const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);
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

  const theme = {
    primary: "#0A2540",
    accent: "#FF9F43",
    backgroundLight: "#F8F9FA",
    backgroundDark: "#111921",
    textHeadings: "#1E293B",
    textBody: "#475569",
  };

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const textColor = isDark ? "#FFFFFF" : theme.textHeadings;
  const textBodyColor = isDark ? "#9CA3AF" : theme.textBody;
  const cardBg = isDark ? "#1F2937" : "#F3F4F6";

  const supportOptions = [
    {
      icon: "chatbubble-outline",
      label: "Live Chat",
      description: "Chat with our support team",
    },
    {
      icon: "call-outline",
      label: "Call Us",
      description: supportContent?.phoneNumber || "Loading...",
    },
    {
      icon: "mail-outline",
      label: "Email Support",
      description: supportContent?.email || "Loading...",
    },
    {
      icon: "logo-whatsapp",
      label: "WhatsApp",
      description: supportContent?.whatsappNumber || "Loading...",
    },
  ];

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

  const toggleFAQ = (index: number) => {
    setSelectedFAQ(selectedFAQ === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Support</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Contact Us
          </Text>
          <View style={styles.optionsGrid}>
            {supportOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionCard, { backgroundColor: cardBg }]}
                activeOpacity={0.7}
                onPress={() => {
                  if (option.label === "Call Us") {
                    // 📞 Open phone dialer
                    if (supportContent?.phoneNumber) {
                      Linking.openURL(`tel:${supportContent.phoneNumber.replace(/\s+/g, "")}`);
                    }
                  } else if (option.label === "Email Support") {
                    // 📧 Open default mail app
                    if (supportContent?.email) {
                      Linking.openURL(`mailto:${supportContent.email}`);
                    }
                  } else if (option.label === "Live Chat") {
                    // 💬 Maybe navigate to your chat screen later
                    Alert.alert("Live Chat", "Live chat feature coming soon!");
                  } else if (option.label === "WhatsApp") {
                    // 💚 Open WhatsApp chat
                    if (supportContent?.whatsappNumber) {
                      const cleanNumber = supportContent.whatsappNumber.replace(/[^0-9]/g, '');
                      const message = "Hello! I need some help regarding your app.";
                      const whatsappURL = `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;

                      Linking.canOpenURL(whatsappURL)
                        .then((supported) => {
                          if (!supported) {
                            // Fallback to web url if app not installed
                            return Linking.openURL(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`);
                          } else {
                            return Linking.openURL(whatsappURL);
                          }
                        })
                        .catch((err) => console.error("An error occurred", err));
                    }
                  }
                }}
              >
                <View
                  style={[
                    styles.optionIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 159, 67, 0.2)"
                        : "rgba(10, 37, 64, 0.1)",
                    },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={isDark ? theme.accent : theme.primary}
                  />
                </View>
                <Text style={[styles.optionLabel, { color: textColor }]}>
                  {option.label}
                </Text>
                <Text
                  style={[styles.optionDescription, { color: textBodyColor }]}
                >
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Frequently Asked Questions
          </Text>
          <View style={styles.faqList}>
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
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  optionDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    padding: 16,
    borderRadius: 8,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
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
});
