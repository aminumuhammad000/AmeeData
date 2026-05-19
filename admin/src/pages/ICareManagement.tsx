import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCareStats, getCareRequests, getCareCircleMemberships } from '../api/adminApi';
import Layout from '../components/Layout';

const ICareManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'circle'>('requests');
  const [requestPage, setRequestPage] = useState(1);
  const [circlePage, setCirclePage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['care-stats'],
    queryFn: () => getCareStats().then(res => res.data.data),
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['care-requests', requestPage, statusFilter],
    queryFn: () => getCareRequests({ page: requestPage, limit: 15, status: statusFilter }).then(res => res.data),
    enabled: activeTab === 'requests',
  });

  const { data: circleData, isLoading: circleLoading } = useQuery({
    queryKey: ['care-circle', circlePage],
    queryFn: () => getCareCircleMemberships({ page: circlePage, limit: 15 }).then(res => res.data),
    enabled: activeTab === 'circle',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  return (
    <Layout>
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">I Care Ecosystem</h1>
          <p className="text-slate-500">Monitor and manage peer-to-peer care requests and circle memberships.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Care Requests</p>
            <h3 className="text-2xl font-bold text-slate-900">{statsLoading ? '...' : statsData?.total_requests}</h3>
            <p className="text-xs text-slate-400 mt-2">All time requests</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Care Volume</p>
            <h3 className="text-2xl font-bold text-purple-600">{statsLoading ? '...' : formatCurrency(statsData?.total_care_volume)}</h3>
            <p className="text-xs text-slate-400 mt-2">Successful transfers</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">Locked Care Balance</p>
            <h3 className="text-2xl font-bold text-green-600">{statsLoading ? '...' : formatCurrency(statsData?.total_locked_care_balance)}</h3>
            <p className="text-xs text-slate-400 mt-2">Circulating in ecosystem</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-1">Circle Memberships</p>
            <h3 className="text-2xl font-bold text-blue-600">{statsLoading ? '...' : statsData?.total_circle_members}</h3>
            <p className="text-xs text-slate-400 mt-2">User favorite connections</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-8 py-4 text-sm font-bold transition-all ${
                activeTab === 'requests'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Care Requests
            </button>
            <button
              onClick={() => setActiveTab('circle')}
              className={`px-8 py-4 text-sm font-bold transition-all ${
                activeTab === 'circle'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Circle Memberships
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'requests' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Recent Requests</h2>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-4 font-semibold">Requester</th>
                        <th className="pb-4 font-semibold">Provider</th>
                        <th className="pb-4 font-semibold">Amount</th>
                        <th className="pb-4 font-semibold">Purpose</th>
                        <th className="pb-4 font-semibold">Status</th>
                        <th className="pb-4 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {requestsLoading ? (
                        <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading requests...</td></tr>
                      ) : requestsData?.data?.length === 0 ? (
                        <tr><td colSpan={6} className="py-8 text-center text-slate-400">No requests found</td></tr>
                      ) : (
                        requestsData?.data?.map((req: any) => (
                          <tr key={req._id} className="text-sm hover:bg-slate-50/50 transition-colors">
                            <td className="py-4">
                              <div className="font-semibold text-slate-900">{req.requester_id?.first_name} {req.requester_id?.last_name}</div>
                              <div className="text-xs text-slate-400">{req.requester_id?.phone_number}</div>
                            </td>
                            <td className="py-4">
                              <div className="font-semibold text-slate-900">{req.provider_id?.first_name} {req.provider_id?.last_name}</div>
                              <div className="text-xs text-slate-400">{req.provider_id?.phone_number}</div>
                            </td>
                            <td className="py-4 font-bold text-slate-900">{formatCurrency(req.amount)}</td>
                            <td className="py-4 text-slate-600 italic">"{req.purpose}"</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                req.status === 'declined' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="py-4 text-slate-500 text-xs">
                              {new Date(req.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <p className="text-xs text-slate-400">
                    Showing {(requestPage - 1) * 15 + 1} to {Math.min(requestPage * 15, requestsData?.pagination?.total || 0)} of {requestsData?.pagination?.total || 0}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRequestPage(p => Math.max(1, p - 1))}
                      disabled={requestPage === 1}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setRequestPage(p => p + 1)}
                      disabled={requestPage >= (requestsData?.pagination?.pages || 1)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'circle' && (
              <>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Circle Memberships</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-4 font-semibold">User</th>
                        <th className="pb-4 font-semibold">Added Member</th>
                        <th className="pb-4 font-semibold">Relationship</th>
                        <th className="pb-4 font-semibold">Nickname</th>
                        <th className="pb-4 font-semibold">Pinned</th>
                        <th className="pb-4 font-semibold">Date Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {circleLoading ? (
                        <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading memberships...</td></tr>
                      ) : circleData?.data?.length === 0 ? (
                        <tr><td colSpan={6} className="py-8 text-center text-slate-400">No memberships found</td></tr>
                      ) : (
                        circleData?.data?.map((m: any) => (
                          <tr key={m._id} className="text-sm hover:bg-slate-50/50 transition-colors">
                            <td className="py-4">
                              <div className="font-semibold text-slate-900">{m.user_id?.first_name} {m.user_id?.last_name}</div>
                              <div className="text-xs text-slate-400">{m.user_id?.email}</div>
                            </td>
                            <td className="py-4">
                              <div className="font-semibold text-slate-900">{m.member_id?.first_name} {m.member_id?.last_name}</div>
                              <div className="text-xs text-slate-400">{m.member_id?.phone_number}</div>
                            </td>
                            <td className="py-4 text-slate-600 uppercase text-xs font-bold tracking-tight">
                              {m.relationship_label || 'Friend'}
                            </td>
                            <td className="py-4 text-slate-600 italic">
                              {m.nickname || '-'}
                            </td>
                            <td className="py-4">
                              {m.is_pinned ? (
                                <span className="bg-purple-100 text-purple-600 p-1 rounded-full inline-block">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                </span>
                              ) : '-'}
                            </td>
                            <td className="py-4 text-slate-500 text-xs">
                              {new Date(m.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <p className="text-xs text-slate-400">
                    Showing {(circlePage - 1) * 15 + 1} to {Math.min(circlePage * 15, circleData?.pagination?.total || 0)} of {circleData?.pagination?.total || 0}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCirclePage(p => Math.max(1, p - 1))}
                      disabled={circlePage === 1}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCirclePage(p => p + 1)}
                      disabled={circlePage >= (circleData?.pagination?.pages || 1)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
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

export default ICareManagement;
