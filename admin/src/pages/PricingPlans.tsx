import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  bulkImportPricingPlans,
  createPricingPlan,
  deletePricingPlan,
  getPricingPlans,
  updatePricingPlan,
} from '../api/adminApi';
import Layout from '../components/Layout';
import PricingBulkImportModal from '../components/PricingBulkImportModal';
import PricingDeleteModal from '../components/PricingDeleteModal';
import PricingEditModal from '../components/PricingEditModal';
import PricingViewModal from '../components/PricingViewModal';

const PROVIDERS = [
  { id: 1, name: 'MTN' },
  { id: 2, name: 'Glo' },
  { id: 3, name: 'Airtel' },
  { id: 4, name: '9mobile' },
];

const TYPES = ['AIRTIME', 'DATA'];

const PricingPlans: React.FC = () => {
  const [page, setPage] = useState(1);
  const [providerId, setProviderId] = useState<string>('');
  const [type, setType] = useState<string>('');
  const limit = 10;

  const queryClient = useQueryClient();

  const [viewPlan, setViewPlan] = useState<any | null>(null);
  const [editPlan, setEditPlan] = useState<any | null>(null);
  const [deletePlan, setDeletePlan] = useState<any | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const params = {
    page,
    limit,
    ...(providerId && { providerId: parseInt(providerId) }),
    ...(type && { type }),
  };

  const { data, status, isLoading } = useQuery({
    queryKey: ['pricing-plans', page, providerId, type],
    queryFn: () => getPricingPlans(params).then((res: any) => res.data?.data),
  });

  const plans = data?.plans || [];
  const total = data?.total || 0;

  const editMutation = useMutation({
    mutationFn: (formData: any) =>
      updatePricingPlan(editPlan.id || editPlan._id, formData).then((res: any) => res.data),
    onSuccess: () => {
      setEditPlan(null);
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deletePricingPlan(deletePlan.id || deletePlan._id).then((res: any) => res.data),
    onSuccess: () => {
      setDeletePlan(null);
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (formData: any) => createPricingPlan(formData).then((res: any) => res.data),
    onSuccess: () => {
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: (plansData: any[]) =>
      bulkImportPricingPlans(plansData).then((res: any) => res.data),
    onSuccess: () => {
      setShowBulkImport(false);
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
  });

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Pricing Plans</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">Manage pricing for all providers and service types</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-sm font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Plan
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg transition-all shadow-sm font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Bulk Import
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6 sticky top-0 md:static z-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2 w-full overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                <select
                  value={providerId}
                  onChange={(e) => {
                    setProviderId(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 min-w-[140px] px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Providers</option>
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id.toString()}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setPage(1);
                  }}
                  className="flex-1 min-w-[140px] px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                {(providerId || type) && (
                  <button
                    onClick={() => {
                      setProviderId('');
                      setType('');
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
                <p className="text-slate-500 font-medium">Loading plans...</p>
              </div>
            ) : status === 'error' ? (
              <div className="p-12 text-center">
                <div className="bg-red-50 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to load data</h3>
                <p className="text-slate-500">Something went wrong while fetching pricing plans.</p>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: ['pricing-plans'] })} className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm">Retry</button>
              </div>
            ) : plans.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No plans found</h3>
                <p className="text-slate-500">Try adjusting your filters or add a new plan.</p>
                <button onClick={() => setShowCreateModal(true)} className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">Add New Plan</button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Plan Name</th>
                        <th className="px-6 py-4">Provider</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {plans.map((plan: any) => (
                        <tr key={plan._id || plan.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900 text-sm">{plan.name}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">{plan.providerName}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${plan.type === 'AIRTIME' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>
                              {plan.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">₦{plan.price?.toLocaleString()}</span>
                              {plan.discount > 0 && <span className="text-xs text-green-600 font-medium">{plan.discount}% Off</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${plan.active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full bg-current`}></span>
                              {plan.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setViewPlan(plan)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="View">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                              <button onClick={() => setEditPlan(plan)} className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition" title="Edit">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => setDeletePlan(plan)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition" title="Delete">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0l1-3h6l1 3" /></svg>
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
                  {plans.map((plan: any) => (
                    <div key={plan._id || plan.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{plan.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{plan.providerName}</p>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-slate-900">₦{plan.price?.toLocaleString()}</span>
                          {plan.discount > 0 && <span className="text-[10px] text-green-600 font-medium">{plan.discount}% Off</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${plan.type === 'AIRTIME' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                          {plan.type}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${plan.active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                          {plan.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                        <button onClick={() => setViewPlan(plan)} className="flex-1 text-center py-1 text-xs font-medium text-slate-600 hover:text-blue-600 border-r border-slate-100">View</button>
                        <button onClick={() => setEditPlan(plan)} className="flex-1 text-center py-1 text-xs font-medium text-slate-600 hover:text-green-600 border-r border-slate-100">Edit</button>
                        <button onClick={() => setDeletePlan(plan)} className="flex-1 text-center py-1 text-xs font-medium text-slate-600 hover:text-red-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-600 order-2 sm:order-1 text-center sm:text-left">
                    Page <span className="font-semibold">{page}</span> <span className="text-slate-400 mx-1">|</span> Total {total} plans
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
                      onClick={() => setPage((p) => p + 1)}
                      disabled={plans.length < limit}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modals */}
          {viewPlan && <PricingViewModal plan={viewPlan} onClose={() => setViewPlan(null)} />}
          {editPlan && (
            <PricingEditModal
              plan={editPlan}
              onClose={() => setEditPlan(null)}
              onSave={editMutation.mutate}
              isSaving={editMutation.status === 'pending'}
            />
          )}
          {deletePlan && (
            <PricingDeleteModal
              plan={deletePlan}
              onClose={() => setDeletePlan(null)}
              onDelete={deleteMutation.mutate}
              isDeleting={deleteMutation.status === 'pending'}
            />
          )}
          {showCreateModal && (
            <PricingEditModal
              plan={null}
              onClose={() => setShowCreateModal(false)}
              onSave={createMutation.mutate}
              isSaving={createMutation.status === 'pending'}
              isCreate
            />
          )}
          {showBulkImport && (
            <PricingBulkImportModal
              onClose={() => setShowBulkImport(false)}
              onImport={bulkImportMutation.mutate}
              isImporting={bulkImportMutation.status === 'pending'}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PricingPlans;
