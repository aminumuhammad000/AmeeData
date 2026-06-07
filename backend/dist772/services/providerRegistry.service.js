import ProviderConfig from '../models/provider.model.js';
import { SystemSetting } from '../models/system_setting.model.js';
import topupmateService from './topupmate.service.js';
import vtpassService from './vtpass.service.js';
import smeplugService from './smeplug.service.js';
class ProviderRegistryService {
    clients = {
        topupmate: topupmateService,
        vtpass: vtpassService,
        smeplug: smeplugService,
    };
    register(code, client) {
        this.clients[code] = client;
    }
    getClient(code) {
        return this.clients[code];
    }
    async getPreferredProviderFor(service) {
        // 1. Check if admin has pinned a specific provider for this service type
        try {
            const systemSettings = await SystemSetting.findOne({ type: 'global_config' });
            const config = systemSettings?.config;
            let pinnedCode = null;
            // Direct check for service-specific pinning (e.g., preferred_data_provider)
            if (service === 'data' && config?.preferred_data_provider) {
                pinnedCode = config.preferred_data_provider;
            }
            else if (service === 'airtime' && config?.preferred_airtime_provider) {
                pinnedCode = config.preferred_airtime_provider;
            }
            else if (service === 'cable' && config?.preferred_cable_provider) {
                pinnedCode = config.preferred_cable_provider;
            }
            else if (service === 'electricity' && config?.preferred_electricity_provider) {
                pinnedCode = config.preferred_electricity_provider;
            }
            else if (service === 'exampin' && config?.preferred_exampin_provider) {
                pinnedCode = config.preferred_exampin_provider;
            }
            // 'both' fallback: if no individual setting for airtime/data, check preferred_both_provider
            if (!pinnedCode && config?.preferred_both_provider && (service === 'data' || service === 'airtime')) {
                pinnedCode = config.preferred_both_provider;
            }
            if (pinnedCode) {
                // Verify that the pinned provider is active AND supports this specific service
                const pinnedProvider = await ProviderConfig.findOne({
                    code: pinnedCode,
                    supported_services: { $in: [service] }
                });
                if (pinnedProvider) {
                    // If the pinned provider is inactive, we respect the user's choice and DON'T fallback.
                    // This allows the admin to know their selected provider is down.
                    if (!pinnedProvider.active) {
                        console.warn(`⚠️ Pinned provider '${pinnedCode}' for service '${service}' is currently INACTIVE.`);
                        return null;
                    }
                    const client = this.getClient(pinnedCode);
                    if (client)
                        return { code: pinnedCode, client };
                }
                else {
                    console.warn(`⚠️ Pinned provider '${pinnedCode}' for service '${service}' was not found in database.`);
                    return null; // Don't fallback if an explicit choice was made but is invalid
                }
            }
        }
        catch (e) {
            console.error('Error in getPreferredProviderFor:', e);
        }
        // 2. Fall back to priority-sorted active provider query ONLY if no pin is set
        const providers = await ProviderConfig.find({ active: true, supported_services: { $in: [service] } })
            .sort({ priority: 1, name: 1 });
        for (const p of providers) {
            const client = this.getClient(p.code);
            if (client)
                return { code: p.code, client };
        }
        // 3. Last resort fallback
        const fallback = this.getClient('smeplug') || this.getClient('topupmate');
        if (fallback === smeplugService)
            return { code: 'smeplug', client: fallback };
        if (fallback === topupmateService)
            return { code: 'topupmate', client: fallback };
        return null;
    }
}
export const providerRegistry = new ProviderRegistryService();
export default providerRegistry;
