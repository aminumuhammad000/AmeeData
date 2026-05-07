import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { creditUserWallet, getUsers } from '../api/adminApi';
import Layout from '../components/Layout';

const WalletCredit: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('Admin wallet credit');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Debounce search manually if hook doesn't exist
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: usersData, isFetching } = useQuery({
    queryKey: ['users-search', debouncedSearch],
    queryFn: () => getUsers({ page: 1, limit: 10, search: debouncedSearch }).then((res: any) => res.data),
    enabled: true, // Always enabled to show initial list
  });

  const users = usersData?.data || [];

  const creditMutation = useMutation({
    mutationFn: (data: { userId: string; amount: number; description: string }) =>
      creditUserWallet(data.userId, data.amount, data.description).then((res: any) => res.data),
    onSuccess: () => {
      setSuccessMessage(`Successfully credited ₦${parseFloat(amount).toLocaleString()} to ${selectedUser.first_name}`);
      setIsConfirmOpen(false);
      setAmount('');
      setDescription('Admin wallet credit');
      setSelectedUser(null);
      setSearch('');
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to credit wallet');
      setIsConfirmOpen(false);
    }
  });

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearch(''); // Clear search on select to cleaner look? Or keep it? Let's clear it or keep it but hide list if selected.
    // Better UX: Show selected user clearly, hide list.
  };

  const handleConfirm = () => {
    if (!selectedUser || !amount) return;
    creditMutation.mutate({
      userId: selectedUser._id,
      amount: parseFloat(amount),
      description
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Credit User Wallet</h1>
            <p className="text-slate-500 mt-2">Search for a user and add funds to their wallet manually.</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-in fade-in slide-in-from-top-4">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 animate-in fade-in slide-in-from-top-4">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="font-medium">{error}</p>
              <button onClick={() => setError('')} className="ml-auto hover:text-red-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">

              {/* Step 1: Select User */}
              <div className={`transition-all duration-300 ${selectedUser ? 'opacity-50 pointer-events-none filter blur-[1px]' : ''}`}>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Find User</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, or phone number..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                  />
                  {isFetching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {search.length > 0 && !selectedUser && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100 absolute z-20 w-full max-w-2xl">
                    {users.length === 0 && !isFetching ? (
                      <div className="p-4 text-center text-slate-500 text-sm">No users found.</div>
                    ) : (
                      users.map((user: any) => (
                        <div
                          key={user._id}
                          onClick={() => handleSelectUser(user)}
                          className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{user.first_name} {user.last_name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Balance</p>
                              <p className="text-sm font-semibold text-slate-700">₦{(user.wallet_balance || 0).toLocaleString()}</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected User Preview */}
              {selectedUser && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition"
                    title="Change User"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
                      {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-xl font-bold text-slate-900">{selectedUser.first_name} {selectedUser.last_name}</h3>
                      <p className="text-slate-500">{selectedUser.email}</p>
                      <p className="text-slate-500 text-sm mt-0.5">{selectedUser.phone_number}</p>

                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white border border-blue-200 rounded-full shadow-sm">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Current Balance:</span>
                        <span className="text-sm font-bold text-blue-700">₦{(selectedUser.wallet_balance || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Amount & Details */}
              {selectedUser && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Amount to Credit (₦)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₦</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Reason / Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Refund for failed transaction"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setIsConfirmOpen(true)}
                      disabled={!amount || parseFloat(amount) <= 0}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
                    >
                      Continue to Confirm
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Credit</h3>
              <p className="text-slate-500 mb-6">Are you sure you want to credit this user's wallet?</p>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-3 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">User:</span>
                  <span className="font-semibold text-slate-900">{selectedUser.first_name} {selectedUser.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Amount:</span>
                  <span className="font-bold text-green-600 text-lg">₦{parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">New Balance:</span>
                  <span className="font-semibold text-slate-700">≈ ₦{((selectedUser.wallet_balance || 0) + parseFloat(amount)).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={creditMutation.status === 'pending'}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition disabled:opacity-70"
                >
                  {creditMutation.status === 'pending' ? 'Processing...' : 'Yes, Credit Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default WalletCredit;
