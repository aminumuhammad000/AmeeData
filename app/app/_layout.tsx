import { AlertProvider } from '@/components/AlertContext';
import AppLock from '@/components/AppLock';
import { ProfileProvider } from '@/components/ProfileContext';
import { ThemeProvider } from '@/components/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useFonts } from 'expo-font';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// This component will handle the authentication state and routing
function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = ['login', 'signup', 'forgot-password', 'verify-otp'].includes(segments[0] as string);

    if (!isLoading) {
      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to the login page if not authenticated
        router.replace('/login');
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to the home page if authenticated and trying to access auth pages
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  const { isLocked, setIsLocked } = useAuth();
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      const inAuthGroup = ['login', 'signup', 'forgot-password', 'verify-otp'].includes(segments[0] as string);

      if (appState.current.match(/active/) && nextAppState === 'background') {
        // App went to background
        backgroundTime.current = Date.now();
      }

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        if (backgroundTime.current && isAuthenticated && !inAuthGroup) {
          const elapsedSeconds = (Date.now() - backgroundTime.current) / 1000;

          // If in background for more than 15 seconds
          if (elapsedSeconds > 15) {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && isEnrolled) {
              setIsLocked(true);
            }
          }
        }
        backgroundTime.current = null;
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111418' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#111418' },
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="set-pin" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="more" />
        <Stack.Screen name="buy-airtime" />
        <Stack.Screen name="buy-data" />
        <Stack.Screen name="buy-electricity" />
        <Stack.Screen name="buy-exampin" />
        <Stack.Screen name="add-money" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="security" />
        <Stack.Screen name="notifications-settings" />
        <Stack.Screen name="help-support" />
        <Stack.Screen name="about" />
        <Stack.Screen name="payment-methods" />
        <Stack.Screen name="wallet-settings" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="admin-users" />
        <Stack.Screen name="admin-notifications" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <AppLock visible={isLocked} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the splash screen after the fonts have loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AlertProvider>
        <ProfileProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <AuthLayout />
          </AuthProvider>
        </ProfileProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}
