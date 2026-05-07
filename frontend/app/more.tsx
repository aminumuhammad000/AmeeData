import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const theme = {
  primary: '#0A2540',
  accent: '#FF9F43',
  success: '#00D4AA',
  error: '#FF5B5B',
};

export default function MoreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#000000' : '#F9FAFB';
  const cardBgColor = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const textBodyColor = isDark ? '#D1D5DB' : '#6B7280';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const [searchQuery, setSearchQuery] = useState('');

  const featuredServices = [
    {
      id: 'airtime',
      title: 'Airtime',
      icon: 'phone-portrait',
      color: '#3B82F6',
      route: '/buy-airtime',
    },
    {
      id: 'data',
      title: 'Data Bundle',
      icon: 'wifi',
      color: '#10B981',
      route: '/buy-data',
    },
    {
      id: 'electricity',
      title: 'Electricity',
      icon: 'flash',
      color: '#EAB308',
      route: '/buy-electricity',
    },
    {
      id: 'cable',
      title: 'Cable TV',
      icon: 'tv',
      color: '#9333EA',
      route: null, // Coming soon
    }
  ];

  const allServices = [
    {
      id: 'education',
      title: 'Exam PIN',
      description: 'WAEC, NECO Pins & NABTEB',
      icon: 'school-outline',
      color: '#F43F5E',
      route: '/buy-exampin',
    },
    {
      id: 'airtime-cash',
      title: 'Airtime2Cash',
      description: 'Convert excess airtime to cash',
      icon: 'cash-outline',
      color: '#EC4899',
      route: '/airtime-to-cash',
    },
    {
      id: 'betting',
      title: 'Betting',
      description: 'Fund your betting wallets instantly',
      icon: 'football-outline',
      color: '#F59E0B',
      route: null,
    },
    {
      id: 'insurance',
      title: 'Insurance',
      description: 'Pay for vehicle & life insurance',
      icon: 'shield-checkmark-outline',
      color: '#3B82F6',
      route: null,
    },
    {
      id: 'transport',
      title: 'Transport',
      description: 'Book bus & flight tickets',
      icon: 'bus-outline',
      color: '#8B5CF6',
      route: null,
    },
    {
      id: 'giftcards',
      title: 'Gift Cards',
      description: 'Buy & Sell international gift cards',
      icon: 'gift-outline',
      color: '#EC4899',
      route: null,
    },
    {
      id: 'virtual-card',
      title: 'Virtual Card',
      description: 'Create USD & NGN virtual cards',
      icon: 'card-outline',
      color: '#14B8A6',
      route: null,
    },
    {
      id: 'water',
      title: 'Water Bill',
      description: 'Pay for water supply services',
      icon: 'water-outline',
      color: '#0EA5E9',
      route: null,
    },
    {
      id: 'waste',
      title: 'Waste Management',
      description: 'Pay for waste collection services',
      icon: 'trash-outline',
      color: '#10B981',
      route: null,
    },
    {
      id: 'tax',
      title: 'Government Tax',
      description: 'Pay state and federal taxes',
      icon: 'receipt-outline',
      color: '#6366F1',
      route: null,
    },
  ];

  const filteredServices = allServices.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServicePress = (service: any) => {
    if (service.route) {
      router.push(service.route);
    } else {
      Alert.alert(
        'Coming Soon',
        `${service.title} is currently under development and will be available soon.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBgColor }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>More Services</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }]}>
          <Ionicons name="search" size={20} color={textBodyColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search services..."
            placeholderTextColor={textBodyColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={textBodyColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!searchQuery && (
          <>
            {/* Featured Services (Icons) */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>Essentials</Text>
            <View style={styles.featuredGrid}>
              {featuredServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.featuredItem}
                  onPress={() => handleServicePress(service)}
                >
                  <View style={[styles.featuredIcon, { backgroundColor: `${service.color}15` }]}>
                    <Ionicons name={service.icon as any} size={28} color={service.color} />
                  </View>
                  <Text style={[styles.featuredTitle, { color: textColor }]}>{service.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* List Services */}
        <Text style={[styles.sectionTitle, { color: textColor, marginTop: searchQuery ? 0 : 24 }]}>All Services</Text>
        <View style={styles.listContainer}>
          {filteredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.listItem, { backgroundColor: cardBgColor, borderColor: isDark ? '#333' : '#F3F4F6' }]}
              onPress={() => handleServicePress(service)}
            >
              <View style={[styles.listIconContainer, { backgroundColor: `${service.color}15` }]}>
                <Ionicons name={service.icon as any} size={24} color={service.color} />
              </View>
              <View style={styles.listContent}>
                <Text style={[styles.listTitle, { color: textColor }]}>{service.title}</Text>
                <Text style={[styles.listDescription, { color: textBodyColor }]}>{service.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
          {filteredServices.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: textBodyColor }}>No services found</Text>
            </View>
          )}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  placeholder: { width: 32 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 44, borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  featuredGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  featuredItem: { alignItems: 'center', width: '23%' },
  featuredIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  featuredTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  listContainer: { gap: 10 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1,
  },
  listIconContainer: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  listContent: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  listDescription: { fontSize: 12 },
});
