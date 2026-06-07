import axios from 'axios';
import ProviderConfig from '../models/provider.model.js';
class VTpassService {
    api = null;
    async ensureClient() {
        if (this.api)
            return this.api;
        const cfg = await ProviderConfig.findOne({ code: 'vtpass' });
        const baseURL = cfg?.base_url || 'https://api-service.vtpass.com/api';
        const apiKey = cfg?.api_key || cfg?.metadata?.env?.VTPASS_API_KEY || '';
        const secret = cfg?.secret_key || cfg?.metadata?.env?.VTPASS_SECRET || '';
        this.api = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
                'secret-key': secret,
            },
            timeout: 30000,
        });
        return this.api;
    }
    async getNetworks() {
        const api = await this.ensureClient();
        const res = await api.get('/service-categories?identifier=airtime');
        return res.data;
    }
    async getDataPlans() {
        const api = await this.ensureClient();
        const res = await api.get('/service-categories?identifier=data');
        return res.data;
    }
    async getCableProviders() {
        const api = await this.ensureClient();
        const res = await api.get('/service-categories?identifier=cabletv');
        return res.data;
    }
    async getElectricityProviders() {
        const api = await this.ensureClient();
        const res = await api.get('/service-categories?identifier=electricity');
        return res.data;
    }
    async getExamPinProviders() {
        const api = await this.ensureClient();
        const res = await api.get('/service-categories?identifier=education');
        return res.data;
    }
    async purchaseAirtime(data) {
        const api = await this.ensureClient();
        const res = await api.post('/pay', { serviceID: 'airtime', ...data });
        return res.data;
    }
    async purchaseData(data) {
        const api = await this.ensureClient();
        const res = await api.post('/pay', { serviceID: 'data', ...data });
        return res.data;
    }
    async verifyCableAccount(data) {
        const api = await this.ensureClient();
        const res = await api.post('/merchant-verify', data);
        return res.data;
    }
    async purchaseCableTV(data) {
        const api = await this.ensureClient();
        const res = await api.post('/pay', { serviceID: 'tv', ...data });
        return res.data;
    }
    async verifyElectricityMeter(data) {
        const api = await this.ensureClient();
        const res = await api.post('/merchant-verify', data);
        return res.data;
    }
    async purchaseElectricity(data) {
        const api = await this.ensureClient();
        const res = await api.post('/pay', { serviceID: 'electricity', ...data });
        return res.data;
    }
    async purchaseExamPin(data) {
        const api = await this.ensureClient();
        const res = await api.post('/pay', { serviceID: 'education', ...data });
        return res.data;
    }
    async getTransactionStatus(reference) {
        const api = await this.ensureClient();
        const res = await api.get(`/requery?request_id=${encodeURIComponent(reference)}`);
        return res.data;
    }
}
export default new VTpassService();
