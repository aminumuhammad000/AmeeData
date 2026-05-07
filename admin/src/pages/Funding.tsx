import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { getProviderBalances } from '../api/adminApi';
import Layout from '../components/Layout';

const Funding: React.FC = () => {
  const { data: balancesRes, status: balancesStatus } = useQuery({
    queryKey: ['provider-balances'],
    queryFn: async () => {
      const res = await getProviderBalances();
      return res.data?.data as { providers: Array<{ code: string; name: string; balance: number | null; currency: string | null; status: string }>; total: number };
    }
  });

  const providers = balancesRes?.providers || [];
  const total = balancesRes?.total || 0;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Funding & Balances</h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Monitor real-time balances across all connected providers
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Provider Balance</p>
                <p className="text-3xl font-bold text-slate-900">₦{Number(total || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Active Providers</p>
                <p className="text-3xl font-bold text-slate-900">{providers.length}</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">System Status</p>
                <p className="text-3xl font-bold text-green-600">Operational</p>
              </div>
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Provider Balances Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Provider Wallet Balances</h2>
              <p className="text-sm text-slate-500 mt-1">Detailed breakdown of funds available in each provider account</p>
            </div>

            {balancesStatus === 'pending' && (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">Fetching provider balances...</p>
              </div>
            )}

            {balancesStatus === 'error' && (
              <div className="p-8 text-center bg-red-50 text-red-700">
                <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">Failed to load provider balances. Please try again.</p>
              </div>
            )}

            {balancesStatus === 'success' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Provider Name</th>
                      <th className="px-6 py-4">API Code</th>
                      <th className="px-6 py-4">Current Balance</th>
                      <th className="px-6 py-4">Connection Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {providers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No providers configured.
                        </td>
                      </tr>
                    ) : (
                      providers.map((p) => (
                        <tr key={p.code} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{p.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                              {p.code.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-mono font-medium ${(p.balance || 0) < 1000 ? 'text-red-600' : 'text-slate-900'
                              }`}>
                              {p.balance === null ? 'N/A' : `₦${Number(p.balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${p.status === 'ok' ? 'bg-green-100 text-green-700' :
                                p.status === 'unsupported' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'ok' ? 'bg-green-500' :
                                  p.status === 'unsupported' ? 'bg-amber-500' :
                                    'bg-red-500'
                                }`}></span>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Funding;
