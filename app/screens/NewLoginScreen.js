import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const otpInputs = useRef([]);
  const router = useRouter();

  const handleContinue = () => {
    // Show OTP screen when continue is pressed
    setShowOtpScreen(true);
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 4) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleBackToLogin = () => {
    setShowOtpScreen(false);
  };

  if (showOtpScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.otpContainer}>
          <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>

          <View style={styles.otpContent}>
            <Text style={styles.otpTitle}>Verify Your Identity</Text>
            <Text style={styles.otpSubtitle}>We've sent a code to your phone. Please enter it below.</Text>

            <View style={styles.otpInputsContainer}>
              {[0, 1, 2, 3, 4].map((index) => (
                <TextInput
                  key={index}
                  ref={ref => otpInputs.current[index] = ref}
                  style={styles.otpInput}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={otp[index]}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                      // Focus previous input on backspace
                      otpInputs.current[index - 1]?.focus();
                    }
                  }}
                  selectionColor="#3B82F6"
                />
              ))}
            </View>

            <Text style={styles.resendText}>
              Didn't receive a code?{' '}
              <Text style={styles.resendLink}>Resend OTP</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/ameedatalogo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to AmeeData</Text>
          <Text style={styles.subtitle}>Enter your email or phone number to get started.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email or Phone Number</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email or phone number"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor="#3B82F6"
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleContinue}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
              <MaterialIcons name="fingerprint" size={24} color="#111921" />
              <Text style={styles.secondaryButtonText}>Sign in with Biometrics</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={[styles.button, styles.socialButton, { backgroundColor: '#FFFFFF' }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-LBgmwH2QdH0SMXnLSqgIzuC4R-0W0RvWdTNEr_NpllN6NV6rCHU_urzGTET9ukQggSllwcntrBKYQVjrGy6faoX8uS7vMBRmj0MiDrwzQTD-97DXh-l4_fFuLdxeafoJtGGTZjvDSFe-Tugarxj95ecQrLItSiak6VEG-9Pqy0iohz03Fe4YsS2boiowmrtRdqaEmWb_nGbE4XQ7PMnEtyIWbNQZVKOkerrQijPeUgoC9hU4LIZhja9XBx2__jIaqbHK7v8GfLs' }}
                style={styles.socialIcon}
              />
              <Text style={[styles.socialButtonText, { color: '#111921' }]}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.socialButton, { backgroundColor: '#000000' }]}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmzEF8JMM9NDAf9oj1zKEI0KwqP4hZG4VTwaApPexK9L1_rwmqnvXuKJlhgkreSD-iNyFk17kJdRAjl9EwrnTSIuTVXTrtxlhA-95OTv2fdWMxTqm9-3J-zE_EcVsQn7Kq8vKwYnZ0-GynAsisF9cihvbvPu5mbfPLqFHZiZt7tRvc4bF9KrB3a04CcTB2cEDRy3D3jJTU80LXIqGIBmJYoIyFsABv8BaX35UJXMnOYzvI88HfG6SxUMEbkf5NE9P93VUnCr6Dn8c' }}
                style={styles.socialIcon}
              />
              <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 0,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111921',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111921',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 16,
    color: '#111921',
    padding: 0,
    margin: 0,
    height: '100%',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#0A2A4E',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#111921',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    marginHorizontal: 12,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  // OTP Screen Styles
  otpContainer: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  otpContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111921',
    marginBottom: 12,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111921',
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  resendLink: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});
