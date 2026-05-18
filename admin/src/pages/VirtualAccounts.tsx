import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useRef } from 'react';
import { getVirtualAccounts } from '../api/adminApi';
import Layout from '../components/Layout';

const VirtualAccounts: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const limit = 20;

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

  const { data, isLoading, status, refetch } = useQuery({
    queryKey: ['virtual-accounts', page, debouncedSearch],
    queryFn: () => getVirtualAccounts({ page, limit, search: debouncedSearch || undefined }).then((res: any) => res.data),
  });

  const accounts = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Virtual Accounts</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">Users with generated wallet funding accounts</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <span className="text-sm text-slate-500">Total Accounts:</span>
              <span className="text-lg font-bold text-purple-600">{pagination.total || 0}</span>
            </div>
          </div>

          {/* Controls: Search */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by account number or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 flex-col">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading virtual accounts...</p>
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
                <h3 className="text-lg font-bold text-slate-900 mb-1">No virtual accounts found</h3>
                <p className="text-slate-500">Check back later or try a different search term.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Account Details</th>
                        <th className="px-6 py-4">Bank & Provider</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Created</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {accounts.map((acct: any) => (
                        <tr key={acct.id || acct._id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                {`${acct.user?.first_name?.[0] || '?'}${acct.user?.last_name?.[0] || '?'}`.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">
                                  {acct.user?.first_name} {acct.user?.last_name}
                                </p>
                                <p className="text-xs text-slate-500 font-medium">{acct.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                  {acct.accountNumber}
                                </span>
                                <button 
                                  onClick={() => copyToClipboard(acct.accountNumber)}
                                  className="p-1 text-slate-400 hover:text-purple-600 transition"
                                  title="Copy account number"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{acct.accountName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-slate-700">{acct.bankName}</span>
                              <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                {acct.provider}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              acct.status === 'active'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {acct.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {acct.createdAt ? new Date(acct.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button className="text-slate-400 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                  {accounts.map((acct: any) => (
                    <div key={acct.id || acct._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                             {`${acct.user?.first_name?.[0] || '?'}${acct.user?.last_name?.[0] || '?'}`.toUpperCase()}
                           </div>
                           <div>
                             <p className="font-semibold text-slate-900 text-sm">{acct.user?.first_name} {acct.user?.last_name}</p>
                             <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{acct.user?.email}</p>
                           </div>
                         </div>
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${acct.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                           {acct.status?.toUpperCase()}
                         </span>
                      </div>

                      <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
                         <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Account Details</span>
                            <span className="text-[10px] text-slate-500 font-medium italic">{acct.bankName}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="font-mono text-base font-bold text-slate-900 tracking-wider font-mono">{acct.accountNumber}</span>
                            <button onClick={() => copyToClipboard(acct.accountNumber)} className="text-purple-600 hover:scale-110 active:scale-95 transition transform">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                            </button>
                         </div>
                         <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">{acct.accountName}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px]">
                         <span className="text-slate-400 font-medium">Provider: <span className="text-slate-900 font-bold uppercase">{acct.provider}</span></span>
                         <span className="text-slate-400 font-medium">{acct.createdAt ? new Date(acct.createdAt).toLocaleDateString() : '-'}</span>
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
                      onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                      disabled={page === 1}
                    >Previous</button>
                    <button
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-slate-700 bg-white"
                      onClick={() => { setPage(p => Math.min(pagination.pages, p + 1)); window.scrollTo(0, 0); }}
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

