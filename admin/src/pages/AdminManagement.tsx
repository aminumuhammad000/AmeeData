import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, User, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { createAdmin, deleteAdmin, getAllAdmins, getRoles } from '../api/adminApi';
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
    type: 'sub-admin',
  });

  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Fetch Roles
  const { data: rolesData } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => getRoles().then((res: any) => res.data),
  });

  // Fetch Admins
  const { data: adminsData, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['admins'],
    queryFn: () => getAllAdmins().then((res: any) => res.data?.data || []),
  });

  // Create Admin Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => createAdmin(data).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsModalOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', password: '', role_id: '', type: 'sub-admin' });
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdmin(id).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      alert('Admin deleted successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete admin');
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      deleteMutation.mutate(id);
    }
  };

  const roles = rolesData || [];

  const isSuperAdmin = 
    user?.role_id?.name === 'Super Admin' || 
    user?.role?.name === 'Super Admin' || 
    user?.adminType === 'super-admin' || 
    user?.type === 'super-admin';



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
              {isSuperAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Admin
                </button>
              )}
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select
                          required={formData.type === 'sub-admin'}
                          value={formData.role_id}
                          onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select Role</option>
                          {roles.map((role: any) => (
                            <option key={role._id} value={role._id}>{role.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Admin Type</label>
                        <select
                          required
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="super-admin">Super Admin</option>
                          <option value="sub-admin">Sub Admin</option>
                        </select>
                      </div>
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
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {createMutation.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                        Create Admin
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* List of Admins */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-medium text-slate-500">Name</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-500">Email</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-500">Type</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-500">Status</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoadingAdmins ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                        Loading admins...
                      </td>
                    </tr>
                  ) : adminsData?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No admins found. Create one above.</p>
                      </td>
                    </tr>
                  ) : (
                    adminsData?.map((admin: any) => (
                      <tr key={admin._id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                              {admin.first_name[0]}{admin.last_name[0]}
                            </div>
                            <span className="text-slate-900 font-medium">{admin.first_name} {admin.last_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{admin.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            admin.type === 'super-admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {admin.type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            admin.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {admin.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isSuperAdmin && admin.email !== user?.email && (
                            <button
                              onClick={() => handleDelete(admin._id)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                              title="Delete Admin"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminManagement;
