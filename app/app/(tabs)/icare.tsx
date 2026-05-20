import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Animated,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
  RefreshControl,
  Platform
} from 'react-native';


import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Gesture, 
  GestureDetector, 
  GestureHandlerRootView 
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useTheme } from '@/components/ThemeContext';
import { userService } from '@/services/user.service';
import { walletService, WalletData } from '@/services/wallet.service';
import { transactionService } from '@/services/transaction.service';
import { careService, CareCircleMember } from '@/services/care.service';

export default function ICareScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [contactsError, setContactsError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [localContacts, setLocalContacts] = useState<any[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [ameeContacts, setAmeeContacts] = useState<any[]>([]);
  const [recentCare, setRecentCare] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [syncedPhones, setSyncedPhones] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'send' | 'circle' | 'requests'>('send');
  const [careCircle, setCareCircle] = useState<CareCircleMember[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(null);

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

  useFocusEffect(
    useCallback(() => {
      loadCachedContacts();
      loadWalletData();
      loadRecentCare();
      syncDeviceContacts();
      fetchCareCircle();
      
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 500); // Reduced delay

      return () => {
        clearTimeout(timer);
        setIsInitialLoad(true); // reset for next time
      };
    }, [])
  );

  const fetchCareCircle = async () => {
    try {
      const res = await careService.getCircle();
      if (res.success) {
        setCareCircle(res.data);
        AsyncStorage.setItem('cached_care_circle', JSON.stringify(res.data));
      }
    } catch (e) {
      console.log('Error fetching circle', e);
    }
  };

  const loadCachedContacts = async () => {
    try {
      const [cachedLocal, cachedAmee, cachedCircle, cachedSynced, cachedUser] = await Promise.all([
        AsyncStorage.getItem('cached_local_contacts'),
        AsyncStorage.getItem('cached_amee_contacts'),
        AsyncStorage.getItem('cached_care_circle'),
        AsyncStorage.getItem('cached_synced_phones'),
        AsyncStorage.getItem('user')
      ]);

      if (cachedLocal) setLocalContacts(JSON.parse(cachedLocal));
      if (cachedAmee) setAmeeContacts(JSON.parse(cachedAmee));
      if (cachedCircle) setCareCircle(JSON.parse(cachedCircle));
      if (cachedSynced) setSyncedPhones(JSON.parse(cachedSynced));
      if (cachedUser) setCurrentUser(JSON.parse(cachedUser));

      
      const lastSync = await AsyncStorage.getItem('last_contact_sync_time');
      if (lastSync) {
        // We can use this for cooldown logic
      }

    } catch (e) {
      console.log('Error loading cached contacts', e);
    } finally {
      setIsInitialLoad(false);
    }
  };

  const loadWalletData = async () => {
    try {
      const response = await walletService.getWallet();
      if (response.success && response.data) {
        setWallet(response.data);
      }
    } catch (e) {
      console.log('Error loading wallet details', e);
    }
  };

  const loadRecentCare = async () => {
    try {
      setLoadingRecent(true);
      const res = await transactionService.getTransactions(1, 20);
      if (res.success && Array.isArray(res.data)) {
        const careTx = res.data.filter((tx: any) => 
          tx.reference_number?.startsWith('CARE-') || 
          tx.description?.toLowerCase().includes('care')
        );
        setRecentCare(careTx.slice(0, 5));
      }
    } catch (e) {
      console.log('Error loading recent care tx', e);
    } finally {
      setLoadingRecent(false);
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadWalletData(), 
      loadRecentCare(), 
      syncDeviceContacts(true), // Force full sync on manual refresh
      fetchCareCircle()
    ]);
    setRefreshing(false);
  };

  const normalizePhone = (phone: string) => {
    // Filter out dial codes and short codes
    if (!phone || phone.includes('*') || phone.includes('#')) return null;
    
    let clean = phone.replace(/\D/g, '');
    
    // Nigerian mobile numbers are 11 digits (080...) or 10 digits (80...) without leading zero
    // After normalization to 234 format, they should be 13 digits.
    if (clean.length < 10) return null;

    if (clean.startsWith('0') && clean.length === 11) {
      clean = '234' + clean.slice(1);
    } else if (!clean.startsWith('234') && clean.length === 10) {
      clean = '234' + clean;
    }
    
    // Basic length check for international format robustness
    if (clean.length < 11 || clean.length > 15) return null;

    return clean;
  };

  const syncDeviceContacts = async (forceFullSync = false) => {
    try {
      const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours
      const lastSyncTime = await AsyncStorage.getItem('last_contact_sync_time');
      const now = Date.now();

      if (!forceFullSync && lastSyncTime && (now - parseInt(lastSyncTime) < COOLDOWN_MS)) {
        console.log('⏭️ Sync skipped: Cooldown active');
        setLoadingContacts(false);
        return;
      }

      setLoadingContacts(true);
      const { status } = await Contacts.requestPermissionsAsync();

      
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.PhoneNumbers, 
            Contacts.Fields.Image,
            Contacts.Fields.ID,
            // @ts-ignore
            'timesContacted',
            // @ts-ignore
            'lastTimeContacted'
          ],
        });
        
        if (data.length > 0) {
          const uniqueContactsMap = new Map();
          data.forEach(c => {
            const phoneNumberObj = c.phoneNumbers && c.phoneNumbers.length > 0 ? c.phoneNumbers[0] : null;
            const rawPhone = phoneNumberObj && typeof phoneNumberObj.number === 'string' ? phoneNumberObj.number : '';
            if (!rawPhone) return;

            const normalized = normalizePhone(rawPhone);
            // Stricter filtering: must be a valid length and not just a short code
            if (normalized && normalized.length >= 10 && !uniqueContactsMap.has(normalized)) {
              uniqueContactsMap.set(normalized, {
                id: c.id,
                name: c.name || 'Unknown',
                phone: rawPhone,
                normalized: normalized,
                image: c.imageAvailable && c.image?.uri ? c.image.uri : null,
                timesContacted: (c as any).timesContacted || 0,
                lastTimeContacted: (c as any).lastTimeContacted || 0
              });
            }
          });
          
          const deviceContacts = Array.from(uniqueContactsMap.values());
          setLocalContacts(deviceContacts);

          
          const allNormalized = deviceContacts.map(c => c.normalized).filter(Boolean);
          
          // Optimization: Only sync phones that haven't been synced before
          let phonesToSync = allNormalized;
          if (!forceFullSync && syncedPhones.length > 0) {
            phonesToSync = allNormalized.filter(p => !syncedPhones.includes(p));
          }

          if (phonesToSync.length > 0) {
            console.log(`🔄 Syncing ${phonesToSync.length} new contacts in batches...`);
            
            // BATCHING: Chunk phones into groups of 50
            const batchSize = 50;
            const batches = [];
            for (let i = 0; i < phonesToSync.length; i += batchSize) {
              batches.push(phonesToSync.slice(i, i + batchSize));
            }

            let newMatches: any[] = [];
            for (const batch of batches) {
              try {
                const res = await userService.syncContacts(batch);
                if (res.success && Array.isArray(res.data)) {
                  newMatches = [...newMatches, ...res.data];
                }
              } catch (e) {
                console.log('Batch sync failed', e);
              }
            }

            if (newMatches.length > 0 || forceFullSync) {
              const updatedAmeeContacts = forceFullSync 
                ? newMatches 
                : [...ameeContacts, ...newMatches.filter(newC => !ameeContacts.some(oldC => (oldC._id === newC._id || (oldC as any).id === newC._id)))];
              
              setAmeeContacts(updatedAmeeContacts);
              setSyncedPhones(allNormalized);

              // Save updated caches for instant load next time
              await Promise.all([
                AsyncStorage.setItem('cached_local_contacts', JSON.stringify(deviceContacts)),
                AsyncStorage.setItem('cached_amee_contacts', JSON.stringify(updatedAmeeContacts)),
                AsyncStorage.setItem('cached_synced_phones', JSON.stringify(allNormalized)),
                AsyncStorage.setItem('last_contact_sync_time', now.toString())
              ]);
            }

          } else {
             // Even if no new sync needed, update local contacts cache and amee cache to be safe
             await Promise.all([
                AsyncStorage.setItem('cached_local_contacts', JSON.stringify(deviceContacts)),
                AsyncStorage.setItem('cached_amee_contacts', JSON.stringify(ameeContacts))
             ]);
          }

        }
      } else {
        setContactsError('Contacts permission denied');
      }
    } catch (err) {
      console.log('Error reading contacts', err);
      setContactsError('Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  };


  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const tabs: ('send' | 'circle' | 'requests')[] = ['send', 'circle', 'requests'];
  
  const handleTabChange = (direction: 'left' | 'right') => {
    const currentIndex = tabs.indexOf(activeTab);
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.velocityX < -500) {
        runOnJS(handleTabChange)('left');
      } else if (e.velocityX > 500) {
        runOnJS(handleTabChange)('right');
      }
    });

  const handleTransfer = (phone: string, name: string, extras?: { image?: string; nickname?: string; label?: string }) => {
     router.push({
       pathname: '/care/send',
       params: { 
         phone, 
         name, 
         image: extras?.image || '',
         nickname: extras?.nickname || '',
         label: extras?.label || ''
       }
     });
  };

  const handleAddToCircle = async (contact: any) => {
    try {
      const res = await careService.addMember({
        phone_number: contact.phone,
        member_id: contact._id,
        nickname: contact.name
      });
      if (res.success) {
        Alert.alert('Success', `${contact.name} added to your Care Circle!`);
        fetchCareCircle();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add member');
    }
  };

  const handleRequestCare = (phone: string, name: string, extras?: any) => {
    router.push({
      pathname: '/care/request',
      params: { 
        phone, 
        name, 
        image: extras?.image || '',
        nickname: extras?.nickname || '',
        label: extras?.label || '',
        member_id: extras?.member_id || ''
      }
    });
  };

  const handleInvite = (phone: string) => {
    const text = "Hey! ❤️ I'm using AmeeData to stay connected. It's the easiest and cheapest way to buy Airtime, Data, and pay Bills in Nigeria. You can also send and receive money (Care) within the community for free! 🚀 Download Now: https://play.google.com/store/apps/details?id=com.ameedata.app";
    Linking.openURL(`sms:${phone}${phone.includes('?') ? '&' : '?'}body=${encodeURIComponent(text)}`);
  };

  // Process and sort contacts: Managed Circle (Pinned first), Recent, Amee Circle, Alphabetical
  const processedContacts = useMemo(() => {
    // Helper to extract phone from recent care transactions
    const recentPhones = recentCare.map(tx => {
       const match = tx.description?.match(/\d{10,}/);
       return match ? match[0].slice(-10) : '';
    }).filter(p => p !== '');

    const userLast10 = currentUser?.phone_number ? currentUser.phone_number.replace(/\D/g, '').slice(-10) : '';

    const list = localContacts.filter(c => {
      const isSearchMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
      const isSelf = userLast10 && c.normalized?.slice(-10) === userLast10;
      return isSearchMatch && !isSelf;
    }).map(contact => {
      const last10 = contact.normalized?.slice(-10);
      
      const ameeUser = ameeContacts.find(a => 
        a.phone_number?.replace(/\D/g, '').endsWith(last10)
      );

      const isAmee = !!ameeUser;
      
      const isRecent = recentPhones.includes(last10);

      // Check if in managed Care Circle
      const circleMember = careCircle.find(m => 
        m.member_id.phone_number?.replace(/\D/g, '').endsWith(last10)
      );

      return { 
        ...contact, 
        isAmee, 
        _id: ameeUser?._id || (ameeUser as any)?.id,
        ameeProfile: ameeUser,
        isRecent, 
        isNew: ameeUser?.created_at ? (new Date().getTime() - new Date(ameeUser.created_at).getTime() < 7 * 24 * 60 * 60 * 1000) : false,
        isCircle: !!circleMember,
        isPinned: circleMember?.is_pinned || false,
        nickname: circleMember?.nickname,
        label: circleMember?.relationship_label
      };
    });



    // Sort: 1. Pinned Circle, 2. Recent App Transactions, 3. Engagement (timesContacted), 4. Amee users, 5. Alphabetical
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (a.isRecent !== b.isRecent) return a.isRecent ? -1 : 1;

      if (b.timesContacted !== a.timesContacted) {
         return b.timesContacted - a.timesContacted;
      }

      if (a.isAmee !== b.isAmee) return a.isAmee ? -1 : 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [localContacts, ameeContacts, searchQuery, recentCare, careCircle]);

  const newOnAmee = useMemo(() => {
    return processedContacts.filter(c => c.isAmee && c.isNew && !c.isCircle).slice(0, 5);
  }, [processedContacts]);


  const formatName = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length > 2) {
      return `${words[0]} ${words[1]}...`;
    }
    return name;
  };

  // Optimized Contact Item Component
  const ContactItem = useMemo(() => React.memo(({ item }: { item: any }) => (
    <View style={[styles.contactListItem, { backgroundColor: cardBg }]}>
        <Image 
          source={{ uri: item.isAmee ? (item.ameeProfile?.profile_picture || item.image) : item.image || `https://ui-avatars.com/api/?name=${item.name.replace(' ', '+')}&background=random` }} 
          style={[styles.avatarList, item.isAmee && { borderWidth: 2, borderColor: theme.primary }]} 
        />

        <View style={styles.contactInfo}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[styles.contactName, { color: textColor }]} numberOfLines={1}>
               {item.nickname || formatName(item.name)}
            </Text>
            {item.label && (
               <View style={[styles.labelPillMini, { backgroundColor: 'rgba(108, 43, 217, 0.1)' }]}>
                  <Text style={[styles.labelTextMini, { color: theme.primary }]}>{item.label}</Text>
               </View>
            )}
            {item.isAmee && <Ionicons name="checkmark-circle" size={14} color={theme.primary} />}
          </View>
          <Text style={[styles.contactSub, { color: textBodyColor }]}>{item.phone}</Text>
        </View>
        {item.isAmee ? (
          <TouchableOpacity 
             style={[styles.actionBtn, { backgroundColor: theme.primary }]}
             onPress={() => activeTab === 'requests' 
               ? handleRequestCare(item.phone, item.name, { image: item.isAmee ? (item.ameeProfile?.profile_picture || item.image) : item.image, nickname: item.nickname, label: item.label, member_id: item._id }) 
               : handleTransfer(item.phone, item.name, { image: item.isAmee ? (item.ameeProfile?.profile_picture || item.image) : item.image, nickname: item.nickname, label: item.label })
             }
          >
             <Text style={styles.actionBtnText}>{activeTab === 'requests' ? 'Request' : 'Send Care'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
             style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.primary }]}
             onPress={() => handleInvite(item.phone)}
          >
             <Ionicons name="person-add-outline" size={12} color={theme.primary} />
             <Text style={[styles.actionBtnText, { color: theme.primary, fontSize: 10 }]}>Invite</Text>
          </TouchableOpacity>
        )}
    </View>
  )), [cardBg, activeTab, textColor, textBodyColor]); // Re-memoize if global styles change


  const ContactSkeleton = () => {
    const shimmerValue = React.useRef(new Animated.Value(0.3)).current;

    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    return (
      <Animated.View style={[styles.contactListItem, { backgroundColor: cardBg, opacity: shimmerValue }]}>
        <View style={[styles.avatarList, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
        <View style={styles.contactInfo}>
          <View style={{ width: '60%', height: 12, backgroundColor: isDark ? '#374151' : '#E5E7EB', borderRadius: 4, marginBottom: 8 }} />
          <View style={{ width: '40%', height: 10, backgroundColor: isDark ? '#4B5563' : '#F3F4F6', borderRadius: 3 }} />
        </View>
        <View style={{ width: 75, height: 30, backgroundColor: isDark ? '#374151' : '#E5E7EB', borderRadius: 15 }} />
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        
        <View style={[styles.header, { backgroundColor: bgColor }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: textColor }]}>I Care About You <Ionicons name="heart" size={18} color={theme.primary}/></Text>
            <Text style={[styles.headerSubtitle, { color: textBodyColor }]}>Send Care. Spread Love.</Text>
          </View>
          <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/transactions')}>
            <Ionicons name="time-outline" size={12} color={theme.primary} />
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
        </View>

        <GestureDetector gesture={swipeGesture}>
          <FlatList
            data={processedContacts}
            renderItem={({ item }) => <ContactItem item={item} />}
            keyExtractor={(item, index) => `${item.phone}-${index}`}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
            }
            ListHeaderComponent={
              <View>
                <View style={styles.balanceSection}>
                  <View style={[styles.balanceCard, { backgroundColor: cardBg }]}>
                    <View style={styles.walletHeader}>
                       <View style={styles.walletLabelBox}>
                          <Ionicons name="wallet-outline" size={16} color={theme.primary} />
                          <Text style={[styles.walletTitle, { color: textBodyColor }]}>Main Wallet Balance</Text>
                       </View>
                       <TouchableOpacity onPress={() => router.push('/(tabs)/wallet')}>
                          <Ionicons name="add-circle" size={24} color={theme.primary} />
                       </TouchableOpacity>
                    </View>
                    
                    <Text style={[styles.balanceValue, { color: textColor }]}>
                       {formatCurrency(wallet?.balance || 0)}
                    </Text>

                    <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#F1F5F9' }]} />
                    
                    <View style={styles.walletFooter}>
                       <View>
                          <Text style={[styles.careTitle, { color: textBodyColor }]}>Total Care Sent</Text>
                          <Text style={[styles.careValue, { color: theme.primary }]}>₦0.00</Text>
                       </View>
                       <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[styles.careTitle, { color: textBodyColor }]}>Active Requests</Text>
                          <Text style={[styles.careValue, { color: '#FF9F43' }]}>0</Text>
                       </View>
                    </View>
                  </View>
                </View>

                <View style={styles.tabContainer}>
                   <TouchableOpacity style={[styles.tabBtn, activeTab === 'send' && styles.tabBtnActive]} onPress={() => setActiveTab('send')}>
                      <Ionicons name="paper-plane" size={18} color={activeTab === 'send' ? theme.primary : textBodyColor} />
                      <Text style={[styles.tabText, { color: activeTab === 'send' ? theme.primary : textBodyColor }]}>Send Care</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={[styles.tabBtn, activeTab === 'circle' && styles.tabBtnActive]} onPress={() => setActiveTab('circle')}>
                      <Ionicons name="people" size={18} color={activeTab === 'circle' ? theme.primary : textBodyColor} />
                      <Text style={[styles.tabText, { color: activeTab === 'circle' ? theme.primary : textBodyColor }]}>Care Circle</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]} onPress={() => setActiveTab('requests')}>
                      <Ionicons name="heart-half" size={18} color={activeTab === 'requests' ? theme.primary : textBodyColor} />
                      <Text style={[styles.tabText, { color: activeTab === 'requests' ? theme.primary : textBodyColor }]}>Requests</Text>
                   </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                  <View style={[styles.searchBox, { backgroundColor: cardBg }]}>
                     <Ionicons name="search" size={20} color={textBodyColor} style={{ marginLeft: 12 }} />
                     <TextInput 
                       style={[styles.searchInput, { color: textColor }]}
                       placeholder="Search by name or phone number"
                       placeholderTextColor={textBodyColor}
                       value={searchQuery}
                       onChangeText={setSearchQuery}
                     />
                  </View>
                </View>

                {!searchQuery && careCircle.length > 0 && (activeTab as any) !== 'requests' && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: textColor }]}>Care Circle (Favorites)</Text>
                      <TouchableOpacity onPress={() => router.push('/care/manage')}><Text style={[styles.manageText, { color: theme.primary }]}>Manage</Text></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesScroll}>
                       {careCircle.map((member: any, idx: number) => (
                         <TouchableOpacity 
                           key={idx} 
                           style={styles.favoriteItem} 
                           onPress={() => activeTab === 'requests'
                              ? handleRequestCare(member.member_id.phone_number, member.nickname || member.member_id.first_name, { image: member.member_id.profile_picture, nickname: member.nickname, label: member.relationship_label, member_id: member.member_id._id })
                              : handleTransfer(member.member_id.phone_number, member.nickname || member.member_id.first_name, { image: member.member_id.profile_picture, nickname: member.nickname, label: member.relationship_label })
                           }
                         >
                            <View style={styles.avatarContainer}>
                               <Image 
                                 source={{ uri: member.member_id.profile_picture || `https://ui-avatars.com/api/?name=${member.member_id.first_name}+${member.member_id.last_name}&background=random` }} 
                                 style={styles.avatarFav} 
                               />
                               {member.is_pinned && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
                            </View>
                            <Text style={[styles.favName, { color: textColor }]} numberOfLines={1}>{member.nickname || member.member_id.first_name}</Text>
                            <View style={styles.favPill}>
                               <Text style={styles.favPillText}>{member.relationship_label || 'Friend'}</Text>
                            </View>
                         </TouchableOpacity>
                       ))}
                    </ScrollView>
                  </View>
                )}

                {!searchQuery && newOnAmee.length > 0 && activeTab === 'send' && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: textColor }]}>New on AmeeData 🎉</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesScroll}>
                       {newOnAmee.map((member: any, idx: number) => (
                         <TouchableOpacity 
                           key={idx} 
                           style={styles.favoriteItem} 
                           onPress={() => handleTransfer(member.phone, member.nickname || member.name, { image: member.image, nickname: member.nickname, label: member.label })}
                         >
                            <View style={styles.avatarContainer}>
                               <Image 
                                 source={{ uri: member.ameeProfile?.profile_picture || member.image || `https://ui-avatars.com/api/?name=${member.name}&background=random` }} 
                                 style={styles.avatarFav} 
                               />
                               <View style={[styles.activeDot, { backgroundColor: '#10B981' }]} />
                            </View>
                            <Text style={[styles.favName, { color: textColor }]} numberOfLines={1}>{member.nickname || member.name.split(' ')[0]}</Text>
                            <View style={[styles.favPill, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                               <Text style={[styles.favPillText, { color: '#10B981', fontSize: 8 }]}>NEW</Text>
                            </View>
                         </TouchableOpacity>
                       ))}
                    </ScrollView>
                  </View>
                )}

                {!searchQuery && recentCare.length > 0 && activeTab === 'send' && (
                  <View style={styles.sectionContainer}>
                     <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Care</Text>
                        <TouchableOpacity onPress={() => router.push('/transactions')}><Text style={[styles.manageText, { color: theme.primary }]}>See All</Text></TouchableOpacity>
                     </View>
                     {recentCare.map((tx: any, idx: number) => {
                        const relatedUser = tx.related_user_id;
                        const userName = relatedUser 
                          ? `${relatedUser.first_name || ''} ${relatedUser.last_name || ''}`.trim() 
                          : (tx.description || 'Unknown');
                        const userAvatar = relatedUser?.profile_picture 
                          || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6C2BD9&color=fff`;
                        const isSent = tx.type === 'transfer';
                        const timeAgo = tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Today';
                        
                        return (
                         <View key={idx} style={[styles.contactListItem, { backgroundColor: cardBg }]}>
                            <Image 
                              source={{ uri: userAvatar }} 
                              style={[styles.avatarList, { borderWidth: 2, borderColor: isSent ? '#EF4444' : '#10B981' }]} 
                            />
                            <View style={styles.contactInfo}>
                               <Text style={[styles.contactName, { color: textColor }]} numberOfLines={1}>{userName}</Text>
                               <Text style={[styles.contactSub, { color: textBodyColor }]}>
                                  {isSent ? '❤️ Care Sent' : '💚 Care Received'}
                               </Text>
                            </View>
                            <View style={styles.amountInfo}>
                               <Text style={[styles.contactDate, { color: textBodyColor }]}>{timeAgo}</Text>
                               <Text style={[styles.amountText, { color: isSent ? '#EF4444' : '#10B981' }]}>
                                  {isSent ? '-' : '+'}₦{tx.amount}
                               </Text>
                            </View>
                         </View>
                        );
                      })}
                  </View>
                )}

                <View style={styles.sectionContainer}>
                   <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: textColor }]}>
                        {activeTab === 'requests' ? 'Request Care From' : (searchQuery ? 'Search Results' : 'Find Friends on AmeeData')}
                      </Text>
                   </View>
                   {((isInitialLoad || loadingContacts) && processedContacts.length === 0) && (
                      <View style={{ paddingHorizontal: 16 }}>
                        <ContactSkeleton />
                        <ContactSkeleton />
                        <ContactSkeleton />
                      </View>
                   )}
                   {contactsError && (
                      <Text style={{ color: '#EF4444', textAlign: 'center', margin: 20 }}>{contactsError}</Text>
                   )}
                </View>
              </View>
            }
            ListFooterComponent={
              <View style={{ paddingBottom: 100 }}>
                <View style={styles.footerInfoBox}>
                   <View style={styles.footerIcon}>
                      <Ionicons name="gift-outline" size={24} color={theme.primary} />
                   </View>
                   <View style={{ flex: 1 }}>
                      <Text style={[styles.footerTitle, { color: theme.primary }]}>Care stays in the community</Text>
                      <Text style={[styles.footerDesc, { color: textBodyColor }]}>Care balance can be used for airtime, data, bills and shared with others. It cannot be withdrawn.</Text>
                   </View>
                   <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                </View>
              </View>
            }
          />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 10 },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSubtitle: { fontSize: 10, marginTop: 2 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(108, 43, 217, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4 },
  historyBtnText: { color: '#6C2BD9', fontSize: 10, fontWeight: '600' },
  balanceSection: { paddingHorizontal: 16, marginTop: 10 },
  balanceCard: { borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  walletLabelBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletTitle: { fontSize: 12, fontWeight: '600' },
  balanceValue: { fontSize: 28, fontWeight: '800', marginBottom: 15 },
  divider: { height: 1, width: '100%', marginBottom: 15 },
  walletFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  careTitle: { fontSize: 10, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  careValue: { fontSize: 14, fontWeight: '700' },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 16, marginTop: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#6C2BD9' },
  tabText: { fontSize: 12, fontWeight: '600' },
  searchContainer: { paddingHorizontal: 16, marginTop: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, height: 50 },
  searchInput: { flex: 1, height: '100%', paddingHorizontal: 12, fontSize: 14 },
  sectionContainer: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  manageText: { fontSize: 13, fontWeight: '600' },
  favoritesScroll: { paddingHorizontal: 16, gap: 16 },
  favoriteItem: { alignItems: 'center', width: 64 },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, position: 'relative', marginBottom: 8 },
  avatarFav: { width: 50, height: 50, borderRadius: 25 },
  activeDot: { position: 'absolute', right: 2, bottom: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFF' },
  favName: { fontSize: 10, fontWeight: '500', marginBottom: 6, textAlign: 'center' },
  favPill: { backgroundColor: 'rgba(108, 43, 217, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  favPillText: { color: '#6C2BD9', fontSize: 9, fontWeight: '700' },
  labelPillMini: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, marginLeft: 4 },
  labelTextMini: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  contactListItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 16, marginBottom: 10, borderRadius: 16 },
  avatarList: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF9F43', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  contactSub: { fontSize: 12 },
  amountInfo: { alignItems: 'flex-end' },
  contactDate: { fontSize: 10, marginBottom: 2 },
  amountText: { fontSize: 14, fontWeight: '700' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4, minWidth: 75, justifyContent: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  footerInfoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(108, 43, 217, 0.05)', marginHorizontal: 16, marginTop: 32, padding: 16, borderRadius: 16, gap: 16 },
  footerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(108, 43, 217, 0.1)', justifyContent: 'center', alignItems: 'center' },
  footerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  footerDesc: { fontSize: 11, lineHeight: 16 }
});
