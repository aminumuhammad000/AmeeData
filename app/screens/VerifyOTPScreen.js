import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlert from "../components/CustomAlert";
import { useTheme } from "../components/ThemeContext";
import { authService } from "../services/auth.service";

export default function VerifyOTPScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const emailParam = useMemo(() => (typeof params.email === 'string' ? params.email : ''), [params.email]);
  const typeParam = useMemo(() => (typeof params.type === 'string' ? params.type : 'verify'), [params.type]);

  const [email] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: "", type: "info" });

  const showAlert = useCallback((message, type = "info") => {
    setAlert({ visible: true, message, type });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, visible: false }));
  }, []);

  const theme = {
    primary: "#6C2BD9",
    accent: "#FF9F43",
    backgroundLight: "#F8F9FA",
    backgroundDark: "#111921",
    textHeadings: "#1E293B",
    textBody: "#475569",
  };

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const textColor = isDark ? "#FFFFFF" : theme.textHeadings;
  const textBodyColor = isDark ? "#9CA3AF" : theme.textBody;
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const borderColor = isDark ? "#374151" : "#334155";

  const onVerify = async () => {
    if (!email) {
      showAlert("Missing email. Please go back and enter your email.", "error");
      return;
    }
    if (!otp || otp.length < 4) {
      showAlert("Enter the 4-6 digit OTP sent to your email.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.verifyEmailOTP({ email: email.trim().toLowerCase(), otp_code: otp.trim() });
      if (res?.success) {
        showAlert("OTP verified successfully.", "success");
        setTimeout(() => {
          if (typeParam === 'reset') {
            router.replace({ pathname: "/reset-password", params: { email: email.trim().toLowerCase(), otp: otp.trim() } });
          } else {
            router.replace("/login");
          }
        }, 700);
      } else {
        showAlert(res?.message || "Invalid OTP. Please try again.", "error");
      }
    } catch (e) {
      const msg = e?.message || "OTP verification failed. Please try again.";
      showAlert(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!email) return;
    try {
      // Check if it's password reset flow or normal flow
      const method = typeParam === 'reset' ? authService.requestPasswordReset({ email }) : authService.resendOTP('', email.trim().toLowerCase());
      const res = await method;

      if (res?.success) {
        showAlert("A new OTP has been sent to your email.", "success");
      } else {
        showAlert(res?.message || "Failed to resend OTP.", "error");
      }
    } catch (e) {
      showAlert(e?.message || "Failed to resend OTP.", "error");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <CustomAlert
        visible={alert.visible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
        duration={5000}
      />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image source={require("../assets/images/ameedatalogo.png")} style={styles.logo} />
            <Text style={[styles.title, { color: textColor }]}>Verify OTP</Text>
            <Text style={[styles.subtitle, { color: textBodyColor }]}>
              Enter the OTP sent to {email || 'your email'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>OTP Code</Text>
              <View style={[styles.inputWrapper, { backgroundColor: cardBg, borderColor }]}>
                <TextInput
                  style={[styles.input, { color: textColor, letterSpacing: 6, textAlign: 'center' }]}
                  placeholder="••••••"
                  placeholderTextColor={textBodyColor}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor="#6C2BD9"
                  maxLength={6}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, (submitting || !otp) && styles.buttonDisabled]}
                onPress={onVerify}
                disabled={submitting || !otp}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify</Text>
                )}
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, marginBottom: 8 }}>
                <Text style={{ color: textBodyColor, fontFamily: "Poppins-Medium", fontSize: 14 }}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={onResend} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={{ color: theme.primary, fontFamily: "Poppins-SemiBold", fontSize: 14 }}>Resend OTP</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={{ alignItems: 'center', marginTop: 12 }} onPress={() => router.replace("/login")} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={{ color: textBodyColor, fontFamily: "Poppins-Medium", fontSize: 14 }}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
  logoContainer: { alignItems: "center", marginBottom: 24 },
  logo: { width: 64, height: 64, resizeMode: "contain", marginBottom: 8 },
  title: { fontSize: 24, fontFamily: "Poppins-Bold" },
  subtitle: { fontSize: 14, fontFamily: "Poppins-Regular", textAlign: "center" },
  formContainer: { paddingHorizontal: 24 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, marginBottom: 8, fontFamily: "Poppins-Medium" },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 50 },
  input: { flex: 1, height: 50, fontFamily: "Poppins-Regular" },
  buttonContainer: { marginTop: 8 },
  button: { height: 50, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  primaryButton: { backgroundColor: "#6C2BD9" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins-SemiBold" },
  buttonDisabled: { opacity: 0.6 },
  secondaryButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#334155" },
  ghostButton: { backgroundColor: "transparent" },
  secondaryButtonText: { color: "#334155", fontFamily: "Poppins-Medium" },
});
