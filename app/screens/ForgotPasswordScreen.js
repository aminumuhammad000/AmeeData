import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

export default function ForgotPasswordScreen() {
  const { isDark } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
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

  const onSubmit = async () => {
    if (!email) {
      showAlert("Please enter your email address", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.requestPasswordReset({ email: email.trim().toLowerCase() });
      if (res?.success) {
        showAlert("OTP has been sent to your email.", "success");
        setTimeout(() => {
          router.push({ pathname: "/verify-otp", params: { email: email.trim().toLowerCase(), type: 'reset' } });
        }, 500);
      } else {
        showAlert(res?.message || "Failed to send OTP. Please try again.", "error");
      }
    } catch (e) {
      const msg = e?.message || "Failed to send OTP. Please try again.";
      showAlert(msg, "error");
    } finally {
      setSubmitting(false);
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
            <Text style={[styles.title, { color: textColor }]}>Forgot Password</Text>
            <Text style={[styles.subtitle, { color: textBodyColor }]}>Enter your email to receive an OTP</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: cardBg, borderColor }]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter your email address"
                  placeholderTextColor={textBodyColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor="#6C2BD9"
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, (submitting || !email) && styles.buttonDisabled]}
                onPress={onSubmit}
                disabled={submitting || !email}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => router.replace("/login")}>
                <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
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
  subtitle: { fontSize: 14, fontFamily: "Poppins-Regular" },
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
  secondaryButtonText: { color: "#334155", fontFamily: "Poppins-Medium" },
});
