import { useAlert } from '@/components/AlertContext';
import { userService } from '@/services/user.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function SecurityScreen() {
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

  // Transaction PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  const handleUpdatePin = async () => {
    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin)) {
      showError('PIN must be exactly 4 digits');
      return;
    }
    if (currentPin === newPin) {
      showError('New PIN must be different from current PIN');
      return;
    }

    setIsUpdatingPin(true);
    try {
      const res = await userService.updateTransactionPin(currentPin, newPin);
      if (res?.success) {
        showSuccess('Transaction PIN updated successfully');
        setCurrentPin('');
        setNewPin('');
      } else {
        showError(res?.message || 'Failed to update transaction PIN');
      }
    } catch (e: any) {
      showError(e?.message || 'Failed to update transaction PIN');
    } finally {
      setIsUpdatingPin(false);
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Transaction PIN</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Update Transaction PIN */}
        <View style={[styles.section, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Change Transaction PIN</Text>
          <Text style={[styles.sectionDescription, { color: textBodyColor }]}>Your PIN is required for authorizing transactions</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: textBodyColor }]}>Current PIN</Text>
            <TextInput
              style={[styles.textInput, {
                backgroundColor: inputBgColor,
                borderColor: borderColor,
                color: textColor
              }]}
              value={currentPin}
              onChangeText={setCurrentPin}
              placeholder="Enter current 4-digit PIN"
              placeholderTextColor={textBodyColor}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: textBodyColor }]}>New PIN</Text>
            <TextInput
              style={[styles.textInput, {
                backgroundColor: inputBgColor,
                borderColor: borderColor,
                color: textColor
              }]}
              value={newPin}
              onChangeText={setNewPin}
              placeholder="Enter new 4-digit PIN"
              placeholderTextColor={textBodyColor}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, {
              backgroundColor: theme.primary,
              opacity: isUpdatingPin ? 0.7 : 1
            }]}
            onPress={handleUpdatePin}
            disabled={isUpdatingPin}
          >
            <Text style={styles.submitButtonText}>
              {isUpdatingPin ? 'Updating PIN...' : 'Update PIN'}
            </Text>
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});