import { useAlert } from '@/components/AlertContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
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

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showSuccess } = useAlert();

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  // Notification settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Transaction notifications
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [paymentConfirmations, setPaymentConfirmations] = useState(true);
  const [lowBalanceAlerts, setLowBalanceAlerts] = useState(true);
  const [failedTransactions, setFailedTransactions] = useState(true);
  
  // Promotional notifications
  const [promotional, setPromotional] = useState(false);
  const [offers, setOffers] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(false);
  
  // Security notifications
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState(true);
  const [passwordChanges, setPasswordChanges] = useState(true);

  const handleSaveNotificationSettings = () => {
    // Here you would save the settings to your backend
    showSuccess('Notification preferences saved successfully!');
  };

  const NotificationToggle = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    icon 
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: string;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Ionicons name={icon as any} size={24} color={theme.primary} />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: textBodyColor }]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: borderColor, true: theme.primary }}
        thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
      />
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: textColor }]}>Notifications</Text>
        <TouchableOpacity onPress={handleSaveNotificationSettings}>
          <Text style={[styles.saveButton, { color: theme.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* General Notification Settings */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>General Settings</Text>
          
          <NotificationToggle
            title="Push Notifications"
            description="Receive notifications on your device"
            value={pushNotifications}
            onValueChange={setPushNotifications}
            icon="notifications"
          />

          <NotificationToggle
            title="Email Notifications"
            description="Receive notifications via email"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            icon="mail"
          />

          <NotificationToggle
            title="SMS Notifications"
            description="Receive notifications via text message"
            value={smsNotifications}
            onValueChange={setSmsNotifications}
            icon="chatbubble"
          />
        </View>

        {/* Transaction Notifications */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Transaction Alerts</Text>
          
          <NotificationToggle
            title="Transaction Alerts"
            description="Get notified for all transactions"
            value={transactionAlerts}
            onValueChange={setTransactionAlerts}
            icon="card"
          />

          <NotificationToggle
            title="Payment Confirmations"
            description="Receive confirmation for successful payments"
            value={paymentConfirmations}
            onValueChange={setPaymentConfirmations}
            icon="checkmark-circle"
          />

          <NotificationToggle
            title="Low Balance Alerts"
            description="Get notified when your balance is low"
            value={lowBalanceAlerts}
            onValueChange={setLowBalanceAlerts}
            icon="warning"
          />

          <NotificationToggle
            title="Failed Transactions"
            description="Get alerted about failed transactions"
            value={failedTransactions}
            onValueChange={setFailedTransactions}
            icon="close-circle"
          />
        </View>

        {/* Promotional Notifications */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Promotional</Text>
          
          <NotificationToggle
            title="Promotional Messages"
            description="Receive marketing and promotional content"
            value={promotional}
            onValueChange={setPromotional}
            icon="megaphone"
          />

          <NotificationToggle
            title="Special Offers"
            description="Get notified about discounts and deals"
            value={offers}
            onValueChange={setOffers}
            icon="gift"
          />

          <NotificationToggle
            title="News & Updates"
            description="Stay updated with app news and features"
            value={newsUpdates}
            onValueChange={setNewsUpdates}
            icon="newspaper"
          />
        </View>

        {/* Security Notifications */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Security Alerts</Text>
          
          <NotificationToggle
            title="Login Alerts"
            description="Get notified when someone logs into your account"
            value={loginAlerts}
            onValueChange={setLoginAlerts}
            icon="log-in"
          />

          <NotificationToggle
            title="Suspicious Activity"
            description="Alerts for unusual account activity"
            value={suspiciousActivity}
            onValueChange={setSuspiciousActivity}
            icon="shield-outline"
          />

          <NotificationToggle
            title="Password Changes"
            description="Get notified when your password is changed"
            value={passwordChanges}
            onValueChange={setPasswordChanges}
            icon="key"
          />
        </View>

        {/* Notification Schedule */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quiet Hours</Text>
          
          <TouchableOpacity style={styles.scheduleItem}>
            <View style={styles.scheduleInfo}>
              <Ionicons name="moon" size={24} color={theme.primary} />
              <View style={styles.scheduleTextContainer}>
                <Text style={[styles.scheduleTitle, { color: textColor }]}>Do Not Disturb</Text>
                <Text style={[styles.scheduleDescription, { color: textBodyColor }]}>
                  10:00 PM - 7:00 AM
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textBodyColor} />
          </TouchableOpacity>
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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 8,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
  },
});