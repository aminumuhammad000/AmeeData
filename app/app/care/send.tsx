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
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/components/ThemeContext';
import { walletService, WalletData } from '@/services/wallet.service';
import { careService } from '@/services/care.service';
import { transactionService } from '@/services/transaction.service';

const { width } = Dimensions.get('window');

const PURPOSES = [
  { id: 'data', label: 'Data Support', icon: 'wifi-outline' },
  { id: 'airtime', label: 'Airtime', icon: 'call-outline' },
  { id: 'share', label: 'Share Care', icon: 'heart-outline' },
];

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function SendCareScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { isDark } = useTheme();
  
  const { phone, name, image, nickname, label } = searchParams;
  
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [purposes, setPurposes] = useState<any[]>(PURPOSES);
  const [selectedPurpose, setSelectedPurpose] = useState('data');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const viewShotRef = React.useRef<any>(null);

  useEffect(() => {
    fetchPurposes();
  }, []);

  const fetchPurposes = async () => {
    try {
      const res = await careService.getPurposes();
      if (res.success && res.data && res.data.length > 0) {
        setPurposes(res.data);
        setSelectedPurpose(res.data[0].label);
      } else {
        setSelectedPurpose('Data Support');
      }
    } catch (e) {
      console.log('Failed to fetch purposes, using defaults', e);
      setSelectedPurpose('Data Support');
    }
  };


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

  useEffect(() => {
    loadWallet();
    loadUser();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  };

  const loadWallet = async () => {
    try {
      const res = await walletService.getWallet();
      if (res.success) setWallet(res.data);
    } catch (e) {}
  };

  const handleSend = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 10) {
      Alert.alert('Invalid Amount', 'Minimum care amount is ₦10.00');
      return;
    }
    
    if (wallet && wallet.balance < numAmount) {
      Alert.alert('Insufficient Balance', 'You do not have enough funds in your main wallet.');
      return;
    }

    try {
      setLoading(true);
      const purposeObj = purposes.find(p => p._id === selectedPurpose || p.id === selectedPurpose);
      const fullMessage = `[${purposeObj?.name || purposeObj?.label || 'Care'}] ${message}`.trim();
      
      const res = await walletService.transferCareBalance(phone as string, numAmount, fullMessage);
      if (res.success) {
        setSuccess(true);
        if (res.data?.transactionId) {
          // Wait 1 second for the view to render completely, then capture and upload
          setTimeout(async () => {
            try {
              if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();
                const base64Str = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
                await transactionService.uploadReceipt(res.data.transactionId, base64Str);
              }
            } catch (err) {
              console.log('Failed to capture/upload receipt memory', err);
            }
          }, 1000);
        }
      } else {
        Alert.alert('Transfer Failed', res.message || 'Please try again');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const purposeObj = purposes.find(p => p._id === selectedPurpose || p.id === selectedPurpose);
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        
        {/* Animated Celebration Background */}
        <View style={StyleSheet.absoluteFill}>
           <Ionicons name="heart" size={300} color={theme.primary} style={{ position: 'absolute', top: -50, right: -100, opacity: 0.05 }} />
           <Ionicons name="heart" size={200} color={theme.primary} style={{ position: 'absolute', bottom: 50, left: -50, opacity: 0.05 }} />
        </View>

        <Text style={[styles.successTitle, { color: textColor }]}>Care Sent Successfully! ❤️</Text>
        <Text style={[styles.successSub, { color: textBodyColor }]}>Your generous support just reached {nickname || name}</Text>

        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
          {/* BRANDED CARE CARD (Mimicking Mockup) */}
          <View style={[styles.careCard, { backgroundColor: '#FFF5F8', padding: 16 }]}>
             {/* Header */}
             <View style={styles.cardHeader}>
                <View style={[styles.cardBrandBadge, { backgroundColor: '#6C2BD9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }]}>
                   <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>AMEEDATA ♥️</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E293B' }}>{new Date().toLocaleDateString()}</Text>
             </View>

             <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {/* Decorative Elements */}
                <Text style={{ position: 'absolute', top: -10, left: 10, fontSize: 32 }}>💖</Text>
                <Text style={{ position: 'absolute', right: 20, top: 20, fontSize: 24, opacity: 0.7 }}>✨</Text>
                <Text style={{ position: 'absolute', left: -10, bottom: 80, fontSize: 40 }}>🌸</Text>
                <Text style={{ position: 'absolute', right: -20, bottom: 50, fontSize: 48 }}>🌺</Text>
                <Text style={{ position: 'absolute', left: '10%', bottom: '20%', fontSize: 20 }}>❤️</Text>

                {/* Big Thank You Text */}
                <Text style={{ fontFamily: 'serif', fontSize: 48, fontStyle: 'italic', fontWeight: 'bold', color: '#F43F5E', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.05)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2 }}>
                   Thank You!
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 30 }}>
                   Your care makes a difference. ♡
                </Text>

                {/* Avatars */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24, paddingHorizontal: 10 }}>
                   <View style={{ padding: 4, borderRadius: 50, backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
                     <Image 
                       source={{ uri: currentUser?.profile_picture || `https://ui-avatars.com/api/?name=${currentUser?.first_name || 'Send'}+${currentUser?.last_name || 'er'}&background=FF9F43&color=fff` }} 
                       style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#F97316' }} 
                     />
                   </View>
                   <Text style={{ fontSize: 28, fontWeight: '900', color: '#6C2BD9' }}>→</Text>
                   <View style={{ padding: 4, borderRadius: 50, backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
                     <Image 
                       source={{ uri: (image as string) || `https://ui-avatars.com/api/?name=${(name as string)?.replace(' ', '+')}&background=6C2BD9&color=fff` }} 
                       style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#6C2BD9' }} 
                     />
                     <View style={{ position: 'absolute', right: -20, bottom: 0, backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 }}>
                       <Text style={{ fontSize: 9, color: '#6C2BD9', fontWeight: '700' }}>Together, we grow</Text>
                     </View>
                   </View>
                </View>
                
                <Text style={{ fontSize: 28, fontWeight: '900', color: '#1E293B', marginBottom: 4 }}>
                   {nickname || name}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#6C2BD9', marginBottom: 24 }}>
                   {label || 'AmeeData User'}
                </Text>

                <Text style={{ textAlign: 'center', fontSize: 13, lineHeight: 20, fontWeight: '600', color: '#475569', paddingHorizontal: 20, marginBottom: 30 }}>
                   We're grateful for your trust and for being part of a community that cares, shares, and uplifts. ♡
                </Text>

                {/* Amount Highlight */}
                <View style={{ backgroundColor: '#FFF', paddingHorizontal: 36, paddingVertical: 8, borderRadius: 20, transform: [{ rotate: '-2deg' }], shadowColor: '#10B981', shadowOpacity: 0.15, shadowRadius: 15, elevation: 4, marginBottom: 30 }}>
                   <Text style={{ fontSize: 56, fontWeight: '900', color: '#10B981', transform: [{ rotate: '2deg' }], letterSpacing: -2 }}>
                      <Text style={{ fontSize: 36 }}>₦</Text> {parseFloat(amount).toLocaleString()}
                   </Text>
                </View>

                {/* Spread Love pill */}
                <View style={{ backgroundColor: '#FFF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24, shadowColor: '#6C2BD9', shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
                   <Text style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: 16, fontWeight: '700', color: '#6C2BD9' }}>
                      Spread Love. Stay Connected.
                   </Text>
                </View>
             </View>

             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: 14, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                   <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' }}>
                     <Ionicons name="heart" size={18} color="#FFF" />
                   </View>
                   <View style={{ flex: 1 }}>
                     <Text style={{ fontSize: 14, fontWeight: '800', color: '#10B981' }}>Care Confirmed</Text>
                     <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '500' }}>Your kindness is received and deeply appreciated.</Text>
                   </View>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#334155' }}>REF: {Date.now().toString().slice(-8)}</Text>
             </View>
          </View>
        </ViewShot>

        <View style={styles.successActions}>
           <TouchableOpacity 
             style={[styles.doneBtnBranded, { backgroundColor: theme.primary }]}
             onPress={() => router.replace('/(tabs)/icare')}
           >
              <Text style={styles.doneBtnTextMain}>Back to Circle</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.shareBtn, { borderColor: theme.primary }]}
             onPress={async () => {
               try {
                 if (viewShotRef.current) {
                   const uri = await viewShotRef.current.capture();
                   if (await Sharing.isAvailableAsync()) {
                     await Sharing.shareAsync(uri);
                   } else {
                     Alert.alert('Sharing not available', 'Sharing is not available on this device');
                   }
                 }
               } catch (e) {
                 Alert.alert('Error', 'Failed to share receipt');
               }
             }}
           >
              <Ionicons name="share-social-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.shareBtnText, { color: theme.primary }]}>Share Care Proof</Text>
           </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ marginTop: 24 }} onPress={() => router.push('/transactions')}>
           <Text style={{ color: textBodyColor, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }}>View History</Text>
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Send Care</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Recipient Section */}
        <View style={styles.recipientSection}>
           <View style={styles.avatarWrapper}>
              <Image 
                source={{ uri: (image as string) || `https://ui-avatars.com/api/?name=${(name as string)?.replace(' ', '+')}&background=random` }} 
                style={styles.avatarLarge} 
              />
              <View style={styles.onlineBadge} />
           </View>
           <Text style={[styles.recipientName, { color: textColor }]}>{nickname || name}</Text>
           {label && (
             <View style={[styles.relLabel, { backgroundColor: 'rgba(108, 43, 217, 0.1)' }]}>
                <Text style={[styles.relLabelText, { color: theme.primary }]}>{label}</Text>
             </View>
           )}
           <Text style={[styles.recipientPhone, { color: textBodyColor }]}>{phone}</Text>
        </View>

        {/* Amount Input */}
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
           
           <Text style={[styles.balanceHint, { color: textBodyColor }]}>
             Wallet Balance: <Text style={{ color: theme.primary, fontWeight: '700' }}>₦{wallet?.balance?.toLocaleString() || '0'}</Text>
           </Text>
        </View>

        {/* Care Purpose */}
        <View style={styles.section}>
           <Text style={[styles.sectionTitle, { color: textColor }]}>Care Purpose</Text>
           <View style={styles.purposeGrid}>
              {purposes.map(p => (
                <TouchableOpacity 
                  key={p._id || p.id} 
                  style={[
                    styles.purposeItem, 
                    { backgroundColor: cardBg },
                    selectedPurpose === (p.label || p.id) && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                  onPress={() => setSelectedPurpose(p.label || p.id)}
                >
                   <Ionicons name={p.icon as any} size={22} color={selectedPurpose === (p.label || p.id) ? '#FFF' : theme.primary} />
                   <Text style={[styles.purposeLabel, { color: selectedPurpose === (p.label || p.id) ? '#FFF' : textBodyColor }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
           </View>
        </View>

        {/* Message */}
        <View style={styles.section}>
           <Text style={[styles.sectionTitle, { color: textColor }]}>Add a Personal Note (Optional)</Text>
           <View style={[styles.messageBox, { backgroundColor: cardBg }]}>
              <TextInput 
                style={[styles.messageInput, { color: textColor }]}
                placeholder="Write something sweet... ❤️"
                placeholderTextColor={textBodyColor}
                multiline
                numberOfLines={2}
                value={message}
                onChangeText={setMessage}
              />
           </View>
        </View>

        {/* Delivery Rules */}
        <View style={[styles.rulesCard, { backgroundColor: 'rgba(108, 43, 217, 0.05)' }]}>
           <View style={styles.rulesHeader}>
              <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
              <Text style={[styles.rulesTitle, { color: theme.primary }]}>Delivery Rules</Text>
           </View>
           <Text style={[styles.rulesDesc, { color: textBodyColor }]}>
             Care balance can be used for Airtime, Data, and Bills. It cannot be withdrawn to a bank account.
           </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Send Button */}
      <View style={[styles.footer, { backgroundColor: bgColor }]}>
         <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
            onPress={handleSend}
            disabled={loading}
         >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.sendBtnText}>Send ₦{amount || '0'} Care Now</Text>
                <Ionicons name="heart" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
         </TouchableOpacity>
      </View>
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
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  recipientSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#6C2BD9',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  relLabel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  relLabelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  recipientPhone: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  currency: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  quickScroll: {
    marginBottom: 16,
  },
  quickPin: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickPinText: {
    fontSize: 14,
    fontWeight: '700',
  },
  balanceHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  purposeItem: {
    width: (width - 60) / 3,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  purposeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageBox: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 60,
  },
  messageInput: {
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  rulesCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rulesDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 10,
  },
  successSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 40,
  },
  successCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 30,
    marginBottom: 60,
  },
  successCardText: {
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },
  doneBtn: {
    backgroundColor: '#FFF',
    width: width - 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 18,
    fontWeight: '800',
  },
  // NEW CARE CARD STYLES
  careCard: {
    width: width - 60,
    aspectRatio: 9 / 16,
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(108, 43, 217, 0.05)',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardBrandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBrandText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardAvatarLeft: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF9F43',
    zIndex: 2,
  },
  avatarConnector: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    marginRight: -10,
    zIndex: 3,
  },
  cardAvatarRight: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#6C2BD9',
    zIndex: 1,
  },
  cardRecipientName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 20,
    opacity: 0.8,
  },
  cardAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardAmountPrefix: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    marginRight: 4,
    marginTop: 4,
  },
  cardAmountValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#10B981',
  },
  cardMessageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 43, 217, 0.03)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cardMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  cardTagline: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  successActions: {
    width: '100%',
    paddingHorizontal: 30,
    gap: 12,
  },
  doneBtnBranded: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnTextMain: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  shareBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1.5,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '800',
  }
});
