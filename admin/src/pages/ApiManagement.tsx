import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Book, Check, Copy, Eye, EyeOff, Key, RefreshCw, Search, Shield, ShieldOff, Tag, Terminal, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { generateApiKey, getPricingPlans, getUsers, revokeApiKey, updatePricingPlan } from '../api/adminApi';
import Layout from '../components/Layout';
import { getApiUrl } from '../config/api.config';
import { useToast } from '../hooks/ToastContext';

const ApiManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'keys' | 'docs' | 'test' | 'pricing'>('keys');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [testApiKey, setTestApiKey] = useState('');
    const [testPhone, setTestPhone] = useState('');
    const [testAmount, setTestAmount] = useState('');
    const [testNetwork, setTestNetwork] = useState('1');
    const [testPlan, setTestPlan] = useState('');
    const [testResult, setTestResult] = useState<any>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
    const [filterType, setFilterType] = useState<'ALL' | 'DATA' | 'AIRTIME'>('ALL');

    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    const { data: usersData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users-api', searchTerm],
        queryFn: () => getUsers({ page: 1, limit: 20, search: searchTerm }).then((res: any) => res.data),
    });

    const { data: plansData, isLoading: isLoadingPlans } = useQuery({
        queryKey: ['pricing-plans'],
        queryFn: () => getPricingPlans({ limit: 1000 }).then((res: any) => res.data),
        enabled: activeTab === 'pricing' || activeTab === 'test',
    });

    const generateMutation = useMutation({
        mutationFn: (userId: string) => generateApiKey(userId).then((res: any) => res.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users-api'] });
            alert(`API Key Generated: ${data.apiKey}\n\nPlease copy and save it securely. It will not be shown again.`);
        },
    });

    const revokeMutation = useMutation({
        mutationFn: (userId: string) => revokeApiKey(userId).then((res: any) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-api'] });
        },
    });

    const updatePriceMutation = useMutation({
        mutationFn: ({ id, api_discount }: { id: string; api_discount: number }) => updatePricingPlan(id, { api_discount }).then((res: any) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
            showSuccess('API discount updated successfully');
        },
        onError: () => {
            showError('Failed to update API discount');
        }
    });

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const toggleReveal = (userId: string) => {
        setRevealedKeys(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    const handleTestApi = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsTesting(true);
        setTestResult(null);

        if (!testPlan) {
            setTestResult({ success: false, message: 'Please select a data plan' });
            setIsTesting(false);
            return;
        }

        // Map network number to network name
        const networkMap: Record<string, string> = {
            '1': 'mtn',
            '2': 'airtel',
            '3': 'glo',
            '4': '9mobile'
        };

        try {
            const response = await fetch(`${getApiUrl()}/billpayment/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': testApiKey,
                },
                body: JSON.stringify({
                    phone: testPhone,
                    network: networkMap[testNetwork] || 'mtn',
                    plan: testPlan,
                    ported_number: true
                }),
            });
            const data = await response.json();
            setTestResult(data);
        } catch (error: any) {
            setTestResult({ success: false, message: error.message });
        } finally {
            setIsTesting(false);
        }
    };

    const users = usersData?.data || [];
    const plans = plansData?.data?.plans || [];

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">API Management</h1>
                        <p className="text-sm sm:text-base text-slate-500 mt-1">Manage developer API keys, pricing, and view documentation</p>
                    </div>

                    {/* Tabs - Scrolls horizontally on mobile */}
                    <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-4 sm:pb-8 scrollbar-hide">
                        <div className="flex bg-slate-200/50 p-1.5 rounded-xl w-max sm:w-fit border border-slate-200">
                            {[
                                { id: 'keys', label: 'API Keys', icon: Key },
                                { id: 'pricing', label: 'Pricing', icon: Tag },
                                { id: 'docs', label: 'Documentation', icon: Book },
                                { id: 'test', label: 'Test API', icon: Terminal },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {activeTab === 'keys' && (
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">User API Keys</h2>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                </div>

                                {isLoadingUsers ? (
                                    <div className="py-12 text-center">
                                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                                        <p className="text-slate-500">Loading users...</p>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        No users found
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Mobile Card View */}
                                        <div className="grid grid-cols-1 gap-4 md:hidden">
                                            {users.map((user: any) => (
                                                <div key={user._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{user.first_name} {user.last_name}</p>
                                                            <p className="text-xs text-slate-500">{user.email}</p>
                                                        </div>
                                                        {user.api_key_enabled ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-slate-200 text-slate-600">
                                                                Disabled
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="pt-2 border-t border-slate-200">
                                                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">API Key</p>
                                                        {user.api_key ? (
                                                            <div className="flex items-center gap-2">
                                                                <code className="bg-white border border-slate-200 px-2 py-1.5 rounded text-xs text-slate-700 font-mono flex-1 overflow-hidden text-ellipsis">
                                                                    {revealedKeys[user._id]
                                                                        ? user.api_key
                                                                        : `${user.api_key.substring(0, 8)}...${user.api_key.slice(-4)}`}
                                                                </code>
                                                                <button onClick={() => toggleReveal(user._id)} className="p-1.5 hover:bg-white rounded text-slate-500 border border-transparent hover:border-slate-200">
                                                                    {revealedKeys[user._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                                <button onClick={() => handleCopy(user.api_key)} className="p-1.5 hover:bg-white rounded text-slate-500 border border-transparent hover:border-slate-200">
                                                                    {copiedKey === user.api_key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No API key generated</span>
                                                        )}
                                                    </div>

                                                    <div className="pt-2">
                                                        {user.api_key ? (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Revoke this API Key?')) revokeMutation.mutate(user._id);
                                                                }}
                                                                className="w-full py-2 flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Revoke Key
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => generateMutation.mutate(user._id)}
                                                                className="w-full py-2 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition"
                                                            >
                                                                <Key className="w-4 h-4" /> Generate Key
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
                                            <table className="w-full">
                                                <thead className="bg-slate-50/80">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">API Key</th>
                                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 bg-white">
                                                    {users.map((user: any) => (
                                                        <tr key={user._id} className="hover:bg-slate-50/50 transition">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-semibold text-slate-900">{user.first_name} {user.last_name}</span>
                                                                    <span className="text-xs text-slate-500">{user.email}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {user.api_key_enabled ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <Shield className="w-3 h-3" /> Enabled
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                                        <ShieldOff className="w-3 h-3" /> Disabled
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {user.api_key ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 font-mono">
                                                                            {revealedKeys[user._id] ? user.api_key : `${user.api_key.substring(0, 8)}****************${user.api_key.slice(-4)}`}
                                                                        </code>
                                                                        <button onClick={() => toggleReveal(user._id)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                                                                            {revealedKeys[user._id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                                        </button>
                                                                        <button onClick={() => handleCopy(user.api_key)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                                                                            {copiedKey === user.api_key ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400 italic">No key</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                                {user.api_key ? (
                                                                    <button onClick={() => { if (confirm('Revoke Key?')) revokeMutation.mutate(user._id); }} className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center gap-1">
                                                                        <Trash2 className="w-3.5 h-3.5" /> Revoke
                                                                    </button>
                                                                ) : (
                                                                    <button onClick={() => generateMutation.mutate(user._id)} className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
                                                                        <Key className="w-3.5 h-3.5" /> Generate
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'pricing' && (
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Developer Pricing</h2>
                                        <p className="text-sm text-slate-500">Set custom discounts for API users</p>
                                    </div>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value as any)}
                                        className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="ALL">All Services</option>
                                        <option value="DATA">Data Bundles</option>
                                        <option value="AIRTIME">Airtime</option>
                                    </select>
                                </div>

                                {isLoadingPlans ? (
                                    <div className="py-12 text-center">
                                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                                        <p className="text-slate-500">Loading plans...</p>
                                    </div>
                                ) : plans.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">No plans found</div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Mobile Card View */}
                                        <div className="grid grid-cols-1 gap-4 md:hidden">
                                            {plans.filter((plan: any) => filterType === 'ALL' || plan.type === filterType).map((plan: any) => {
                                                const apiDiscount = editingPrices[plan._id] ?? plan.api_discount ?? 0;
                                                const apiPrice = plan.price * (1 - apiDiscount / 100);
                                                return (
                                                    <div key={plan._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="font-semibold text-slate-900 text-sm">{plan.name}</h3>
                                                                <p className="text-xs text-slate-500">{plan.providerName || plan.operator_id?.name || 'N/A'}</p>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">{plan.type}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 my-2">
                                                            <div className="text-left">
                                                                <p className="text-xs text-slate-400 mb-0.5">Regular Price</p>
                                                                <p className="text-sm font-medium text-slate-900">₦{plan.price}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-slate-400 mb-0.5">API Price</p>
                                                                <p className="text-sm font-bold text-blue-600">₦{apiPrice.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-end gap-3 pt-2">
                                                            <div className="flex-1">
                                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Discount %</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        value={apiDiscount}
                                                                        onChange={(e) => setEditingPrices(prev => ({ ...prev, [plan._id]: parseFloat(e.target.value) }))}
                                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                                                        min="0" max="100" step="0.1"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => updatePriceMutation.mutate({ id: plan._id, api_discount: apiDiscount })}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 active:scale-95 transition"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Desktop Table */}
                                        <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
                                            <table className="w-full">
                                                <thead className="bg-slate-50/80">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Regular Price</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Discount (%)</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">API Price</th>
                                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 bg-white">
                                                    {plans
                                                        .filter((plan: any) => filterType === 'ALL' || plan.type === filterType)
                                                        .map((plan: any) => {
                                                            const apiDiscount = editingPrices[plan._id] ?? plan.api_discount ?? 0;
                                                            const apiPrice = plan.price * (1 - apiDiscount / 100);
                                                            return (
                                                                <tr key={plan._id} className="hover:bg-slate-50/50">
                                                                    <td className="px-6 py-4">
                                                                        <p className="font-medium text-slate-900">{plan.name}</p>
                                                                        <p className="text-xs text-slate-500 uppercase">{plan.type}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-slate-600">{plan.providerName || plan.operator_id?.name || 'N/A'}</td>
                                                                    <td className="px-6 py-4 text-sm font-medium">₦{plan.price}</td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-1.5 w-24">
                                                                            <input
                                                                                type="number"
                                                                                value={apiDiscount}
                                                                                onChange={(e) => setEditingPrices(prev => ({ ...prev, [plan._id]: parseFloat(e.target.value) }))}
                                                                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                                                min="0" max="100" step="0.1"
                                                                            />
                                                                            <span className="text-slate-400 text-xs">%</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm font-bold text-blue-600">₦{apiPrice.toFixed(2)}</td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <button
                                                                            onClick={() => updatePriceMutation.mutate({ id: plan._id, api_discount: apiDiscount })}
                                                                            disabled={updatePriceMutation.isPending}
                                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'docs' && (
                            <div className="p-6 md:p-8 prose prose-slate max-w-none prose-sm sm:prose-base">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Developer API Documentation</h2>
                                {/* Documentation sections preserved but wrapper refined relative to padding */}
                                <section className="mb-8">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Authentication</h3>
                                    <p className="text-slate-600 mb-4">
                                        All API requests must include your API key in the <code>x-api-key</code> header.
                                    </p>
                                    <div className="bg-slate-900 rounded-lg p-4 text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto">
                                        x-api-key: sk_live_your_api_key_here
                                    </div>
                                </section>
                                <section className="mb-8">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Base URL</h3>
                                    <div className="bg-slate-900 rounded-lg p-4 text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto">
                                        {getApiUrl()}
                                    </div>
                                </section>
                                {/* Compact documentation blocks for mobile readability */}
                                <div className="space-y-8">
                                    {/* Wallet Balance */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                                            <span className="text-xs font-bold text-blue-700">GET</span>
                                            <span className="text-xs font-mono text-slate-600 break-all ml-2">/billpayment/balance</span>
                                        </div>
                                        <div className="p-4 overflow-x-auto">
                                            <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg">{`{
  "success": true,
  "data": { "balance": 5000.50, "currency": "NGN" }
}`}</pre>
                                        </div>
                                    </div>
                                    {/* Data Plans */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                                            <span className="text-xs font-bold text-blue-700">GET</span>
                                            <span className="text-xs font-mono text-slate-600 break-all ml-2">/billpayment/data-plans</span>
                                        </div>
                                        <div className="p-4 overflow-x-auto">
                                            <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg">{`[
  { "plan_id": "...", "network": "1", "name": "MTN 1GB", "price": 250 }
]`}</pre>
                                        </div>
                                    </div>
                                    {/* Buy Data */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                                            <span className="text-xs font-bold text-green-700">POST</span>
                                            <span className="text-xs font-mono text-slate-600 break-all ml-2">/billpayment/data</span>
                                        </div>
                                        <div className="p-4 overflow-x-auto">
                                            <p className="text-xs font-semibold mb-2 text-slate-500">Body</p>
                                            <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg mb-4">{`{ "phone": "080...", "network": "mtn", "plan": "...", "amount": 250 }`}</pre>
                                            <p className="text-xs font-semibold mb-2 text-slate-500">Response</p>
                                            <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg">{`{ "success": true, "message": "Data purchase successful" }`}</pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'test' && (
                            <div className="p-4 sm:p-8">
                                <div className="max-w-2xl">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Test API Integration</h2>
                                    <p className="text-sm text-slate-600 mb-6">
                                        Use this form to test the endpoints securely. Returns real API responses.
                                    </p>

                                    <form onSubmit={handleTestApi} className="space-y-4 sm:space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">API Key</label>
                                            <input
                                                type="password"
                                                required
                                                value={testApiKey}
                                                onChange={(e) => setTestApiKey(e.target.value)}
                                                placeholder="sk_live_..."
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={testPhone}
                                                    onChange={(e) => setTestPhone(e.target.value)}
                                                    placeholder="08012345678"
                                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Network</label>
                                                <select
                                                    value={testNetwork}
                                                    onChange={(e) => {
                                                        setTestNetwork(e.target.value);
                                                        setTestAmount('');
                                                        setTestPlan('');
                                                    }}
                                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    <option value="1">MTN</option>
                                                    <option value="2">Airtel</option>
                                                    <option value="3">Glo</option>
                                                    <option value="4">9mobile</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Plan</label>
                                            <select
                                                value={testPlan}
                                                onChange={(e) => {
                                                    setTestPlan(e.target.value);
                                                    const plan = plans.find((p: any) => p._id === e.target.value);
                                                    if (plan) {
                                                        const apiPrice = plan.price * (1 - (plan.api_discount || 0) / 100);
                                                        setTestAmount(apiPrice.toFixed(2));
                                                    }
                                                }}
                                                required
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="">Select a plan</option>
                                                {plans
                                                    .filter((p: any) => p.providerId === parseInt(testNetwork) && p.type === 'DATA')
                                                    .map((p: any) => (
                                                        <option key={p._id} value={p._id}>
                                                            {p.name} - ₦{(p.price * (1 - (p.api_discount || 0) / 100)).toFixed(2)}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₦)</label>
                                            <input
                                                type="number"
                                                required
                                                value={testAmount}
                                                readOnly
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-slate-100 focus:outline-none cursor-not-allowed text-sm"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isTesting}
                                            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isTesting ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                'Execute API Call'
                                            )}
                                        </button>
                                    </form>

                                    {testResult && (
                                        <div className={`mt-8 p-4 sm:p-6 rounded-2xl border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <h3 className={`text-sm font-bold mb-3 ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                                API RESPONSE
                                            </h3>
                                            <pre className="text-xs font-mono overflow-auto max-h-64 bg-white/50 p-3 rounded-lg border border-black/5">
                                                {JSON.stringify(testResult, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ApiManagement;
