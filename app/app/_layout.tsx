import { AlertProvider } from '@/components/AlertContext';
import { ProfileProvider } from '@/components/ProfileContext';
import { ThemeProvider } from '@/components/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

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



  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111418' }}>
        <ActivityIndicator size="large" color="#6C2BD9" />
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
        <Stack.Screen name="notifications" />
        <Stack.Screen name="buy-airtime" />
        <Stack.Screen name="buy-data" />
        <Stack.Screen name="add-money" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="security" />
        <Stack.Screen name="help-support" />
        <Stack.Screen name="about" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="admin-users" />
        <Stack.Screen name="admin-notifications" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>

    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    // Load icon fonts for web — native bundles them but web needs explicit loading
    ...Ionicons.font,
    ...MaterialIcons.font,
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
