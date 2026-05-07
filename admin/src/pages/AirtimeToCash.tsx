import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { createA2CSetting, getA2CRequests, getA2CSettings, updateA2CRequest, updateA2CSetting } from '../api/adminApi';
import Layout from '../components/Layout';
import type { ToastMessage } from '../components/Toast';
import Toast from '../components/Toast';

const AirtimeToCash: React.FC = () => {
    const queryClient = useQueryClient();
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [adminNote, setAdminNote] = useState('');
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [editingSetting, setEditingSetting] = useState<any>(null);

    const { data: requests, isLoading: requestsLoading } = useQuery({
        queryKey: ['a2cRequests'],
        queryFn: () => getA2CRequests().then(res => res.data.data)
    });

    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ['a2cSettings'],
        queryFn: () => getA2CSettings().then(res => res.data.data)
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, note }: any) => updateA2CRequest(id, { status, admin_note: note }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['a2cRequests'] });
            const actionText = variables.status === 'approved' ? 'approved' : 'rejected';
            setToast({ id: 'a2c-status', message: `Request ${actionText} successfully`, type: 'success' });
            setSelectedRequest(null);
            setAdminNote('');
        },
        onError: (err: any) => {
            setToast({ id: 'a2c-error', message: err.response?.data?.message || 'Error updating status', type: 'error' });
        }
    });

    const saveSettingMutation = useMutation({
        mutationFn: (data: any) => {
            if (editingSetting?._id) return updateA2CSetting(editingSetting._id, data);
            return createA2CSetting(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['a2cSettings'] });
            setToast({ id: 'a2c-setting', message: 'Setting saved successfully', type: 'success' });
            setShowSettingModal(false);
            setEditingSetting(null);
        }
    });

    const handleAction = (request: any, status: 'approved' | 'rejected') => {
        updateStatusMutation.mutate({ id: request._id, status, note: adminNote });
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Airtime to Cash</h1>
                            <p className="text-slate-500 mt-1">Manage airtime conversion requests and rates</p>
                        </div>
                        <button
                            onClick={() => { setEditingSetting(null); setShowSettingModal(true); }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
                        >
                            Add New Network
                        </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Requests Table */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                                <div className="p-6 border-b border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-900">Conversion Requests</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4">User / Contact</th>
                                                <th className="px-6 py-4">Network / Amount</th>
                                                <th className="px-6 py-4">Receive</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {requestsLoading ? (
                                                <tr><td colSpan={5} className="p-12 text-center text-slate-400">Loading requests...</td></tr>
                                            ) : requests?.map((request: any) => (
                                                <tr key={request._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-slate-900">{request.user_id?.first_name} {request.user_id?.last_name}</p>
                                                        <p className="text-slate-500 text-xs">{request.phone_number}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-blue-600">{request.network}</span>
                                                        <p className="text-slate-900">₦{request.amount.toLocaleString()}</p>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-green-600">
                                                        ₦{request.amount_to_receive.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${request.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                                            request.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                            }`}>
                                                            {request.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium">
                                                        {request.status === 'pending' && (
                                                            <button
                                                                onClick={() => setSelectedRequest(request)}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Process
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {requests?.length === 0 && (
                                                <tr><td colSpan={5} className="p-12 text-center text-slate-400">No requests found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Settings Column */}
                        <div className="xl:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 font-mono uppercase tracking-wider">Network Rates</h2>
                                {settingsLoading ? (
                                    <p className="text-slate-400 text-center">Loading settings...</p>
                                ) : (
                                    <div className="space-y-4">
                                        {settings?.map((setting: any) => (
                                            <div key={setting._id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900">{setting.network}</span>
                                                        {!setting.is_active && <span className="text-[10px] text-red-500 font-bold uppercase">Inactive</span>}
                                                    </div>
                                                    <p className="text-sm text-slate-500">Rate: <span className="font-bold text-blue-600">{setting.conversion_rate}%</span></p>
                                                    <p className="text-xs text-slate-400">Recv Phone: {setting.phone_number}</p>
                                                </div>
                                                <button
                                                    onClick={() => { setEditingSetting(setting); setShowSettingModal(true); }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Modal */}
                {selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Process Request</h2>
                            <p className="text-slate-500 mb-6">User: {selectedRequest.user_id?.first_name} ({selectedRequest.phone_number})</p>

                            <div className="bg-blue-50 p-4 rounded-xl mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-600">Network / Amount:</span>
                                    <span className="font-bold">{selectedRequest.network} / ₦{selectedRequest.amount}</span>
                                </div>
                                <div className="flex justify-between border-t border-blue-100 pt-2">
                                    <span className="text-slate-600 font-bold">User Receives:</span>
                                    <span className="font-bold text-blue-600 text-lg">₦{selectedRequest.amount_to_receive}</span>
                                </div>
                            </div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Note (optional)</label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-6 h-24"
                                placeholder="Reason for rejection or processing details..."
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleAction(selectedRequest, 'rejected')}
                                    className="py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition"
                                >
                                    Reject Request
                                </button>
                                <button
                                    onClick={() => handleAction(selectedRequest, 'approved')}
                                    className="py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200"
                                >
                                    Approve & Credit
                                </button>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="w-full mt-4 text-slate-400 hover:text-slate-600 font-medium">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Settings Modal */}
                {showSettingModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingSetting ? 'Edit Network' : 'Add Network'}</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const data = {
                                    network: fd.get('network'),
                                    conversion_rate: Number(fd.get('rate')),
                                    phone_number: fd.get('phone'),
                                    min_amount: Number(fd.get('min')),
                                    max_amount: Number(fd.get('max')),
                                    is_active: fd.get('active') === 'on'
                                };
                                saveSettingMutation.mutate(data);
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Network Name</label>
                                    <select
                                        name="network"
                                        defaultValue={editingSetting?.network}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 ring-blue-500 bg-white"
                                        required
                                    >
                                        <option value="" disabled>Select Network</option>
                                        <option value="MTN">MTN</option>
                                        <option value="GLO">GLO</option>
                                        <option value="Airtel">Airtel</option>
                                        <option value="9mobile">9mobile</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rate (%)</label>
                                        <input name="rate" type="number" defaultValue={editingSetting?.conversion_rate || 80} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 ring-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Active</label>
                                        <input name="active" type="checkbox" defaultChecked={editingSetting?.is_active ?? true} className="w-5 h-5 rounded" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Receiver Phone (for users to send to)</label>
                                    <input name="phone" defaultValue={editingSetting?.phone_number} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 ring-blue-500" required placeholder="08123456789" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min (₦)</label>
                                        <input name="min" type="number" defaultValue={editingSetting?.min_amount || 500} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max (₦)</label>
                                        <input name="max" type="number" defaultValue={editingSetting?.max_amount || 50000} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 ring-blue-500" />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowSettingModal(false)} className="flex-1 py-2 font-bold text-slate-500">Cancel</button>
                                    <button type="submit" className="flex-2 px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </Layout>
    );
};

export default AirtimeToCash;
