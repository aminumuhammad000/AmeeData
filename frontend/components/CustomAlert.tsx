import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  visible: boolean;
  message: string;
  type: AlertType;
  onClose: () => void;
  duration?: number;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideAlert();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Reset animations when hidden
      fadeAnim.setValue(0);
      translateY.setValue(-100);
    }
  }, [visible]);

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10B981', icon: 'check-circle' as const };
      case 'error':
        return { backgroundColor: '#EF4444', icon: 'error' as const };
      case 'warning':
        return { backgroundColor: '#F59E0B', icon: 'warning' as const };
      case 'info':
      default:
        return { backgroundColor: '#3B82F6', icon: 'info' as const };
    }
  };

  const { backgroundColor, icon } = getAlertStyles();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor },
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons name={icon} size={24} color="white" style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hideAlert} style={styles.closeButton}>
          <MaterialIcons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default CustomAlert;