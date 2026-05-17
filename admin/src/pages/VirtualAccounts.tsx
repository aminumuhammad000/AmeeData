import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { getVirtualAccounts } from '../api/adminApi';
import Layout from '../components/Layout';

const VirtualAccounts: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, status, refetch } = useQuery({
    queryKey: ['virtual-accounts', page],
    queryFn: () => getVirtualAccounts({ page, limit }).then((res: any) => res.data),
  });

  const accounts = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Virtual Accounts</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">Users who have generated a virtual account number</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <span className="text-sm text-slate-500">Total Accounts:</span>
              <span className="text-lg font-bold text-purple-600">{pagination.total || 0}</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 flex-col">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading accounts...</p>
              </div>
            ) : status === 'error' ? (
              <div className="p-12 text-center">
                <div className="bg-red-50 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to load data</h3>
                <p className="text-slate-500">Something went wrong while fetching virtual accounts.</p>
                <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm">Retry</button>
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No virtual accounts yet</h3>
                <p className="text-slate-500">No users have generated virtual account numbers.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Account Number</th>
                        <th className="px-6 py-4">Account Name</th>
                        <th className="px-6 py-4">Bank</th>
                        <th className="px-6 py-4">Provider</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {accounts.map((acct: any) => (
                        <tr key={acct.id || acct._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white">
                                {`${acct.user?.first_name?.[0] || '?'}${acct.user?.last_name?.[0] || '?'}`.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">
                                  {acct.user?.first_name} {acct.user?.last_name}
                                </p>
                                <p className="text-xs text-slate-500">{acct.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                              {acct.accountNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">{acct.accountName}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{acct.bankName}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                              {acct.provider}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              acct.status === 'active'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {acct.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {acct.createdAt ? new Date(acct.createdAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                  {accounts.map((acct: any) => (
                    <div key={acct.id || acct._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {`${acct.user?.first_name?.[0] || '?'}${acct.user?.last_name?.[0] || '?'}`.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{acct.user?.first_name} {acct.user?.last_name}</p>
                          <p className="text-xs text-slate-500">{acct.user?.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="bg-slate-50 p-2 rounded col-span-2">
                          <span className="block text-slate-400 text-[10px] uppercase mb-1">Account Number</span>
                          <span className="font-mono font-bold text-slate-900">{acct.accountNumber}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="block text-slate-400 text-[10px] uppercase">Bank</span>
                          <span className="font-medium">{acct.bankName}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="block text-slate-400 text-[10px] uppercase">Status</span>
                          <span className={`font-medium ${acct.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {acct.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-600 order-2 sm:order-1 text-center sm:text-left">
                    Page <span className="font-semibold">{pagination.page}</span> of <span className="font-semibold">{pagination.pages}</span>
                    <span className="text-slate-400 mx-1">|</span> Total {pagination.total} accounts
                  </p>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <button
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-slate-700 bg-white"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >Previous</button>
                    <button
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-slate-700 bg-white"
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page >= pagination.pages}
                    >Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VirtualAccounts;
