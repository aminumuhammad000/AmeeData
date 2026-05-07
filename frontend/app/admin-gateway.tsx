import { useAlert } from '@/components/AlertContext';
import { useTheme } from '@/components/ThemeContext';
import { walletService } from '@/services/wallet.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const THEME = {
  primary: '#0A2540',
  accent: '#FF9F43',
  success: '#00D4AA',
  error: '#FF5B5B',
};

export default function AdminGatewaySettings() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { showSuccess, showError } = useAlert();
  
  const [currentGateway, setCurrentGateway] = useState<string>('both');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const bgColor = isDark ? '#111921' : '#F8F9FA';
  const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1E293B';
  const textBodyColor = isDark ? '#9CA3AF' : '#475569';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await walletService.getGatewaySettings();
      if (res.success) {
        setCurrentGateway(res.data.gateway);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (gateway: 'payrant' | 'vtstack' | 'both' | 'none') => {
    try {
      setUpdating(true);
      const res = await walletService.updateGatewaySettings(gateway);
      if (res.success) {
        setCurrentGateway(gateway);
        showSuccess(`Display mode updated to ${gateway.toUpperCase()}`);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  const GatewayOption = ({ 
    id, 
    title, 
    description, 
    icon 
  }: { 
    id: 'payrant' | 'vtstack' | 'both' | 'none', 
    title: string, 
    description: string, 
    icon: string 
  }) => {
    const isSelected = currentGateway === id;
    
    return (
      <TouchableOpacity
        style={[
          styles.optionCard,
          { backgroundColor: cardBgColor, borderColor: isSelected ? THEME.primary : borderColor },
          isSelected && styles.selectedCard
        ]}
        onPress={() => handleUpdate(id)}
        disabled={updating}
      >
        <View style={styles.optionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: isSelected ? THEME.primary : borderColor }]}>
            <Ionicons name={icon as any} size={24} color={isSelected ? '#FFF' : textBodyColor} />
          </View>
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: textColor }]}>{title}</Text>
            <Text style={[styles.optionDesc, { color: textBodyColor }]}>{description}</Text>
          </View>
          {isSelected && <Ionicons name="checkmark-circle" size={24} color={THEME.primary} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Gateway Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={THEME.primary} />
          <Text style={styles.infoText}>
            Configure which virtual accounts are displayed to users on the "Add Money" screen.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.optionsList}>
            <GatewayOption 
              id="both" 
              title="Show Both Providers" 
              description="Users will see both Payrant and VTStack accounts."
              icon="layers-outline"
            />
            <GatewayOption 
              id="payrant" 
              title="Payrant Only" 
              description="Display only Payrant virtual accounts."
              icon="wallet-outline"
            />
            <GatewayOption 
              id="vtstack" 
              title="VTStack Only" 
              description="Display only VTStack virtual accounts."
              icon="infinite-outline"
            />
            <GatewayOption 
              id="none" 
              title="Disable All" 
              description="Hide all virtual account numbers from users."
              icon="eye-off-outline"
            />
          </View>
        )}
      </ScrollView>

      {updating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Updating Settings...</Text>
        </View>
      )}
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
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 37, 64, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
    lineHeight: 20,
  },
  optionsList: {
    gap: 16,
  },
  optionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  selectedCard: {
    backgroundColor: 'rgba(10, 37, 64, 0.02)',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontWeight: '600',
  },
});
