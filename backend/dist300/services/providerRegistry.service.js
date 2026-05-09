import ProviderConfig from '../models/provider.model.js';
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
        const providers = await ProviderConfig.find({ active: true, supported_services: { $in: [service] } })
            .sort({ priority: 1, name: 1 });
        for (const p of providers) {
            const client = this.getClient(p.code);
            if (client)
                return { code: p.code, client };
        }
        const fallback = this.getClient('topupmate');
        return fallback ? { code: 'topupmate', client: fallback } : null;
    }
}
export const providerRegistry = new ProviderRegistryService();
export default providerRegistry;
