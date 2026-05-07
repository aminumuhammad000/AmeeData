import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../components/ThemeContext';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

export default function ForgotPassword() {
  const { isDark } = useTheme();
  const theme = {
    backgroundLight: '#F8F9FA',
    backgroundDark: '#111921',
  };
  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ForgotPasswordScreen />
    </View>
  );
}
