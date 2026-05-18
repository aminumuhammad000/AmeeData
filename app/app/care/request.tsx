import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/components/ThemeContext';
import { careService } from '@/services/care.service';

const { width } = Dimensions.get('window');

const PURPOSES = [
  { id: 'data', label: 'Data Support', icon: 'wifi-outline' },
  { id: 'airtime', label: 'Airtime', icon: 'call-outline' },
  { id: 'share', label: 'Cash Support', icon: 'cash-outline' },
];

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function RequestCareScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { isDark } = useTheme();
  
  const { phone, name, image, nickname, label, member_id } = searchParams;
  
  const [amount, setAmount] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('data');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    console.log('📱 RequestCareScreen params:', searchParams);
  }, [searchParams]);

  const theme = {
    primary: '#6C2BD9',
    accent: '#FF9F43',
    backgroundLight: '#F8F9FA',
    backgroundDark: '#111921',
    textHeadings: '#1E293B',
    textBody: '#475569',
  };

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';

  const handleRequest = async () => {
    const numAmount = parseFloat(amount);
    
    if (!member_id || !selectedPurpose || !numAmount) {
      Alert.alert('Missing Info', `Please ensure all details are filled. ID: ${member_id ? 'OK' : 'Missing'}`);
      return;
    }

    if (numAmount < 10) {
      Alert.alert('Invalid Amount', 'Minimum request amount is ₦10.00');
      return;
    }

    try {
      setLoading(true);
      const res = await careService.requestCare({
        provider_id: member_id as string,
        amount: numAmount,
        purpose: selectedPurpose,
        message: message
      });
      
      if (res.success) {
        setSuccess(true);
      } else {
        Alert.alert('Request Failed', res.message || 'Please try again');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        
        <View style={styles.successIconContainer}>
           <Ionicons name="paper-plane" size={80} color={theme.primary} />
           <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="checkmark" size={24} color="#FFF" />
           </View>
        </View>

        <Text style={[styles.successTitle, { color: textColor }]}>Request Sent!</Text>
        <Text style={[styles.successSub, { color: textBodyColor }]}>We've notified {nickname || name} about your request.</Text>

        <TouchableOpacity 
          style={[styles.doneBtnBranded, { backgroundColor: theme.primary, width: width - 80 }]}
          onPress={() => router.replace('/(tabs)/icare')}
        >
           <Text style={styles.doneBtnTextMain}>Back to Circle</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Request Care</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.recipientSection}>
           <Image 
             source={{ uri: (image as string) || `https://ui-avatars.com/api/?name=${(name as string)?.replace(' ', '+')}&background=random` }} 
             style={styles.avatarSmall} 
           />
           <Text style={[styles.instruction, { color: textColor }]}>
             Ask <Text style={{ fontWeight: '800', color: theme.primary }}>{nickname || name}</Text> for support
           </Text>
        </View>

        <View style={styles.inputSection}>
           <View style={[styles.amountInputBox, { backgroundColor: cardBg }]}>
              <Text style={[styles.currency, { color: textColor }]}>₦</Text>
              <TextInput 
                style={[styles.amountInput, { color: textColor }]}
                placeholder="0.00"
                placeholderTextColor={textBodyColor}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
           </View>
           
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
              {QUICK_AMOUNTS.map(q => (
                <TouchableOpacity 
                   key={q} 
                   style={[styles.quickPin, { backgroundColor: cardBg }]}
                   onPress={() => setAmount(q.toString())}
                >
                   <Text style={[styles.quickPinText, { color: textColor }]}>₦{q}</Text>
                </TouchableOpacity>
              ))}
           </ScrollView>
        </View>

        <View style={styles.section}>
           <Text style={[styles.sectionTitle, { color: textColor }]}>What's this for?</Text>
           <View style={styles.purposeGrid}>
              {PURPOSES.map(p => (
                <TouchableOpacity 
                  key={p.id} 
                  style={[
                    styles.purposeItem, 
                    { backgroundColor: cardBg },
                    selectedPurpose === p.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                  onPress={() => setSelectedPurpose(p.id)}
                >
                   <Ionicons name={p.icon as any} size={20} color={selectedPurpose === p.id ? '#FFF' : theme.primary} />
                   <Text style={[styles.purposeLabel, { color: selectedPurpose === p.id ? '#FFF' : textBodyColor }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
           </View>
        </View>

        <View style={styles.section}>
           <Text style={[styles.sectionTitle, { color: textColor }]}>Add a Message (Optional)</Text>
           <View style={[styles.messageBox, { backgroundColor: cardBg }]}>
              <TextInput 
                style={[styles.messageInput, { color: textColor }]}
                placeholder="Briefly explain your request..."
                placeholderTextColor={textBodyColor}
                multiline
                numberOfLines={2}
                value={message}
                onChangeText={setMessage}
              />
           </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: bgColor }]}>
         <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
            onPress={handleRequest}
            disabled={loading}
         >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.sendBtnText}>Send Request</Text>
            )}
         </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { paddingBottom: 40 },
  recipientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
    gap: 12,
  },
  avatarSmall: { width: 44, height: 44, borderRadius: 22 },
  instruction: { fontSize: 16, fontWeight: '500' },
  inputSection: { paddingHorizontal: 20, marginBottom: 24 },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  currency: { fontSize: 18, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '700' },
  quickScroll: { marginBottom: 8 },
  quickPin: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  quickPinText: { fontSize: 12, fontWeight: '700' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  purposeGrid: { flexDirection: 'row', gap: 10 },
  purposeItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  purposeLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  messageBox: { borderRadius: 16, padding: 12, minHeight: 60 },
  messageInput: { fontSize: 13, textAlignVertical: 'top' },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  sendBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  successIconContainer: { marginBottom: 30, position: 'relative' },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  successTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  successSub: { fontSize: 15, textAlign: 'center', paddingHorizontal: 40, marginBottom: 40 },
  doneBtnBranded: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  doneBtnTextMain: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
