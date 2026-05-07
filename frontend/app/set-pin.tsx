import { useAlert } from '@/components/AlertContext';
import { userService } from '@/services/user.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

const theme = {
  primary: '#0A2540',
  accent: '#FF9F43',
};

export default function SetPinScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showSuccess, showError, showInfo } = useAlert();

  const bgColor = isDark ? '#111921' : '#F8F9FA';
  const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const textBodyColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPin = async () => {
    if (!/^[0-9]{4}$/.test(pin)) {
      showError('PIN must be exactly 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      showError('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await userService.setTransactionPin(pin);
      if (res?.success) {
        showSuccess('Transaction PIN set successfully');
        router.back();
      } else {
        showError(res?.message || 'Failed to set PIN');
      }
    } catch (e: any) {
      showError(e?.message || 'Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}> 
      <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Set Transaction PIN</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}> 
        <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}> 
          <Text style={[styles.label, { color: textBodyColor }]}>Enter 4-digit PIN</Text>
          <View style={[styles.inputWrapper, { borderColor, backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}> 
            <Ionicons name="lock-closed-outline" size={18} color={textBodyColor} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={pin}
              onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              placeholderTextColor={textBodyColor}
            />
          </View>

          <Text style={[styles.label, { color: textBodyColor, marginTop: 16 }]}>Confirm PIN</Text>
          <View style={[styles.inputWrapper, { borderColor, backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}> 
            <Ionicons name="lock-closed" size={18} color={textBodyColor} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={confirmPin}
              onChangeText={(t) => setConfirmPin(t.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              placeholderTextColor={textBodyColor}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: loading || pin.length !== 4 || confirmPin.length !== 4 ? (isDark ? '#374151' : '#D1D5DB') : theme.accent }]}
            disabled={loading || pin.length !== 4 || confirmPin.length !== 4}
            onPress={handleSetPin}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Set PIN</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.helper, { color: textBodyColor }]}>You'll use this PIN to authorize airtime, data and bill payments.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 16 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1 },
  label: { fontSize: 14, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: { flex: 1, fontSize: 18, letterSpacing: 8 },
  primaryButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  helper: { marginTop: 12, textAlign: 'center' },
});
