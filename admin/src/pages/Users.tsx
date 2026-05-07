import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { deleteUser, getUsers, updateUser, updateUserStatus } from '../api/adminApi';
import Layout from '../components/Layout';
import UserDeleteModal from '../components/UserDeleteModal';
import UserEditModal from '../components/UserEditModal';
import UserStatusModal from '../components/UserStatusModal';
import UserViewModal from '../components/UserViewModal';

const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [accountStatusFilter, setAccountStatusFilter] = useState('');
  const limit = 10;

  const { data, status, isLoading } = useQuery({
    queryKey: ['users', page, debouncedSearch, kycFilter, accountStatusFilter],
    queryFn: () => getUsers({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: accountStatusFilter || undefined,
      kyc_status: kycFilter || undefined
    }).then((res: any) => res.data),
  });

  const users = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current as any);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current as any);
    };
  }, [searchTerm]);

  const [viewUser, setViewUser] = useState<any | null>(null);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [statusUser, setStatusUser] = useState<any | null>(null);
  const [deleteUserObj, setDeleteUserObj] = useState<any | null>(null);

  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateUserStatus(statusUser._id, status).then((res: any) => res.data),
    onSuccess: () => {
      setStatusUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(deleteUserObj._id).then((res: any) => res.data),
    onSuccess: () => {
      setDeleteUserObj(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: any) => updateUser(editUser._id, data).then((res: any) => res.data),
    onSuccess: () => {
      setEditUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getKycColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Users Management</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">Manage and monitor all user accounts</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <span className="text-sm text-slate-500">Total Users:</span>
              <span className="text-lg font-bold text-blue-600">{pagination.total || 0}</span>
            </div>
          </div>

          {/* Controls: Search & Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6 sticky top-0 md:static z-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                <select
                  value={kycFilter}
                  onChange={(e) => { setKycFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All KYC Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={accountStatusFilter}
                  onChange={(e) => { setAccountStatusFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Account Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 flex-col">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading users...</p>
              </div>
            ) : status === 'error' ? (
              <div className="p-12 text-center">
                <div className="bg-red-50 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to load data</h3>
                <p className="text-slate-500">Something went wrong while fetching users.</p>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })} className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm">Retry</button>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm6-12h-3m0 0h-3m3 0v3m0-3v-3m0 0h3" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No users found</h3>
                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                <button onClick={() => { setSearchTerm(''); setKycFilter(''); setAccountStatusFilter(''); }} className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">Clear all filters</button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Account Status</th>
                        <th className="px-6 py-4">KYC Status</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((user: any) => (
                        <tr key={user._id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                {`${user.first_name?.[0] || 'U'}${user.last_name?.[0] || 'U'}`.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-slate-500 font-mono">ID: {user._id.slice(-6)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-slate-900">{user.email}</p>
                              <p className="text-slate-500">{user.phone_number || 'No phone'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-75`}></span>
                              {user.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getKycColor(user.kyc_status)}`}>
                              {user.kyc_status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setViewUser(user)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="View details">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              <button onClick={() => setEditUser(user)} className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition" title="Edit user">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => setStatusUser(user)} className="p-1.5 text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition" title="Change status">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                              </button>
                              <button onClick={() => setDeleteUserObj(user)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition" title="Delete user">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                  {users.map((user: any) => (
                    <div key={user._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {`${user.first_name?.[0] || 'U'}${user.last_name?.[0] || 'U'}`.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-900 text-sm truncate">{user.first_name} {user.last_name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(user.status)}`}>
                              {user.status?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="block text-slate-400 text-[10px] uppercase">KYC</span>
                          <span className={`font-medium ${user.kyc_status === 'verified' ? 'text-green-600' :
                              user.kyc_status === 'pending' ? 'text-blue-600' : 'text-red-600'
                            }`}>{user.kyc_status?.toUpperCase() || '—'}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="block text-slate-400 text-[10px] uppercase">Joined</span>
                          <span className="font-medium">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                        <button onClick={() => setViewUser(user)} className="flex-1 text-center py-1 text-xs font-medium text-slate-600 hover:text-blue-600 border-r border-slate-100">View</button>
                        <button onClick={() => setEditUser(user)} className="flex-1 text-center py-1 text-xs font-medium text-slate-600 hover:text-blue-600 border-r border-slate-100">Edit</button>
                        <button onClick={() => setStatusUser(user)} className="flex-1 text-center py-1 text-xs font-medium text-slate-600 hover:text-blue-600">Status</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-600 order-2 sm:order-1 text-center sm:text-left">
                    Page <span className="font-semibold">{pagination.page}</span> of <span className="font-semibold">{pagination.pages}</span> <span className="text-slate-400 mx-1">|</span> Total {pagination.total} users
                  </p>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <button
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-slate-700 bg-white"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-slate-700 bg-white"
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        {viewUser && <UserViewModal user={viewUser} onClose={() => setViewUser(null)} />}
        {editUser && <UserEditModal user={editUser} onClose={() => setEditUser(null)} onSave={editMutation.mutate} isSaving={editMutation.status === 'pending'} />}
        {statusUser && <UserStatusModal user={statusUser} onClose={() => setStatusUser(null)} onSave={statusMutation.mutate} isSaving={statusMutation.status === 'pending'} />}
        {deleteUserObj && <UserDeleteModal user={deleteUserObj} onClose={() => setDeleteUserObj(null)} onDelete={deleteMutation.mutate} isDeleting={deleteMutation.status === 'pending'} />}
      </div>
    </Layout>
  );
};

export default Users;
