import { useQueryClient } from '@tanstack/react-query';
import { CreditCard, Globe, Mail, Save, Server, Smartphone, Zap, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
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
    preferred_data_provider: string | null;
    preferred_airtime_provider: string | null;
    preferred_both_provider: string | null;
}

interface Provider {
    _id: string;
    name: string;
    code: string;
    active: boolean;
    priority: number;
    supported_services: string[];
}

const Settings = () => {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [providerLoading, setProviderLoading] = useState(false);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [providerSaveLoading, setProviderSaveLoading] = useState(false);

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
        },
        preferred_data_provider: null,
        preferred_airtime_provider: null,
        preferred_both_provider: null,
    });

    // Provider preference state (separate so we can save independently)
    const [dataProvider, setDataProvider] = useState<string | null>(null);
    const [airtimeProvider, setAirtimeProvider] = useState<string | null>(null);
    const [bothProvider, setBothProvider] = useState<string | null>(null);

    useEffect(() => {
        fetchContent();
        fetchSystemSettings();
        fetchProviders();
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
                const data = response.data.data;
                setSystemSettings(prev => ({
                    ...prev,
                    ...data,
                    email_config: {
                        ...prev.email_config,
                        ...(data.email_config || {})
                    }
                }));
                setDataProvider(data.preferred_data_provider || null);
                setAirtimeProvider(data.preferred_airtime_provider || null);
                setBothProvider(data.preferred_both_provider || null);
            }
        } catch (error) {
            console.error('Failed to fetch system settings', error);
        }
    };

    // Auto-select first active provider if none is saved
    useEffect(() => {
        if (providers.length === 0) return;
        const dataProviders = providers.filter(p => p.supported_services.includes('data') && p.active);
        const airtimeProviders = providers.filter(p => p.supported_services.includes('airtime') && p.active);
        if (!dataProvider && dataProviders.length > 0) setDataProvider(dataProviders[0].code);
        if (!airtimeProvider && airtimeProviders.length > 0) setAirtimeProvider(airtimeProviders[0].code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providers]);

    const fetchProviders = async () => {
        setProviderLoading(true);
        try {
            const response = await adminApi.getProviders();
            const providerList: Provider[] = response.data?.data?.providers || [];
            setProviders(providerList);
        } catch (error) {
            console.error('Failed to fetch providers', error);
        } finally {
            setProviderLoading(false);
        }
    };

    const handleSupportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSupportData({ ...supportData, [e.target.name]: e.target.value });
    };

    const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;

        if (name.startsWith('smtp_') || name === 'sender_name') {
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

    const handleProviderPreferenceSave = async () => {
        try {
            setProviderSaveLoading(true);
            const response = await adminApi.updateProviderPreferences({
                preferred_data_provider: dataProvider,
                preferred_airtime_provider: airtimeProvider,
                preferred_both_provider: bothProvider,
            });
            if (response.data.success) {
                showToast('Provider preferences saved successfully', 'success');
                queryClient.invalidateQueries({ queryKey: ['system-settings'] });
            }
        } catch (error) {
            showToast('Failed to save provider preferences', 'error');
        } finally {
            setProviderSaveLoading(false);
        }
    };

    // Filter providers by service
    const dataProviders = providers.filter(p => p.supported_services.includes('data'));
    const airtimeProviders = providers.filter(p => p.supported_services.includes('airtime'));
    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
                            <p className="text-slate-500 mt-1">Manage application configuration, providers, and contacts.</p>
                        </div>
                    </div>

                    {/* ─── PROVIDER SELECTION CARD ─── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-100 p-6 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-slate-900">Bill Provider Selection</h2>
                                <p className="text-xs text-slate-500">Choose which provider processes Data and Airtime purchases. Leave on Auto to use priority order.</p>
                            </div>
                            <button
                                type="button"
                                onClick={fetchProviders}
                                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 transition"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${providerLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            {providerLoading ? (
                                <div className="flex items-center justify-center py-12 flex-col gap-3">
                                    <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-400">Loading providers...</p>
                                </div>
                            ) : providers.length === 0 ? (
                                <div className="flex flex-col items-center py-12 gap-3 text-center">
                                    <AlertCircle className="w-10 h-10 text-slate-300" />
                                    <p className="font-semibold text-slate-500">No providers found</p>
                                    <p className="text-xs text-slate-400">Add providers in the Bill Providers section first.</p>
                                </div>
                            ) : (
                                <>
                    {/* ── DATA PROVIDER ── */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Database className="w-4 h-4 text-violet-500" />
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Data Provider</h3>
                                            <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 ml-auto">
                                                {dataProvider ? providers.find(p => p.code === dataProvider)?.name || dataProvider : '—'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-4">Choose which provider handles <strong>data purchases</strong>. Only the selected provider will be used.</p>

                                        <div className="space-y-3">
                                            {dataProviders.map(p => {
                                                const isSelected = dataProvider === p.code;
                                                const isDisabledBySelection = dataProvider !== null && dataProvider !== p.code;
                                                const colorMap: Record<string, { bg: string; border: string; text: string; badgeBg: string }> = {
                                                    smeplug:   { bg: 'bg-blue-50',    border: 'border-blue-400',    text: 'text-blue-700',    badgeBg: 'bg-blue-100 text-blue-700' },
                                                    topupmate: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700', badgeBg: 'bg-emerald-100 text-emerald-700' },
                                                    vtpass:    { bg: 'bg-orange-50',  border: 'border-orange-400',  text: 'text-orange-700',  badgeBg: 'bg-orange-100 text-orange-700' },
                                                };
                                                const colors = colorMap[p.code] || { bg: 'bg-slate-50', border: 'border-slate-400', text: 'text-slate-700', badgeBg: 'bg-slate-100 text-slate-700' };
                                                return (
                                                    <label
                                                        key={p._id}
                                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                                                            !p.active
                                                                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                                                                : isSelected
                                                                    ? `cursor-pointer ${colors.bg} ${colors.border} ring-2 ring-offset-1 ${colors.border.replace('border', 'ring')}`
                                                                    : isDisabledBySelection
                                                                        ? 'cursor-pointer bg-slate-50 border-slate-200 opacity-60'
                                                                        : 'cursor-pointer bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="data_provider"
                                                            disabled={!p.active}
                                                            checked={isSelected}
                                                            onChange={() => p.active && setDataProvider(p.code)}
                                                            className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                                                        />
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${colors.badgeBg}`}>
                                                                {p.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                                    <span className="text-[10px] font-mono text-slate-400 uppercase">{p.code}</span>
                                                                    {!p.active && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-500">Inactive</span>}
                                                                    {isDisabledBySelection && p.active && <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">Temp. Disabled</span>}
                                                                    {isSelected && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">✓ Priority</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isSelected && <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${colors.text}`} />}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100" />

                                    {/* ── AIRTIME PROVIDER ── */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Smartphone className="w-4 h-4 text-indigo-500" />
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Airtime Provider</h3>
                                            <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 ml-auto">
                                                {airtimeProvider ? providers.find(p => p.code === airtimeProvider)?.name || airtimeProvider : '—'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-4">Choose which provider handles <strong>airtime top-ups</strong>. Only the selected provider will be used.</p>

                                        <div className="space-y-3">
                                            {airtimeProviders.map(p => {
                                                const isSelected = airtimeProvider === p.code;
                                                const isDisabledBySelection = airtimeProvider !== null && airtimeProvider !== p.code;
                                                const colorMap: Record<string, { bg: string; border: string; text: string; badgeBg: string }> = {
                                                    smeplug:   { bg: 'bg-blue-50',    border: 'border-blue-400',    text: 'text-blue-700',    badgeBg: 'bg-blue-100 text-blue-700' },
                                                    topupmate: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700', badgeBg: 'bg-emerald-100 text-emerald-700' },
                                                    vtpass:    { bg: 'bg-orange-50',  border: 'border-orange-400',  text: 'text-orange-700',  badgeBg: 'bg-orange-100 text-orange-700' },
                                                };
                                                const colors = colorMap[p.code] || { bg: 'bg-slate-50', border: 'border-slate-400', text: 'text-slate-700', badgeBg: 'bg-slate-100 text-slate-700' };
                                                return (
                                                    <label
                                                        key={p._id}
                                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                                                            !p.active
                                                                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                                                                : isSelected
                                                                    ? `cursor-pointer ${colors.bg} ${colors.border} ring-2 ring-offset-1 ${colors.border.replace('border', 'ring')}`
                                                                    : isDisabledBySelection
                                                                        ? 'cursor-pointer bg-slate-50 border-slate-200 opacity-60'
                                                                        : 'cursor-pointer bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="airtime_provider"
                                                            disabled={!p.active}
                                                            checked={isSelected}
                                                            onChange={() => p.active && setAirtimeProvider(p.code)}
                                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${colors.badgeBg}`}>
                                                                {p.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                                    <span className="text-[10px] font-mono text-slate-400 uppercase">{p.code}</span>
                                                                    {!p.active && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-500">Inactive</span>}
                                                                    {isDisabledBySelection && p.active && <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">Temp. Disabled</span>}
                                                                    {isSelected && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">✓ Priority</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isSelected && <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${colors.text}`} />}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Current selection summary + Save */}
                                    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="flex-1 space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Database className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                                <span className="text-slate-500">Data:</span>
                                                <span className="font-semibold text-slate-800">
                                                    {dataProvider ? providers.find(p => p.code === dataProvider)?.name || dataProvider : <span className="text-amber-600 font-medium">Not selected</span>}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                                <span className="text-slate-500">Airtime:</span>
                                                <span className="font-semibold text-slate-800">
                                                    {airtimeProvider ? providers.find(p => p.code === airtimeProvider)?.name || airtimeProvider : <span className="text-amber-600 font-medium">Not selected</span>}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleProviderPreferenceSave}
                                            disabled={providerSaveLoading}
                                            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {providerSaveLoading ? (
                                                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                                            ) : (
                                                <><Save className="w-4 h-4" /> Save Preferences</>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* System Configuration Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-100 p-6 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
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
                                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${systemSettings.payment_gateway === 'vtstack' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <input
                                            type="radio"
                                            name="payment_gateway"
                                            value="vtstack"
                                            checked={systemSettings.payment_gateway === 'vtstack'}
                                            onChange={handleSystemChange}
                                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
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
                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
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
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center h-full pt-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="smtp_secure"
                                                checked={systemSettings.email_config.smtp_secure}
                                                onChange={handleSystemChange}
                                                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
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
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
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
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
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
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
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
