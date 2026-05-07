import { useTheme } from '@/components/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface FilterOptions {
  status: string[];
  type: string[];
  dateRange: string;
  amountRange: string;
}

interface TransactionFilterProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

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

export default function TransactionFilter({ 
  visible, 
  onClose, 
  onApplyFilter, 
  currentFilters 
}: TransactionFilterProps) {
  const { isDark } = useTheme();

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  const [tempFilters, setTempFilters] = React.useState<FilterOptions>(currentFilters);

  const statusOptions = [
    { value: 'Successful', label: 'Successful', color: theme.success },
    { value: 'Failed', label: 'Failed', color: theme.error },
    { value: 'Pending', label: 'Pending', color: theme.accent },
  ];

  const typeOptions = [
    { value: 'Airtime', label: 'Airtime', icon: 'phone-portrait' },
    { value: 'Data', label: 'Data', icon: 'wifi' },
    { value: 'TV Subscription', label: 'TV Subscription', icon: 'tv' },
    { value: 'Electricity', label: 'Electricity', icon: 'flash' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const amountRangeOptions = [
    { value: 'all', label: 'All Amounts' },
    { value: '0-500', label: '₦0 - ₦500' },
    { value: '500-1000', label: '₦500 - ₦1,000' },
    { value: '1000-5000', label: '₦1,000 - ₦5,000' },
    { value: '5000+', label: '₦5,000+' },
  ];

  const toggleStatus = (status: string) => {
    const newStatus = tempFilters.status.includes(status)
      ? tempFilters.status.filter(s => s !== status)
      : [...tempFilters.status, status];
    setTempFilters({ ...tempFilters, status: newStatus });
  };

  const toggleType = (type: string) => {
    const newType = tempFilters.type.includes(type)
      ? tempFilters.type.filter(t => t !== type)
      : [...tempFilters.type, type];
    setTempFilters({ ...tempFilters, type: newType });
  };

  const handleApply = () => {
    onApplyFilter(tempFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      status: [],
      type: [],
      dateRange: 'all',
      amountRange: 'all',
    };
    setTempFilters(resetFilters);
    onApplyFilter(resetFilters);
    onClose();
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.filterSection, { borderBottomColor: borderColor }]}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      {children}
    </View>
  );

  const FilterChip = ({ 
    label, 
    selected, 
    onPress, 
    color, 
    icon 
  }: { 
    label: string; 
    selected: boolean; 
    onPress: () => void; 
    color?: string;
    icon?: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { 
          backgroundColor: selected ? (color || theme.primary) : 'transparent',
          borderColor: selected ? (color || theme.primary) : borderColor 
        }
      ]}
      onPress={onPress}
    >
      {icon && (
        <Ionicons 
          name={icon as any} 
          size={16} 
          color={selected ? '#FFFFFF' : textBodyColor}
          style={styles.chipIcon}
        />
      )}
      <Text style={[
        styles.filterChipText, 
        { color: selected ? '#FFFFFF' : textColor }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const RadioOption = ({ 
    label, 
    selected, 
    onPress 
  }: { 
    label: string; 
    selected: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity style={styles.radioOption} onPress={onPress}>
      <View style={[
        styles.radioCircle,
        { borderColor: selected ? theme.primary : borderColor }
      ]}>
        {selected && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
      </View>
      <Text style={[styles.radioLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Text style={[styles.headerButtonText, { color: textBodyColor }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Filter Transactions</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleReset}>
            <Text style={[styles.headerButtonText, { color: theme.primary }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Status Filter */}
          <FilterSection title="Transaction Status">
            <View style={styles.chipsContainer}>
              {statusOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  selected={tempFilters.status.includes(option.value)}
                  onPress={() => toggleStatus(option.value)}
                  color={option.color}
                />
              ))}
            </View>
          </FilterSection>

          {/* Type Filter */}
          <FilterSection title="Transaction Type">
            <View style={styles.chipsContainer}>
              {typeOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  selected={tempFilters.type.includes(option.value)}
                  onPress={() => toggleType(option.value)}
                  icon={option.icon}
                />
              ))}
            </View>
          </FilterSection>

          {/* Date Range Filter */}
          <FilterSection title="Date Range">
            <View style={styles.radioContainer}>
              {dateRangeOptions.map((option) => (
                <RadioOption
                  key={option.value}
                  label={option.label}
                  selected={tempFilters.dateRange === option.value}
                  onPress={() => setTempFilters({ ...tempFilters, dateRange: option.value })}
                />
              ))}
            </View>
          </FilterSection>

          {/* Amount Range Filter */}
          <FilterSection title="Amount Range">
            <View style={styles.radioContainer}>
              {amountRangeOptions.map((option) => (
                <RadioOption
                  key={option.value}
                  label={option.label}
                  selected={tempFilters.amountRange === option.value}
                  onPress={() => setTempFilters({ ...tempFilters, amountRange: option.value })}
                />
              ))}
            </View>
          </FilterSection>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Apply Button */}
        <View style={[styles.footer, { borderTopColor: borderColor }]}>
          <TouchableOpacity 
            style={[styles.applyButton, { backgroundColor: theme.primary }]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: {
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  radioContainer: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});