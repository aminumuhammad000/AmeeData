import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { getTransactions } from '../api/adminApi';
import Layout from '../components/Layout';
import TransactionViewModal from '../components/TransactionViewModal';

const Transactions: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewTransaction, setViewTransaction] = useState<any | null>(null);
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

  const params: any = { page, limit };
  if (statusFilter) params.status = statusFilter;
  if (typeFilter) params.type = typeFilter;
  if (debouncedSearch) params.search = debouncedSearch;

  const { data, status, isLoading } = useQuery({
    queryKey: ['transactions', page, statusFilter, typeFilter, debouncedSearch],
    queryFn: () => getTransactions(params).then((res: any) => res.data),
  });

  const transactions = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'airtime':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'data':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'electricity':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cable':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Transactions</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">Monitor payments, top-ups, and service logs</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <span className="text-sm text-slate-500">Total Transactions:</span>
              <span className="text-lg font-bold text-green-600">{pagination.total || 0}</span>
            </div>
          </div>

          {/* Controls: Search & Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6 sticky top-0 md:static z-10 transition-all">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by user, reference, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50"
                >
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-50"
                >
                  <option value="">All Types</option>
                  <option value="airtime">Airtime</option>
                  <option value="data">Data</option>
                  <option value="electricity">Electricity</option>
                  <option value="cable">Cable TV</option>
                </select>

                {(statusFilter || typeFilter || searchTerm) && (
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setTypeFilter('');
                      setSearchTerm('');
                      setPage(1);
                    }}
                    className="px-4 py-2.5 border border-slate-300 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 whitespace-nowrap transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 flex-col">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading transactions...</p>
              </div>
            ) : status === 'error' ? (
              <div className="p-12 text-center">
                <div className="bg-red-50 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to load data</h3>
                <p className="text-slate-500">Something went wrong while fetching transactions.</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No transactions found</h3>
                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Ref & User</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((txn: any) => (
                        <tr key={txn._id || txn.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-mono text-xs text-slate-500 mb-0.5">{txn.reference || txn._id}</p>
                              <p className="font-medium text-slate-900 text-sm">{txn.user?.first_name} {txn.user?.last_name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(txn.type)}`}>
                              {txn.type?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900">₦{txn.amount?.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(txn.status)}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {txn.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {txn.created_at ? new Date(txn.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setViewTransaction(txn)}
                              className="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                  {transactions.map((txn: any) => (
                    <div key={txn._id || txn.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{txn.user?.first_name} {txn.user?.last_name}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{txn.reference || txn._id}</p>
                        </div>
                        <span className="font-bold text-slate-900">₦{txn.amount?.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getTypeColor(txn.type)}`}>
                          {txn.type?.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(txn.status)}`}>
                          {txn.status?.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                        <span className="text-xs text-slate-500">{txn.created_at ? new Date(txn.created_at).toLocaleString() : '—'}</span>
                        <button
                          onClick={() => setViewTransaction(txn)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-600 order-2 sm:order-1 text-center sm:text-left">
                    Page <span className="font-semibold">{pagination.page}</span> of <span className="font-semibold">{pagination.pages}</span>
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

        {/* Transaction View Modal */}
        {viewTransaction && (
          <TransactionViewModal
            transaction={viewTransaction}
            onClose={() => setViewTransaction(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Transactions;
