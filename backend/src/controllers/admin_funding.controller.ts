import { Request, Response } from 'express';
import { config } from '../config/bootstrap.js';
import FundingAccount from '../models/funding_account.model.js';
import ProviderConfig from '../models/provider.model.js';
import { providerRegistry } from '../services/providerRegistry.service.js';
import { ApiResponse } from '../utils/response.js';

export class AdminFundingController {
  static async getProviderBalances(req: Request, res: Response) {
    try {
      const providers = await ProviderConfig.find({}).sort({ priority: 1, name: 1 });
      const results: Array<{ code: string; name: string; balance: number | null; currency: string | null; status: 'ok' | 'unsupported' | 'error'; raw?: any }> = [];
      for (const p of providers) {
        let balance: number | null = null;
        let currency: string | null = null;
        let status: 'ok' | 'unsupported' | 'error' = 'unsupported';
        let raw: any = undefined;
        try {
          const client: any = providerRegistry.getClient(p.code);
          if (client && typeof client.getWalletBalance === 'function') {
            const resp = await client.getWalletBalance();
            if (resp && typeof resp === 'object') {
              // Try different possible balance field names from various providers
              // Direct fields
              balance = typeof resp.balance === 'number' ? resp.balance :
                (typeof resp.available_balance === 'number' ? resp.available_balance : null);

              // Nested in data object (common pattern)
              if (balance === null && resp.data && typeof resp.data === 'object') {
                balance = typeof resp.data.balance === 'number' ? resp.data.balance :
                  (typeof resp.data.available_balance === 'number' ? resp.data.available_balance : null);
                currency = (resp.data.currency as string) || null;
              } else {
                currency = (resp.currency as string) || null;
              }

              raw = resp;
            }
            status = 'ok';
          }
        } catch (e) {
          status = 'error';
        }
        results.push({ code: p.code, name: p.name, balance, currency, status, raw });
      }
      const numericBalances = results.map(r => (typeof r.balance === 'number' ? r.balance : 0));
      const total = numericBalances.reduce((a, b) => a + b, 0);
      return ApiResponse.success(res, 'Provider balances', { providers: results, total });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch balances', 500);
    }
  }

  static async getFundingInfo(req: Request, res: Response) {
    try {
      const info = config.fundingAccount;
      const accounts = await FundingAccount.find({}).sort({ createdAt: -1 });
      return ApiResponse.success(res, 'Funding info', { funding: info, accounts });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch funding info', 500);
    }
  }

  // CRUD: list accounts
  static async listAccounts(req: Request, res: Response) {
    try {
      const accounts = await FundingAccount.find({}).sort({ createdAt: -1 });
      return ApiResponse.success(res, 'Funding accounts', { accounts, total: accounts.length });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to fetch funding accounts', 500);
    }
  }

  // CRUD: create
  static async createAccount(req: Request, res: Response) {
    try {
      const { bankName, accountName, accountNumber, instructions, active } = req.body;
      if (!bankName || !accountName || !accountNumber) {
        return ApiResponse.error(res, 'bankName, accountName and accountNumber are required', 400);
      }
      const acc = await FundingAccount.create({ bankName, accountName, accountNumber, instructions, active: active !== false });
      return ApiResponse.success(res, 'Funding account created', { account: acc }, 201);
    } catch (err) {
      return ApiResponse.error(res, 'Failed to create funding account', 500);
    }
  }

  // CRUD: update
  static async updateAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const acc = await FundingAccount.findById(id);
      if (!acc) return ApiResponse.error(res, 'Account not found', 404);
      const { bankName, accountName, accountNumber, instructions, active } = req.body;
      if (bankName !== undefined) acc.bankName = bankName;
      if (accountName !== undefined) acc.accountName = accountName;
      if (accountNumber !== undefined) acc.accountNumber = accountNumber;
      if (instructions !== undefined) acc.instructions = instructions;
      if (active !== undefined) acc.active = !!active;
      await acc.save();
      return ApiResponse.success(res, 'Funding account updated', { account: acc });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to update funding account', 500);
    }
  }

  // CRUD: delete
  static async deleteAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const acc = await FundingAccount.findByIdAndDelete(id);
      if (!acc) return ApiResponse.error(res, 'Account not found', 404);
      return ApiResponse.success(res, 'Funding account deleted', { account: acc });
    } catch (err) {
      return ApiResponse.error(res, 'Failed to delete funding account', 500);
    }
  }
}

export default AdminFundingController;
