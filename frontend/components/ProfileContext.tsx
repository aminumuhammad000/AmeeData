import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  profileImage: string;
}

interface ProfileContextType {
  profileData: ProfileData;
  updateProfile: (data: ProfileData) => void;
  getFullName: () => string;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    profileImage: 'https://i.pravatar.cc/150?img=12',
  });

  // Load user data from server on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Try to get from server first
        const response = await userService.getProfile();
        if (response.success && response.data) {
          const user = response.data;
          setProfileData({
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            email: user.email || '',
            phoneNumber: user.phone_number || '',
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            profileImage: user.avatar || 'https://i.pravatar.cc/150?img=12',
          });
        } else {
          // Fallback to cached user data
          const cachedUser = await authService.getCurrentUser();
          if (cachedUser) {
            setProfileData({
              firstName: cachedUser.first_name || '',
              lastName: cachedUser.last_name || '',
              email: cachedUser.email || '',
              phoneNumber: cachedUser.phone_number || '',
              address: cachedUser.address || '',
              city: cachedUser.city || '',
              state: cachedUser.state || '',
              profileImage: cachedUser.avatar || 'https://i.pravatar.cc/150?img=12',
            });
          }
        }
      } catch (error) {
        console.log('Failed to load profile from server, using cached data');
        // Fallback to cached user data
        const cachedUser = await authService.getCurrentUser();
        if (cachedUser) {
          setProfileData({
            firstName: cachedUser.first_name || '',
            lastName: cachedUser.last_name || '',
            email: cachedUser.email || '',
            phoneNumber: cachedUser.phone_number || '',
            address: cachedUser.address || '',
            city: cachedUser.city || '',
            state: cachedUser.state || '',
            profileImage: cachedUser.avatar || 'https://i.pravatar.cc/150?img=12',
          });
        }
      }
    };

    loadUserProfile();
  }, []);

  const updateProfile = (data: ProfileData) => {
    setProfileData(data);
  };

  const getFullName = () => {
    return `${profileData.firstName} ${profileData.lastName}`;
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile, getFullName }}>
      {children}
    </ProfileContext.Provider>
  );
};