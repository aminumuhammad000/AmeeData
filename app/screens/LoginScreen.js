import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from "react";
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
import { useAuth } from "../context/AuthContext";

const LoginScreen = () => {
  const { login, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const router = useRouter();

  const showAlert = useCallback((message, type = "info") => {
    setAlert({
      visible: true,
      message,
      type,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, visible: false }));
  }, []);


  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const processLogin = async (loginEmail, loginPassword) => {
    setIsLoggingIn(true);
    try {
      const response = await login({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      if (response.success) {


        showAlert("Welcome back!", "success");
        // No need to replace router here, AuthContext update should trigger useEffect but to be safe
        setTimeout(() => router.replace("/(tabs)"), 500);
      } else {
        showAlert(
          response.message || "Invalid email or password. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (
        error.message &&
        (error.message.includes("Network Error") ||
          error.message.includes("timeout"))
      ) {
        errorMessage =
          "Unable to connect to the server. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showAlert(errorMessage, "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      showAlert("Please enter both email and password", "error");
      return;
    }

    if (password.length < 6) {
      showAlert("Password must be at least 6 characters", "error");
      return;
    }

    await processLogin(email, password);
  };



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

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <CustomAlert
        visible={alert.visible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
        duration={5000}
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/ameedatalogo.png")}
              style={styles.logo}
            />
            <Text style={[styles.title, { color: textColor }]}>Welcome Back!</Text>
            <Text style={[styles.subtitle, { color: textBodyColor }]}>Your trusted partner for seamless mobile transactions</Text>

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

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: cardBg, borderColor }]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter your password"
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
              <TouchableOpacity
                onPress={() => router.push("/forgot-password")}
                style={{ alignSelf: 'flex-end', marginTop: 8 }}
              >
                <Text style={[styles.forgotPassword, { color: isDark ? theme.accent : theme.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  (isLoggingIn) && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoggingIn}
                activeOpacity={0.8}
              >
                {isLoggingIn ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>


            </View>

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: textBodyColor }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={[styles.signupLink, { color: isDark ? theme.accent : theme.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 0,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 16,
    color: "#1E293B",
    padding: 0,
    margin: 0,
    height: "100%",
    flex: 1,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 24,
    marginTop: 8,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#6C2BD9",
    shadowColor: "#6C2BD9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#6C2BD9",
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    color: "#64748B",
  },
  signupLink: {
    fontSize: 14,
    color: "#6C2BD9",
    fontWeight: "600",
  },
});
