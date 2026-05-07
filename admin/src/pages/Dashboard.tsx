import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { getDashboardStats, getTransactions } from '../api/adminApi';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => getTransactions({ page: 1, limit: 5 }).then((res) => res.data),
  });

  const stats = [
    {
      label: 'Total Users',
      value: statsData?.data?.data?.totalUsers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v-2a9 9 0 00-18 0v2z" />
        </svg>
      ),
      bgGradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Active Users',
      value: statsData?.data?.data?.activeUsers || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'from-green-500 to-green-600',
      lightBg: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Transactions',
      value: statsData?.data?.data?.totalTransactions || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Success Transactions',
      value: statsData?.data?.data?.successfulTransactions || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'from-emerald-500 to-emerald-600',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Total Data Sales',
      value: statsData?.data?.data?.totalDataSales || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgGradient: 'from-orange-500 to-orange-600',
      lightBg: 'bg-orange-50',
      textColor: 'text-orange-600',
      isCurrency: true,
    },
    {
      label: 'Total Airtime Sales',
      value: statsData?.data?.data?.totalAirtimeSales || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      bgGradient: 'from-pink-500 to-pink-600',
      lightBg: 'bg-pink-50',
      textColor: 'text-pink-600',
      isCurrency: true,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">
                Overview of your platform's performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 shadow-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6 mb-8">
            {statsLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
                    <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="h-8 w-24 bg-slate-100 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-slate-100 rounded"></div>
                </div>
              ))
            ) : statsError ? (
              <div className="col-span-full bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>Failed to load dashboard statistics. Please try refreshing the page.</p>
              </div>
            ) : (
              stats.map((stat, index) => <StatCard key={index} {...stat} />)
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Recent Transactions */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
                  <p className="text-sm text-slate-500">Latest financial activity across the platform</p>
                </div>
                <a href="/transactions" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  View All
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Transaction</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactionsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                          <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded"></div></td>
                          <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                          <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                        </tr>
                      ))
                    ) : transactionsData?.data?.length > 0 ? (
                      transactionsData.data.map((tx: any) => (
                        <tr key={tx._id || tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type?.toLowerCase() === 'debit' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {tx.type?.toLowerCase() === 'debit' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                  )}
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{tx.description || 'Transaction'}</p>
                                <p className="text-xs text-slate-500">{tx.reference}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-medium text-sm ${tx.type?.toLowerCase() === 'debit' ? 'text-slate-900' : 'text-green-600'
                              }`}>
                              {tx.type?.toLowerCase() === 'debit' ? '-' : '+'}₦{Number(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${tx.status?.toLowerCase() === 'successful' || tx.status?.toLowerCase() === 'success' ? 'bg-green-100 text-green-800' :
                              tx.status?.toLowerCase() === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {tx.status?.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                          No recent transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
                <h3 className="text-lg font-bold mb-4 relative z-10">Platform Health</h3>
                <div className="space-y-5 relative z-10">
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-slate-300">
                      <span>Success Rate</span>
                      <span className="text-white font-medium">98.5%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[98.5%] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-slate-300">
                      <span>Server Uptime</span>
                      <span className="text-white font-medium">99.9%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[99.9%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href="/users" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Add User</span>
                  </a>
                  <a href="/pricing" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Edit Plan</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  lightBg,
  textColor,
  isCurrency,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  lightBg: string;
  textColor: string;
  isCurrency?: boolean;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${textColor}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-24 h-24' })}
    </div>

    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-xl ${lightBg} ${textColor} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">
          {isCurrency ? `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value.toLocaleString()}
        </p>
        <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
