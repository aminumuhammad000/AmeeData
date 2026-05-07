import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface GlobalAlertProps {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onHide: () => void;
  duration?: number;
}

export const GlobalAlert: React.FC<GlobalAlertProps> = ({
  visible,
  type,
  message,
  onHide,
  duration = 3000,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideAlert();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: isDark ? '#047857' : '#10B981',
          iconName: 'checkmark-circle',
          iconBg: '#D1FAE5',
        };
      case 'error':
        return {
          backgroundColor: isDark ? '#DC2626' : '#EF4444',
          iconName: 'close-circle',
          iconBg: '#FEE2E2',
        };
      case 'warning':
        return {
          backgroundColor: isDark ? '#D97706' : '#F59E0B',
          iconName: 'warning',
          iconBg: '#FEF3C7',
        };
      case 'info':
        return {
          backgroundColor: isDark ? '#2563EB' : '#3B82F6',
          iconName: 'information-circle',
          iconBg: '#DBEAFE',
        };
      default:
        return {
          backgroundColor: '#3B82F6',
          iconName: 'information-circle',
          iconBg: '#DBEAFE',
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.iconName as any} size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
        <TouchableOpacity onPress={hideAlert} style={styles.closeButton}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    maxWidth: width - 40,
    borderRadius: 16,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
  },
});