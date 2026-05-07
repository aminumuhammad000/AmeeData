import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Shield, User, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { createAdmin, getRoles } from '../api/adminApi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuthContext } from '../hooks/AuthContext';

const AdminManagement: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role_id: '',
  });

  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Fetch Roles
  const { data: rolesData } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => getRoles().then((res: any) => res.data),
  });

  // Create Admin Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => createAdmin(data).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] }); // Assuming there's a query for admins
      setIsModalOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', password: '', role_id: '' });
      alert('Admin created successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create admin');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const roles = rolesData || [];

  // Only Super Admin can access this page
  if (user?.role?.name !== 'Super Admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Management</h1>
                <p className="text-slate-600">Create and manage admin users and roles</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <UserPlus className="w-4 h-4" />
                Create Admin
              </button>
            </div>

            {/* Create Admin Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Admin</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                      <select
                        required
                        value={formData.role_id}
                        onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Role</option>
                        {roles.map((role: any) => (
                          <option key={role._id} value={role._id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {createMutation.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                        Create Admin
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Note: List of admins can be added here later if needed */}
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-500">
              <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Admin list view coming soon...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminManagement;
