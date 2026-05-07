import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { getLeaderboard } from '../api/adminApi';
import Layout from '../components/Layout';

const Leaderboard: React.FC = () => {
  const [period, setPeriod] = useState('monthly');

  const { data: leaderboardData, isLoading, isError } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => getLeaderboard({ period }).then((res) => res.data),
  });

  const periods = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'all-time', label: 'All Time' },
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transaction Leaderboard</h1>
            <p className="text-slate-500 mt-1">
              Recognizing our top performing users by transaction volume
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  period === p.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium tracking-wide">Fetching top performers...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Failed to load leaderboard</h3>
              <p className="text-slate-500 mt-1">There was an issue connecting to the analytics server.</p>
            </div>
          ) : leaderboardData?.data?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Rank</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Transactions</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Total Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboardData.data.map((item: any, index: number) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50' :
                          index === 1 ? 'bg-slate-100 text-slate-600 ring-4 ring-slate-50' :
                          index === 2 ? 'bg-orange-100 text-orange-700 ring-4 ring-orange-50' :
                          'bg-white border border-slate-200 text-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-110 transition-transform ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                            'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
                          }`}>
                            {item.user.first_name[0]}{item.user.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {item.user.first_name} {item.user.last_name}
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">{item.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-semibold">{item.transactionCount}</span>
                          <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Orders</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className={`text-lg font-black ${
                          index === 0 ? 'text-purple-600' : 'text-slate-900'
                        }`}>
                          ₦{item.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 text-slate-300 rounded-full mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">No data found</h3>
              <p className="text-slate-500 mt-1">There are no transactions recorded for this period yet.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
             Live Analytics
           </div>
           <div className="w-1 h-1 rounded-full bg-slate-300"></div>
           <div>Updated {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
