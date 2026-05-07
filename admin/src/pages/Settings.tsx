import { useQueryClient } from '@tanstack/react-query';
import { CreditCard, Globe, Mail, Save, Server, Smartphone } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as adminApi from '../api/adminApi';
import Layout from '../components/Layout';
import { useToast } from '../hooks/ToastContext';

interface SupportContent {
    email: string;
    phoneNumber: string;
    whatsappNumber: string;
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
}

interface SystemSettings {
    payment_gateway: 'vtstack' | 'payrant';
    notification_email: string;
    email_config: {
        smtp_host: string;
        smtp_port: number;
        smtp_user: string;
        smtp_pass: string;
        smtp_secure: boolean;
        sender_name: string;
    };
}

const Settings = () => {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    // Support Content State
    const [supportData, setSupportData] = useState<SupportContent>({
        email: '',
        phoneNumber: '',
        whatsappNumber: '',
        facebookUrl: '',
        twitterUrl: '',
        instagramUrl: '',
        websiteUrl: ''
    });

    // System Settings State
    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        payment_gateway: 'vtstack',
        notification_email: '',
        email_config: {
            smtp_host: '',
            smtp_port: 587,
            smtp_user: '',
            smtp_pass: '',
            smtp_secure: false,
            sender_name: 'VTU App'
        }
    });

    useEffect(() => {
        fetchContent();
        fetchSystemSettings();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await adminApi.getSupportContent();
            if (response.data.success) {
                setSupportData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch support content', error);
        }
    };

    const fetchSystemSettings = async () => {
        try {
            const response = await adminApi.getSystemSettings();
            if (response.data.success) {
                // Merge with default structure to ensure all fields exist
                setSystemSettings(prev => ({
                    ...prev,
                    ...response.data.data,
                    email_config: {
                        ...prev.email_config,
                        ...(response.data.data.email_config || {})
                    }
                }));
            }
        } catch (error) {
            console.error('Failed to fetch system settings', error);
        }
    };

    const handleSupportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSupportData({ ...supportData, [e.target.name]: e.target.value });
    };

    const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;

        if (name.startsWith('smtp_') || name === 'sender_name') {
            // Handle nested email config
            setSystemSettings(prev => ({
                ...prev,
                email_config: {
                    ...prev.email_config,
                    [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
                }
            }));
        } else {
            setSystemSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSupportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await adminApi.updateSupportContent(supportData);
            if (response.data.success) {
                showToast('Support settings updated successfully', 'success');
            }
        } catch (error) {
            showToast('Failed to update support settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSystemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Ensure port is number
            const payload = {
                ...systemSettings,
                email_config: {
                    ...systemSettings.email_config,
                    smtp_port: Number(systemSettings.email_config.smtp_port)
                }
            };

            const response = await adminApi.updateSystemSettings(payload);
            if (response.data.success) {
                showToast('System settings updated successfully', 'success');
                queryClient.invalidateQueries({ queryKey: ['system-settings'] });
            }
        } catch (error) {
            showToast('Failed to update system settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
                            <p className="text-slate-500 mt-1">Manage general application configuration and contacts.</p>
                        </div>
                    </div>

                    {/* System Configuration Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-100 p-6 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">System Configuration</h2>
                                <p className="text-xs text-slate-500">Payment gateways and core email settings</p>
                            </div>
                        </div>
                        <form onSubmit={handleSystemSubmit} className="p-6 md:p-8 space-y-8">

                            {/* Payment Gateway Section */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Payment Gateway</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${systemSettings.payment_gateway === 'vtstack' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <input
                                            type="radio"
                                            name="payment_gateway"
                                            value="vtstack"
                                            checked={systemSettings.payment_gateway === 'vtstack'}
                                            onChange={handleSystemChange}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="ml-3">
                                            <span className="block text-sm font-medium text-slate-900">VTStack (Recommended)</span>
                                            <span className="block text-xs text-slate-500">Fast, secure, and reliable payments via PalmPay.</span>
                                        </div>
                                    </label>

                                    <div className="flex items-center p-4 border border-slate-200 rounded-xl bg-slate-50 opacity-50 cursor-not-allowed select-none">
                                        <input
                                            type="radio"
                                            name="payment_gateway"
                                            value="payrant"
                                            disabled
                                            checked={false}
                                            onChange={() => {}}
                                            className="w-4 h-4 text-slate-400 cursor-not-allowed"
                                        />
                                        <div className="ml-3 flex-1">
                                            <span className="block text-sm font-medium text-slate-400">Payrant</span>
                                            <span className="block text-xs text-slate-400">Alternative payment provider.</span>
                                        </div>
                                        <span className="ml-auto text-xs font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Unavailable</span>
                                    </div>
                                </div>
                            </div>

                            {/* Email Configuration Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                                    <Server className="w-4 h-4 text-indigo-500" />
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">SMTP Email Configuration</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Notification "From" Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                name="notification_email"
                                                value={systemSettings.notification_email}
                                                onChange={handleSystemChange}
                                                placeholder="noreply@yourdomain.com"
                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">This email will appear as the sender.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">SMTP Host</label>
                                        <input
                                            type="text"
                                            name="smtp_host"
                                            value={systemSettings.email_config.smtp_host}
                                            onChange={handleSystemChange}
                                            placeholder="smtp.gmail.com"
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">SMTP Port</label>
                                        <input
                                            type="number"
                                            name="smtp_port"
                                            value={systemSettings.email_config.smtp_port}
                                            onChange={handleSystemChange}
                                            placeholder="587"
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">SMTP Username</label>
                                        <input
                                            type="text"
                                            name="smtp_user"
                                            value={systemSettings.email_config.smtp_user}
                                            onChange={handleSystemChange}
                                            placeholder="username"
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">SMTP Password</label>
                                        <input
                                            type="password"
                                            name="smtp_pass"
                                            value={systemSettings.email_config.smtp_pass}
                                            onChange={handleSystemChange}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Sender Name</label>
                                        <input
                                            type="text"
                                            name="sender_name"
                                            value={systemSettings.email_config.sender_name}
                                            onChange={handleSystemChange}
                                            placeholder="VTU App"
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center h-full pt-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="smtp_secure"
                                                checked={systemSettings.email_config.smtp_secure}
                                                onChange={handleSystemChange}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-slate-700 font-medium">Use Secure Connection (SSL/TLS)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Support Contact Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-100 p-6 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Support Information</h2>
                                <p className="text-xs text-slate-500">Contact details displayed to users in the app</p>
                            </div>
                        </div>
                        <form onSubmit={handleSupportSubmit} className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Support Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={supportData.email}
                                        onChange={handleSupportChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={supportData.phoneNumber}
                                        onChange={handleSupportChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Number</label>
                                    <input
                                        type="text"
                                        name="whatsappNumber"
                                        value={supportData.whatsappNumber}
                                        onChange={handleSupportChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Website URL</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="url"
                                            name="websiteUrl"
                                            value={supportData.websiteUrl || ''}
                                            onChange={handleSupportChange}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 text-indigo-600">Social Media Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Facebook</label>
                                        <input
                                            type="url"
                                            name="facebookUrl"
                                            value={supportData.facebookUrl || ''}
                                            onChange={handleSupportChange}
                                            placeholder="https://facebook.com/..."
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Twitter / X</label>
                                        <input
                                            type="url"
                                            name="twitterUrl"
                                            value={supportData.twitterUrl || ''}
                                            onChange={handleSupportChange}
                                            placeholder="https://twitter.com/..."
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Instagram</label>
                                        <input
                                            type="url"
                                            name="instagramUrl"
                                            value={supportData.instagramUrl || ''}
                                            onChange={handleSupportChange}
                                            placeholder="https://instagram.com/..."
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Contacts
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Settings;
