import ProviderConfig from '../models/provider.model.js';
import providerRegistry from '../services/providerRegistry.service.js';
import logger from '../utils/logger.js';
import { ApiResponse } from '../utils/response.js';
export class AdminProviderController {
    static async list(req, res) {
        try {
            const { active } = req.query;
            const filter = {};
            if (active !== undefined)
                filter.active = String(active) === 'true';
            const providers = await ProviderConfig.find(filter).sort({ priority: 1, name: 1 });
            // Omit env secrets in list response
            const sanitized = providers.map((p) => {
                const obj = p.toObject();
                if (obj.metadata && obj.metadata.env) {
                    obj.metadata = { ...obj.metadata };
                    delete obj.metadata.env;
                }
                return obj;
            });
            return ApiResponse.success(res, 'Providers retrieved', { providers: sanitized, total: providers.length });
        }
        catch (error) {
            logger.error('Error listing providers:', error);
            return ApiResponse.error(res, 'Failed to list providers', 500);
        }
    }
    static async getById(req, res) {
        try {
            const provider = await ProviderConfig.findById(req.params.id);
            if (!provider)
                return ApiResponse.error(res, 'Provider not found', 404);
            return ApiResponse.success(res, 'Provider retrieved', { provider });
        }
        catch (error) {
            logger.error('Error getting provider:', error);
            return ApiResponse.error(res, 'Failed to get provider', 500);
        }
    }
    static async create(req, res) {
        try {
            const { name, code, base_url, api_key, secret_key, username, password, active, priority, supported_services, metadata } = req.body;
            if (!name || !code)
                return ApiResponse.error(res, 'name and code are required', 400);
            const exists = await ProviderConfig.findOne({ code });
            if (exists)
                return ApiResponse.error(res, 'Provider code already exists', 400);
            const created = await ProviderConfig.create({
                name,
                code: String(code).toLowerCase(),
                base_url,
                api_key,
                secret_key,
                username,
                password,
                active: active !== false,
                priority: priority ?? 1,
                supported_services: Array.isArray(supported_services) ? supported_services : [],
                metadata,
            });
            logger.info(`Provider created: ${created.code}`);
            return ApiResponse.success(res, 'Provider created', { provider: created }, 201);
        }
        catch (error) {
            logger.error('Error creating provider:', error);
            return ApiResponse.error(res, 'Failed to create provider', 500);
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const provider = await ProviderConfig.findById(id);
            if (!provider)
                return ApiResponse.error(res, 'Provider not found', 404);
            const { name, code, base_url, api_key, secret_key, username, password, active, priority, supported_services, metadata } = req.body;
            if (name !== undefined)
                provider.name = name;
            if (code !== undefined)
                provider.code = String(code).toLowerCase();
            if (base_url !== undefined)
                provider.base_url = base_url;
            if (api_key !== undefined)
                provider.api_key = api_key;
            if (secret_key !== undefined)
                provider.secret_key = secret_key;
            if (username !== undefined)
                provider.username = username;
            if (password !== undefined)
                provider.password = password;
            if (active !== undefined)
                provider.active = Boolean(active);
            if (priority !== undefined)
                provider.priority = Number(priority);
            if (supported_services !== undefined)
                provider.supported_services = Array.isArray(supported_services) ? supported_services : [];
            if (metadata !== undefined)
                provider.metadata = metadata;
            await provider.save();
            logger.info(`Provider updated: ${id}`);
            return ApiResponse.success(res, 'Provider updated', { provider });
        }
        catch (error) {
            logger.error('Error updating provider:', error);
            return ApiResponse.error(res, 'Failed to update provider', 500);
        }
    }
    static async remove(req, res) {
        try {
            const { id } = req.params;
            const removed = await ProviderConfig.findByIdAndDelete(id);
            if (!removed)
                return ApiResponse.error(res, 'Provider not found', 404);
            logger.info(`Provider deleted: ${id}`);
            return ApiResponse.success(res, 'Provider deleted', { provider: removed });
        }
        catch (error) {
            logger.error('Error deleting provider:', error);
            return ApiResponse.error(res, 'Failed to delete provider', 500);
        }
    }
    // Get only env backup
    static async getEnv(req, res) {
        try {
            const provider = await ProviderConfig.findById(req.params.id);
            if (!provider)
                return ApiResponse.error(res, 'Provider not found', 404);
            const env = provider.metadata?.env || {};
            return ApiResponse.success(res, 'Provider env retrieved', { env });
        }
        catch (error) {
            logger.error('Error getting provider env:', error);
            return ApiResponse.error(res, 'Failed to get provider env', 500);
        }
    }
    // Update only env backup
    static async updateEnv(req, res) {
        try {
            const { id } = req.params;
            const { env } = req.body;
            const provider = await ProviderConfig.findById(id);
            if (!provider)
                return ApiResponse.error(res, 'Provider not found', 404);
            const meta = provider.metadata || {};
            meta.env = env || {};
            provider.metadata = meta;
            await provider.save();
            return ApiResponse.success(res, 'Provider env updated', { env: meta.env });
        }
        catch (error) {
            logger.error('Error updating provider env:', error);
            return ApiResponse.error(res, 'Failed to update provider env', 500);
        }
    }
    // Test provider connection
    static async testConnection(req, res) {
        try {
            const { code } = req.params;
            const provider = await ProviderConfig.findOne({ code: code.toLowerCase() });
            if (!provider)
                return ApiResponse.error(res, 'Provider not found', 404);
            const client = providerRegistry.getClient(code.toLowerCase());
            if (!client)
                return ApiResponse.error(res, 'Provider client not available', 404);
            const results = { code, name: provider.name };
            // Test wallet balance if available
            if (client.getWalletBalance) {
                try {
                    const balance = await client.getWalletBalance();
                    results.balance = balance;
                    results.balanceStatus = 'success';
                }
                catch (error) {
                    results.balanceStatus = 'failed';
                    results.balanceError = error.response?.data?.message || error.message;
                }
            }
            // Test get networks if available
            if (client.getNetworks) {
                try {
                    const networks = await client.getNetworks();
                    results.networks = networks;
                    results.networksStatus = 'success';
                }
                catch (error) {
                    results.networksStatus = 'failed';
                    results.networksError = error.response?.data?.message || error.message;
                }
            }
            logger.info(`Provider connection test: ${code}`, results);
            return ApiResponse.success(res, 'Connection test completed', { test: results });
        }
        catch (error) {
            logger.error('Error testing provider connection:', error);
            return ApiResponse.error(res, error.message || 'Failed to test provider connection', 500);
        }
    }
    // Get provider data (networks, plans, balance)
    static async getProviderData(req, res) {
        try {
            const { code } = req.params;
            const { type } = req.query; // 'balance', 'networks', 'plans'
            const provider = await ProviderConfig.findOne({ code: code.toLowerCase() });
            if (!provider)
                return ApiResponse.error(res, 'Provider not found', 404);
            const client = providerRegistry.getClient(code.toLowerCase());
            if (!client)
                return ApiResponse.error(res, 'Provider client not available', 404);
            let data = null;
            switch (type) {
                case 'balance':
                    if (!client.getWalletBalance) {
                        return ApiResponse.error(res, 'Balance not supported by this provider', 400);
                    }
                    data = await client.getWalletBalance();
                    break;
                case 'networks':
                    if (!client.getNetworks) {
                        return ApiResponse.error(res, 'Networks not supported by this provider', 400);
                    }
                    data = await client.getNetworks();
                    break;
                case 'plans':
                    if (!client.getDataPlans) {
                        return ApiResponse.error(res, 'Data plans not supported by this provider', 400);
                    }
                    data = await client.getDataPlans();
                    break;
                default:
                    return ApiResponse.error(res, 'Invalid type. Use: balance, networks, or plans', 400);
            }
            logger.info(`Provider data retrieved: ${code} - ${type}`);
            return ApiResponse.success(res, `${type} retrieved`, { data });
        }
        catch (error) {
            logger.error(`Error getting provider data (${req.query.type}):`, error);
            return ApiResponse.error(res, error.response?.data?.message || error.message || 'Failed to get provider data', 500);
        }
    }
    // Test provider purchase (Airtime, Data, etc.)
    static async testPurchase(req, res) {
        try {
            const { code } = req.params;
            const { service, payload } = req.body; // service: 'airtime' | 'data', payload: { ... }
            const provider = await ProviderConfig.findOne({ code: code.toLowerCase() });
            if (!provider)
                return ApiResponse.error(res, 'Provider not found', 404);
            const client = providerRegistry.getClient(code.toLowerCase());
            if (!client)
                return ApiResponse.error(res, 'Provider client not available', 404);
            // We need to generate a reference for testing
            const ref = `TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const testPayload = { ...payload, ref };
            let result;
            if (service === 'airtime') {
                if (!client.purchaseAirtime)
                    return ApiResponse.error(res, 'Airtime purchase not supported by this provider', 400);
                result = await client.purchaseAirtime(testPayload);
            }
            else if (service === 'data') {
                if (!client.purchaseData)
                    return ApiResponse.error(res, 'Data purchase not supported by this provider', 400);
                result = await client.purchaseData(testPayload);
            }
            else {
                return ApiResponse.error(res, 'Invalid service type for testing', 400);
            }
            logger.info(`Provider test purchase: ${code} - ${service}`, result);
            return ApiResponse.success(res, 'Test purchase completed', { result });
        }
        catch (error) {
            logger.error('Error testing provider purchase:', error);
            return ApiResponse.error(res, error.response?.data?.message || error.message || 'Failed to test purchase', 500);
        }
    }
}
export default AdminProviderController;
