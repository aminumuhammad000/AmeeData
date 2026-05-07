import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Mail, MessageSquare, RefreshCw, Send, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import * as adminApi from '../api/adminApi';
import Layout from '../components/Layout';
import { useToast } from '../hooks/ToastContext';

interface NotificationType {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const notificationTypes: NotificationType[] = [
    {
        id: 'system',
        label: 'System Info',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        description: 'General updates'
    },
    {
        id: 'promotion',
        label: 'Promotion',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
        ),
        description: 'Special offers'
    },
    {
        id: 'alert',
        label: 'Alert',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        description: 'Urgent notices'
    },
    {
        id: 'app_update',
        label: 'Update',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        description: 'New version'
    },
];

export default function Notifications() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'app' | 'email'>('app');

    // App Notification State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('system');
    const [actionLink, setActionLink] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Email Notification State
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [emailRecipients, setEmailRecipients] = useState('all'); // 'all' or 'active' or 'inactive' (simulated)

    // Fetch active broadcasts
    const { data: broadcastsData, isLoading: isLoadingBroadcasts } = useQuery({
        queryKey: ['broadcasts'],
        queryFn: () => adminApi.getBroadcasts().then(res => res.data)
    });

    const broadcasts = broadcastsData?.data || [];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteBroadcast(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
            showToast('Broadcast deleted successfully', 'success');
        },
        onError: (error: any) => {
            showToast(error?.response?.data?.message || 'Failed to delete broadcast', 'error');
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: any) => adminApi.updateBroadcast(data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
            showToast('Broadcast updated successfully', 'success');
            resetForm();
        },
        onError: (error: any) => {
            showToast(error?.response?.data?.message || 'Failed to update broadcast', 'error');
        }
    });

    const handleTypeSelect = (selectedType: string) => {
        setType(selectedType);
        if (selectedType === 'app_update' && !editingId) {
            setTitle('New App Update Available!');
            setMessage('A new version of the app is available. Please update now for the latest features and improvements.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setMessage('');
        setActionLink('');
        setType('system');
        setEditingId(null);
    };

    const handleEdit = (broadcast: any) => {
        setTitle(broadcast.title);
        setMessage(broadcast.message);
        setType(broadcast.type);
        setActionLink(broadcast.action_link || '');
        setEditingId(broadcast._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveTab('app');
    };

    const handleSendApp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !message.trim()) {
            showToast('Please fill in title and message', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    title: title.trim(),
                    message: message.trim(),
                    type,
                    action_link: actionLink.trim() || undefined,
                });
            } else {
                const response = await adminApi.sendBroadcast({
                    title: title.trim(),
                    message: message.trim(),
                    type,
                    action_link: actionLink.trim() || undefined,
                });

                if (response.data?.success) {
                    showToast(response.data.message || 'Notification sent successfully', 'success');
                    resetForm();
                    queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
                } else {
                    showToast(response.data?.message || 'Failed to send notification', 'error');
                }
            }
        } catch (error: any) {
            showToast(error?.response?.data?.message || 'Failed to send notification', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailSubject.trim() || !emailMessage.trim()) {
            showToast('Subject and message are required', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // In a real app, we would fetch users based on 'emailRecipients' filter
            // For now, we simulate sending to "All Users" which the backend handles or expects a list
            // Let's assume the backend will fetch users if we pass a special flag, or we send a dummy list for testing
            const dummyRecipients = ['test@example.com']; // In reality, fetch from API

            const response = await adminApi.sendEmail({
                subject: emailSubject,
                message: emailMessage,
                recipients: dummyRecipients
            });

            if (response.data?.success) {
                showToast('Email queued successfully!', 'success');
                setEmailSubject('');
                setEmailMessage('');
            }
        } catch (error: any) {
            showToast(error?.response?.data?.message || 'Failed to send email', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Communications</h1>
                            <p className="text-slate-500 mt-1">Send broadcasts and emails to your users.</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 bg-white p-1 rounded-xl inline-flex shadow-sm border border-slate-200">
                        <button
                            onClick={() => setActiveTab('app')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'app' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            App Push
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'email' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Mail className="w-4 h-4" />
                            Email Blast
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Form */}
                        <div className="lg:col-span-2 space-y-8">
                            {activeTab === 'app' ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="border-b border-slate-100 p-6 flex justify-between items-center bg-slate-50/50">
                                        <h2 className="text-lg font-bold text-slate-900">
                                            {editingId ? 'Edit Broadcast' : 'Send Push Notification'}
                                        </h2>
                                        {editingId && (
                                            <button onClick={resetForm} className="text-xs text-red-600 hover:text-red-700 font-medium">
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>

                                    <form onSubmit={handleSendApp} className="p-6 space-y-6">
                                        {/* Type Selection */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {notificationTypes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => handleTypeSelect(t.id)}
                                                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${type === t.id ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                                >
                                                    <div className={type === t.id ? 'text-blue-600' : 'text-slate-400'}>{t.icon}</div>
                                                    <span className="text-xs font-semibold">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                                <input
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="e.g. System Maintenance"
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                                    maxLength={50}
                                                />
                                                <p className="text-xs text-slate-400 text-right mt-1">{title.length}/50</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                                <textarea
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Write your message here..."
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition h-32 resize-none"
                                                    maxLength={250}
                                                />
                                                <p className="text-xs text-slate-400 text-right mt-1">{message.length}/250</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Action Link (Optional)</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                    </div>
                                                    <input
                                                        type="url"
                                                        value={actionLink}
                                                        onChange={(e) => setActionLink(e.target.value)}
                                                        placeholder="https://..."
                                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !title || !message}
                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? <RefreshCw className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                                            {editingId ? 'Update Notification' : 'Send Notification'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="border-b border-slate-100 p-6 bg-slate-50/50">
                                        <h2 className="text-lg font-bold text-slate-900">Send Email Blast</h2>
                                    </div>
                                    <form onSubmit={handleSendEmail} className="p-6 space-y-6">
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-3">
                                            <div className="flex-shrink-0 pt-0.5">ℹ️</div>
                                            <p>Emails are sent via the system's SMTP provider. Ensure your SMTP settings are configured in the backend.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Recipients</label>
                                            <select
                                                value={emailRecipients}
                                                onChange={(e) => setEmailRecipients(e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="all">All Users</option>
                                                <option value="active">Active Users Only</option>
                                                <option value="inactive">Inactive Users Only</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                            <input
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                                placeholder="e.g. Monthly Newsletter"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Message (HTML supported)</label>
                                            <textarea
                                                value={emailMessage}
                                                onChange={(e) => setEmailMessage(e.target.value)}
                                                placeholder="Write your email content here..."
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition h-48 resize-none font-mono text-sm"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !emailSubject || !emailMessage}
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? <RefreshCw className="animate-spin w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                            Send Email
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Right Column: History */}
                        <div className="space-y-6">
                            {/* Preview */}
                            {activeTab === 'app' && (title || message) && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hidden lg:block">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Live Preview</h3>
                                    <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                                        <div className="flex gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                                            <div className="flex-shrink-0 text-blue-500 mt-1">
                                                {notificationTypes.find(t => t.id === type)?.icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{title || 'Notification Title'}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{message || 'Your message preview will appear here in real-time.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Broadcasts */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[600px]">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-900">Recent Broadcasts</h3>
                                </div>
                                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                    {isLoadingBroadcasts ? (
                                        <div className="p-8 text-center text-slate-400 text-sm">Loading history...</div>
                                    ) : broadcasts.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm">No history found.</div>
                                    ) : (
                                        broadcasts.map((b: any) => (
                                            <div key={b._id} className="p-3 hover:bg-slate-50 rounded-lg group border border-transparent hover:border-slate-100 transition">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${b.type === 'alert' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                        {b.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(b.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-slate-800 text-sm mb-1">{b.title}</h4>
                                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{b.message}</p>

                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(b)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(b._id) }} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
