import { MaterialIcons } from "@expo/vector-icons";
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

export default function ResetPasswordScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const email = useMemo(() => (typeof params.email === 'string' ? params.email : ''), [params.email]);
  const otpCode = useMemo(() => (typeof params.otp === 'string' ? params.otp : ''), [params.otp]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (!password || !confirmPassword) {
      showAlert("Please enter and confirm your new password", "error");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      showAlert("Password must be at least 6 characters", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.resetPassword({
        email,
        otp_code: otpCode,
        new_password: password
      });

      if (res?.success) {
        showAlert("Password reset successfully! Please login.", "success");
        setTimeout(() => {
          router.replace("/login");
        }, 1500);
      } else {
        showAlert(res?.message || "Failed to reset password. Please try again.", "error");
      }
    } catch (e) {
      const msg = e?.message || "Failed to reset password. Please try again.";
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
            <Text style={[styles.title, { color: textColor }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: textBodyColor }]}>Create a new password for your account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>New Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: cardBg, borderColor }]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter new password"
                  placeholderTextColor={textBodyColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  selectionColor="#6C2BD9"
                />
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
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Confirm Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: cardBg, borderColor }]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Confirm new password"
                  placeholderTextColor={textBodyColor}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  selectionColor="#6C2BD9"
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, (submitting) && styles.buttonDisabled]}
                onPress={onSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Reset Password</Text>
                )}
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
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 14 },
  formContainer: { paddingHorizontal: 24 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, marginBottom: 8, fontWeight: "500" },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 50 },
  input: { flex: 1, height: 50 },
  eyeIcon: { padding: 4 },
  buttonContainer: { marginTop: 8 },
  button: { height: 50, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  primaryButton: { backgroundColor: "#6C2BD9" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  buttonDisabled: { opacity: 0.6 },
});
