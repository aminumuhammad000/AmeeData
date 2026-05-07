import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { deleteAuditLog, getAuditLogs } from '../api/adminApi';
import Layout from '../components/Layout';

const AuditLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 15;
  const queryClient = useQueryClient();
  const { data, status } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => getAuditLogs({ page, limit }).then((res: any) => res.data),
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: () => deleteAuditLog(deleteId!).then((res: any) => res.data),
    onSuccess: () => {
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });

  const getActionColor = (action: string) => {
    if (action?.includes('delete')) return 'bg-red-100 text-red-800 border-red-200';
    if (action?.includes('create')) return 'bg-green-100 text-green-800 border-green-200';
    if (action?.includes('update')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (action?.includes('credit')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
              <p className="text-slate-500 mt-1">Track all administrative actions and system changes.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm self-start sm:self-auto">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider mr-2">Total Logs</span>
              <span className="text-lg font-bold text-slate-900">{pagination.total}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            {status === 'pending' ? (
              <div className="flex flex-col items-center justify-center p-12 h-64">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading logs...</p>
              </div>
            ) : status === 'error' ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-64">
                <div className="bg-red-50 p-3 rounded-full text-red-600 mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-slate-900 font-semibold">Failed to load audit logs</p>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: ['audit-logs'] })} className="mt-2 text-blue-600 text-sm hover:underline">Try Again</button>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500">No audit logs found.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Admin</th>
                        <th className="px-6 py-4">Entity Details</th>
                        <th className="px-6 py-4">IP Address</th>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log: any) => (
                        <tr key={log._id || log.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getActionColor(log.action)}`}>
                              {log.action?.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{log.admin_id?.first_name} {log.admin_id?.last_name}</p>
                              <p className="text-xs text-slate-500">{log.admin_id?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="text-xs font-medium text-slate-500 uppercase">{log.entity_type}</span>
                              <p className="text-sm font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded inline-block ml-2">{log.entity_id?.slice(0, 8)}...</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                            {log.ip_address || '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 block whitespace-nowrap">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setDeleteId(log._id || log.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                              title="Delete Log"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0l1-3h6l1 3" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-4">
                  {logs.map((log: any) => (
                    <div key={log._id || log.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide ${getActionColor(log.action)}`}>
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-400">{log.timestamp ? new Date(log.timestamp).toLocaleDateString() : ''}</span>
                      </div>

                      <div className="flex items-center gap-3 py-2 border-b border-slate-50">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                          {log.admin_id?.first_name?.[0]}{log.admin_id?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{log.admin_id?.first_name} {log.admin_id?.last_name}</p>
                          <p className="text-xs text-slate-500">{log.admin_id?.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Entity</span>
                          <span className="font-medium text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{log.entity_type}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">IP Address</span>
                          <span className="font-mono text-slate-600">{log.ip_address || '—'}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-50 flex justify-end">
                        <button
                          onClick={() => setDeleteId(log._id || log.id)}
                          className="text-red-500 text-xs font-medium hover:text-red-700 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0l1-3h6l1 3" /></svg>
                          Delete Entry
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-600 text-center sm:text-left">
                    Page <span className="font-semibold text-slate-900">{pagination.page}</span> of <span className="font-semibold text-slate-900">{pagination.pages}</span>
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-slate-700"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-slate-700"
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0l1-3h6l1 3" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Log Entry?</h3>
              <p className="text-slate-500 text-sm mb-6">This action cannot be undone. Are you sure you want to permanently delete this audit record?</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.status === 'pending'}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-70"
                >
                  {deleteMutation.status === 'pending' ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AuditLogs;
