import ProviderConfig from '../models/provider.model.js';
import { SystemSetting } from '../models/system_setting.model.js';
import topupmateService from './topupmate.service.js';
import vtpassService from './vtpass.service.js';
import smeplugService from './smeplug.service.js';

interface ProviderClient {
  getNetworks?: () => Promise<any>;
  getDataPlans?: () => Promise<any>;
  getCableProviders?: () => Promise<any>;
  getCableTVPlans?: () => Promise<any>;
  getElectricityProviders?: () => Promise<any>;
  getExamPinProviders?: () => Promise<any>;
  purchaseAirtime?: (data: any) => Promise<any>;
  purchaseData?: (data: any) => Promise<any>;
  verifyCableAccount?: (data: any) => Promise<any>;
  purchaseCableTV?: (data: any) => Promise<any>;
  verifyElectricityMeter?: (data: any) => Promise<any>;
  purchaseElectricity?: (data: any) => Promise<any>;
  purchaseExamPin?: (data: any) => Promise<any>;
  getTransactionStatus?: (reference: string) => Promise<any>;
  getWalletBalance?: () => Promise<any>;
}

class ProviderRegistryService {
  private clients: Record<string, ProviderClient> = {
    topupmate: topupmateService,
    vtpass: vtpassService,
    smeplug: smeplugService,
  };

  register(code: string, client: ProviderClient) {
    this.clients[code] = client;
  }

  getClient(code: string): ProviderClient | undefined {
    return this.clients[code];
  }

  async getPreferredProviderFor(service: string): Promise<{ code: string; client: ProviderClient } | null> {
    // 1. Check if admin has pinned a specific provider for this service type
    try {
      const systemSettings = await SystemSetting.findOne({ type: 'global_config' });
      const config = systemSettings?.config as any;
      let pinnedCode: string | null = null;

      if (service === 'data' && config?.preferred_data_provider) {
        pinnedCode = config.preferred_data_provider;
      } else if (service === 'airtime' && config?.preferred_airtime_provider) {
        pinnedCode = config.preferred_airtime_provider;
      }
      // 'both' fallback: if no individual setting, check preferred_both_provider
      if (!pinnedCode && config?.preferred_both_provider && (service === 'data' || service === 'airtime')) {
        pinnedCode = config.preferred_both_provider;
      }

      if (pinnedCode) {
        const pinnedProvider = await ProviderConfig.findOne({ code: pinnedCode, active: true });
        if (pinnedProvider) {
          const client = this.getClient(pinnedCode);
          if (client) return { code: pinnedCode, client };
        }
      }
    } catch (e) {
      // If system settings lookup fails, fall through to priority-based selection
    }

    // 2. Fall back to priority-sorted active provider query
    const providers = await ProviderConfig.find({ active: true, supported_services: { $in: [service] } })
      .sort({ priority: 1, name: 1 });

    for (const p of providers) {
      const client = this.getClient(p.code);
      if (client) return { code: p.code, client };
    }

    // 3. Last resort fallback
    const fallback = this.getClient('smeplug') || this.getClient('topupmate');
    if (fallback === smeplugService) return { code: 'smeplug', client: fallback };
    if (fallback === topupmateService) return { code: 'topupmate', client: fallback };
    return null;
  }
}

export const providerRegistry = new ProviderRegistryService();
export default providerRegistry;
