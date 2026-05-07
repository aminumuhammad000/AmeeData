import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const userData = await authService.getCurrentUser();
        if (!userData) {
          throw new Error('Invalid user data');
        }

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Auth check failed, forcing logout:', error.message);
        // Clear any invalid auth state
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    setIsLoading(true);
    try {
      if (!userData?.email || !userData?.password) {
        throw new Error('Email and password are required');
      }

      const response = await authService.login(userData);

      // Check for network errors first
      if (!response) {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }

      // Check for failed login
      if (!response.success) {
        throw new Error(response.message || 'Invalid email or password');
      }

      // Verify we have a valid user and token
      if (!response.data?.user) {
        throw new Error('Invalid user data received');
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication failed: No token received');
      }

      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial auth state
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);

      // Provide more user-friendly error messages
      let errorMessage = error.message || 'Login failed. Please try again.';

      // Handle network errors specifically
      if (error?.message && (error.message.includes('Network Error') || error.message.includes('timeout'))) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: error.message || 'Logout failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLocked,
        setIsLocked,
        isLoading,
        login,
        logout,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
