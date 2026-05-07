import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuthContext } from '../hooks/AuthContext';
import { changeAdminPassword, updateAdminProfile } from '../api/adminApi';
import { useToast } from '../hooks/ToastContext';

const Profile: React.FC = () => {
  const { admin, login } = useAuthContext();
  const { showToast } = useToast();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(admin?.first_name || '');
  const [lastName, setLastName] = useState(admin?.last_name || '');
  const [email, setEmail] = useState(admin?.email || '');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getInitials = () => {
    if (!admin) return 'AD';
    const first = admin.first_name?.[0] || '';
    const last = admin.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'AD';
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { first_name: string; last_name: string; email: string }) =>
      updateAdminProfile(data).then((res: any) => res.data),
    onSuccess: (response) => {
      const updatedAdmin = response.data || response.admin;
      const token = localStorage.getItem('token');
      if (token) {
        login(token, updatedAdmin);
      }
      showToast('Profile updated successfully!', 'success');
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      changeAdminPassword(data).then((res: any) => res.data),
    onSuccess: () => {
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      email: email,
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleCancelEdit = () => {
    setFirstName(admin?.first_name || '');
    setLastName(admin?.last_name || '');
    setEmail(admin?.email || '');
    setIsEditingProfile(false);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Profile Settings</h1>
              <p className="text-slate-600">Manage your account information and security</p>
            </div>

            {/* Profile Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Profile Information</h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {getInitials()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {admin?.first_name} {admin?.last_name}
                  </h3>
                  <p className="text-slate-600">{admin?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {admin?.role_id?.role_name?.replace('_', ' ').toUpperCase() || 'ADMIN'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      className={`w-full px-4 py-2.5 border border-slate-300 rounded-lg ${
                        isEditingProfile ? 'bg-white focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-slate-50'
                      } text-slate-900 font-medium`}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      readOnly={!isEditingProfile}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      className={`w-full px-4 py-2.5 border border-slate-300 rounded-lg ${
                        isEditingProfile ? 'bg-white focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-slate-50'
                      } text-slate-900 font-medium`}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      readOnly={!isEditingProfile}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className={`w-full px-4 py-2.5 border border-slate-300 rounded-lg ${
                        isEditingProfile ? 'bg-white focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-slate-50'
                      } text-slate-900 font-medium`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!isEditingProfile}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-medium" 
                      value={admin?.role_id?.role_name?.replace('_', ' ').toUpperCase() || 'ADMIN'} 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-medium" 
                      value={admin?.status?.toUpperCase() || 'ACTIVE'} 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Login</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-medium" 
                      value={admin?.last_login_at ? new Date(admin.last_login_at).toLocaleString() : 'N/A'} 
                      readOnly 
                    />
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.status === 'pending'}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition font-semibold"
                    >
                      {updateProfileMutation.status === 'pending' ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={updateProfileMutation.status === 'pending'}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Change Password</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter current password" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter new password (min 8 characters)" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Confirm new password" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={changePasswordMutation.status === 'pending'}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  {changePasswordMutation.status === 'pending' ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
