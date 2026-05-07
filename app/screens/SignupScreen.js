import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../components/ThemeContext";
import { authService } from "../services/auth.service";

const SignupScreen = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [referral_code, setReferralCode] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const router = useRouter();
  const { isDark } = useTheme();

  const theme = {
    primary: "#0A2540",
    accent: "#FF9F43",
    backgroundLight: "#F8F9FA",
    backgroundDark: "#111921",
    textHeadings: "#1E293B",
    textBody: "#475569",
    error: "#EF4444",
  };

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const textColor = isDark ? "#FFFFFF" : theme.textHeadings;
  const textBodyColor = isDark ? "#9CA3AF" : theme.textBody;
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const borderColor = isDark ? "#374151" : "#334155";
  const errorColor = theme.error;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleNextStep1 = () => {
    let newErrors = {};
    let isValid = true;

    if (!first_name) { newErrors.first_name = "First name is required"; isValid = false; }
    if (!last_name) { newErrors.last_name = "Last name is required"; isValid = false; }
    if (!email) {
      newErrors.email = "Email is required"; isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Invalid email address"; isValid = false;
    }

    if (!phone_number) {
      newErrors.phone_number = "Phone number is required"; isValid = false;
    } else if (!/^[0-9]{11}$/.test(phone_number)) {
      newErrors.phone_number = "Must be exactly 11 digits"; isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    let newErrors = {};
    let isValid = true;

    if (!password) { newErrors.password = "Password is required"; isValid = false; }
    else if (password.length < 6) { newErrors.password = "Must be at least 6 characters"; isValid = false; }

    if (!confirmPassword) { newErrors.confirmPassword = "Confirm password is required"; isValid = false; }
    else if (password !== confirmPassword) { newErrors.confirmPassword = "Passwords do not match"; isValid = false; }

    setErrors(newErrors);

    if (isValid) {
      setStep(3);
    }
  };

  const handleSignup = async () => {
    let newErrors = {};
    let isValid = true;

    if (!pin) { newErrors.pin = "Transaction PIN is required"; isValid = false; }
    else if (!/^\d{4}$/.test(pin)) { newErrors.pin = "Must be exactly 4 digits"; isValid = false; }

    if (!confirmPin) { newErrors.confirmPin = "Confirm PIN is required"; isValid = false; }
    else if (pin !== confirmPin) { newErrors.confirmPin = "PIN codes do not match"; isValid = false; }

    setErrors(newErrors);

    if (!isValid) return;

    setIsLoading(true);

    try {
      const response = await authService.register({
        email,
        phone_number,
        password,
        first_name,
        last_name,
        referral_code: referral_code || undefined,
        pin,
      });

      if (response.success) {
        Alert.alert("🎉 Account Created", `Welcome ${first_name}! Your account is ready.`, [
          { text: "Continue", onPress: () => router.replace("/(tabs)") }
        ]);
      }
    } catch (error) {
      Alert.alert(
        "❌ Signup Failed",
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const renderInput = (label, value, setValue, field, placeholder, options = {}) => {
    const hasError = !!errors[field];
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: textColor }]}>{label}</Text>
        <View style={[
          styles.inputWrapper,
          { backgroundColor: cardBg, borderColor: hasError ? errorColor : borderColor }
        ]}>
          {options.prefix && (
            <Text style={[styles.countryCode, { color: textColor }]}>{options.prefix}</Text>
          )}
          <TextInput
            style={[styles.input, { color: textColor, marginLeft: options.prefix ? 8 : 0 }]}
            placeholder={placeholder}
            placeholderTextColor={textBodyColor}
            value={value}
            onChangeText={(text) => {
              setValue(text);
              if (hasError) clearError(field);
              if (options.onChangeTextHook) options.onChangeTextHook(text);
            }}
            {...options.props}
          />
          {options.icon}
        </View>
        {hasError && <Text style={styles.errorText}>{errors[field]}</Text>}
        {options.helperText && !hasError && (
          <Text style={{ fontSize: 12, color: textBodyColor, marginTop: 4 }}>{options.helperText}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>

        {/* Progress Dots in Header */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
          <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
          <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
          <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
        </View>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            {step === 1 && "Personal Details"}
            {step === 2 && "Secure Account"}
            {step === 3 && "Final Setup"}
          </Text>
          <Text style={[styles.subtitle, { color: textBodyColor }]}>
            {step === 1 && "Start by creating your profile"}
            {step === 2 && "Create a strong password"}
            {step === 3 && "Set your transaction PIN & finish"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {step === 1 && (
            <View>
              {renderInput("First Name", first_name, setFirstName, "first_name", "Enter your first name", { props: { autoCapitalize: "words" } })}
              {renderInput("Last Name", last_name, setLastName, "last_name", "Enter your last name", { props: { autoCapitalize: "words" } })}
              {renderInput("Email Address", email, setEmail, "email", "Enter your email address", { props: { keyboardType: "email-address", autoCapitalize: "none", autoCorrect: false } })}
              {renderInput("Phone Number", phone_number, setPhoneNumber, "phone_number", "Enter your phone number", {
                prefix: "+234",
                helperText: "Must be 11 digits (e.g., 08012345678)",
                props: { keyboardType: "phone-pad", maxLength: 11 }
              })}

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleNextStep1}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              {renderInput("Password", password, setPassword, "password", "Create a password", {
                icon: (
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility-off" : "visibility"}
                      size={20}
                      color={textBodyColor}
                    />
                  </TouchableOpacity>
                ),
                props: { secureTextEntry: !showPassword }
              })}

              {renderInput("Confirm Password", confirmPassword, setConfirmPassword, "confirmPassword", "Confirm your password", {
                props: { secureTextEntry: !showPassword }
              })}

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleNextStep2}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View>
              {renderInput("Transaction PIN", pin, setPin, "pin", "Enter 4-digit PIN", {
                props: { keyboardType: "number-pad", secureTextEntry: true, maxLength: 4 },
                onChangeTextHook: (t) => setPin(t.replace(/\D/g, '').slice(0, 4))
              })}

              {renderInput("Confirm PIN", confirmPin, setConfirmPin, "confirmPin", "Confirm 4-digit PIN", {
                props: { keyboardType: "number-pad", secureTextEntry: true, maxLength: 4 },
                onChangeTextHook: (t) => setConfirmPin(t.replace(/\D/g, '').slice(0, 4))
              })}

              {renderInput("Referral Code (Optional)", referral_code, setReferralCode, "referral_code", "Enter referral code", { props: { autoCapitalize: "characters" } })}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  styles.finishButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: textBodyColor }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={[styles.loginLink, { color: isDark ? theme.accent : theme.primary }]}>Log In</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.termsText, { color: textBodyColor }]}>
            By signing up, you agree to our{" "}
            <Text style={styles.linkText}>Terms of Service</Text> and{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50, // improved status bar spacing
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 32,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  progressDotActive: {
    backgroundColor: '#0A2540',

  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 3,
  },
  progressLineActive: {
    backgroundColor: '#0A2540',
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    height: 56,
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  countryCode: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  input: {
    fontSize: 16,
    color: "#1E293B",
    padding: 0,
    margin: 0,
    height: "100%",
    flex: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 24,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#0A2A4E",
    shadowColor: "#0A2A4E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButton: {
    backgroundColor: "#16A34A", // Green for finish
    shadowColor: "#16A34A",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: "#64748B",
  },
  loginLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  termsText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default SignupScreen;
