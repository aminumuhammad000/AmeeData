import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { getReferralSettings, getReferralStats, updateReferralSettings } from '../api/adminApi';
import Layout from '../components/Layout';
import Toast from '../components/Toast';

const Referrals: React.FC = () => {
    const queryClient = useQueryClient();
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const { data: statsData } = useQuery({
        queryKey: ['referralStats'],
        queryFn: () => getReferralStats().then((res: any) => res.data.data),
    });

    const { data: settingsData, isLoading: settingsLoading } = useQuery({
        queryKey: ['referralSettings'],
        queryFn: () => getReferralSettings().then((res: any) => res.data.data),
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateReferralSettings(data).then((res: any) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['referralSettings'] });
            setToastMsg('Referral settings updated successfully');
            setToastType('success');
            setShowToast(true);
        },
        onError: (err: any) => {
            setToastMsg('Error: ' + (err.response?.data?.message || err.message));
            setToastType('error');
            setShowToast(true);
        }
    });

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            referrer_bonus_amount: Number(formData.get('referrer_bonus_amount')),
            referee_bonus_amount: Number(formData.get('referee_bonus_amount')),
            min_transaction_for_bonus: Number(formData.get('min_transaction_for_bonus')),
            is_active: formData.get('is_active') === 'on',
        };
        updateMutation.mutate(data);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Referral Program</h1>
                        <p className="text-slate-500 mt-1">Configure and monitor your platform's referral system</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Overview */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Total Referrals</p>
                                            <p className="text-2xl font-bold text-slate-900">{statsData?.total_referrals || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Referrers */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-900">Top Referrers</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Invites</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {statsData?.top_referrers?.map((ref: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">{ref.first_name} {ref.last_name}</td>
                                                    <td className="px-6 py-4 text-slate-500">{ref.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold">{ref.count}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!statsData?.top_referrers || statsData.top_referrers.length === 0) && (
                                                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No referral data found yet.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Settings Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-6">Program Settings</h2>
                                {settingsLoading ? (
                                    <div className="py-12 text-center text-slate-400">Loading settings...</div>
                                ) : (
                                    <form onSubmit={handleUpdate} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Referrer Bonus (₦)</label>
                                            <input
                                                name="referrer_bonus_amount"
                                                defaultValue={settingsData?.referrer_bonus_amount || 0}
                                                type="number"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Amount given to the person who invited.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Referee Bonus (₦)</label>
                                            <input
                                                name="referee_bonus_amount"
                                                defaultValue={settingsData?.referee_bonus_amount || 0}
                                                type="number"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Amount given to the newly joined person.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Transaction for Bonus (₦)</label>
                                            <input
                                                name="min_transaction_for_bonus"
                                                defaultValue={settingsData?.min_transaction_for_bonus || 0}
                                                type="number"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">First transaction must be at least this much.</p>
                                        </div>

                                        <div className="flex items-center gap-3 py-2">
                                            <input
                                                name="is_active"
                                                type="checkbox"
                                                defaultChecked={settingsData?.is_active}
                                                className="w-5 h-5 text-blue-600 rounded"
                                            />
                                            <label className="text-sm font-medium text-slate-700">Program Active</label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={updateMutation.status === 'pending'}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50"
                                        >
                                            {updateMutation.status === 'pending' ? 'Saving...' : 'Save Settings'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showToast && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Toast
                        id="referral-toast"
                        message={toastMsg}
                        type={toastType}
                        onClose={() => setShowToast(false)}
                    />
                </div>
            )}
        </Layout>
    );
};

export default Referrals;
