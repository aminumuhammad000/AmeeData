// controllers/billpayment.controller.ts
import { NextFunction, Request, Response } from 'express';
import AirtimePlan from '../models/airtime_plan.model.js';
import { Transaction, User } from '../models/index.js';
import { Plan } from '../models/plan.model.js';
import providerRegistry from '../services/providerRegistry.service.js';
import topupmateService from '../services/topupmate.service.js';
import { WalletService } from '../services/wallet.service.js';
import { AuthRequest } from '../types/index.js';
import { normalizeNetwork } from '../utils/network.js';
import { ApiResponse } from '../utils/response.js';

export class BillPaymentController {
  // Get networks
  async getNetworks(req: Request, res: Response, next: NextFunction) {
    try {
      const selected = await providerRegistry.getPreferredProviderFor('airtime');
      const client = selected?.client || topupmateService;
      const networks = await (client.getNetworks ? client.getNetworks() : topupmateService.getNetworks());
      const payload = (networks as any).response || networks;
      return ApiResponse.success(res, 'Networks retrieved successfully', payload);
    } catch (error) {
      next(error);
    }
  }

  // Get data plans
  async getDataPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const { network } = req.query;

      // Optional filter by provider/network
      let providerId: number | undefined;
      if (network) {
        const normalized = normalizeNetwork(String(network));
        if (!normalized) {
          return ApiResponse.error(res, 'Invalid network. Must be: mtn, airtel, glo, or 9mobile', 400);
        }
        providerId = normalized;
      }

      // Fetch from the same model the admin manages
      const filter: any = { type: 'DATA', active: true };
      if (providerId) filter.providerId = providerId;

      const dbPlans = await AirtimePlan.find(filter).sort({ providerId: 1, price: 1, name: 1 });

      // Check if API request
      const isApiRequest = !!req.headers['x-api-key'];

      // Map to frontend expected shape
      const payload = dbPlans.map((p: any) => {
        const discount = isApiRequest ? (p.api_discount || 0) : (p.discount || 0);
        const finalPrice = Number(p.price) * (1 - discount / 100);

        return {
          plan_id: String(p._id),
          network: String(p.providerId),
          plan_name: p.name,
          plan_type: 'DATA',
          validity: p.meta?.validity || '',
          price: Number(finalPrice.toFixed(2)),
          data_value: p.meta?.data_value || p.code || '',
          providerName: p.providerName,
        };
      });

      return ApiResponse.success(res, 'Data plans retrieved successfully', payload);
    } catch (error) {
      next(error);
    }
  }

  // Get cable providers
  async getCableProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const selected = await providerRegistry.getPreferredProviderFor('cable');
      const client = selected?.client || topupmateService;
      const providers = await (client.getCableProviders ? client.getCableProviders() : topupmateService.getCableProviders());
      const payload = (providers as any).response || providers;
      return ApiResponse.success(res, 'Cable providers retrieved successfully', payload);
    } catch (error) {
      next(error);
    }
  }

  // Get electricity providers
  async getElectricityProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const selected = await providerRegistry.getPreferredProviderFor('electricity');
      const client = selected?.client || topupmateService;
      const providers = await (client.getElectricityProviders ? client.getElectricityProviders() : topupmateService.getElectricityProviders());
      const payload = (providers as any).response || providers;
      return ApiResponse.success(res, 'Electricity providers retrieved successfully', payload);
    } catch (error) {
      next(error);
    }
  }

  // Get exam pin providers
  async getExamPinProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const selected = await providerRegistry.getPreferredProviderFor('exampin');
      const client = selected?.client || topupmateService;
      const providers = await (client.getExamPinProviders ? client.getExamPinProviders() : topupmateService.getExamPinProviders());
      const payload = (providers as any).response || providers;
      return ApiResponse.success(res, 'Exam pin providers retrieved successfully', payload);
    } catch (error) {
      next(error);
    }
  }

  // Purchase airtime
  async purchaseAirtime(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { network, phone, amount, airtime_type = 'VTU', ported_number = true, pin } = req.body;
      const userId = req.user?.id;

      // Enforce transaction PIN (skip for API users)
      const isApiRequest = !!req.headers['x-api-key'];

      if (!isApiRequest) {
        const user = await User.findById(userId);
        if (!user) return ApiResponse.error(res, 'User not found', 404);
        if (!pin || !/^\d{4}$/.test(String(pin))) {
          return ApiResponse.error(res, 'Valid 4-digit transaction PIN is required', 400);
        }
        if (!user.transaction_pin) {
          // Allow default PIN for legacy users without a stored PIN
          if (String(pin) !== '1234') {
            return ApiResponse.error(res, 'Incorrect transaction PIN', 400);
          }
        } else {
          const pinOk = await import('bcryptjs').then(({ default: bcrypt }) => bcrypt.compare(String(pin), user.transaction_pin as string));
          if (!pinOk) {
            return ApiResponse.error(res, 'Incorrect transaction PIN', 400);
          }
        }
      }

      // Normalize network input to provider ID
      const providerId = normalizeNetwork(network);
      if (!providerId) {
        return ApiResponse.error(res, 'Invalid network. Must be: mtn, airtel, glo, or 9mobile', 400);
      }

      // Calculate discount
      const airtimePlan = await AirtimePlan.findOne({ providerId, type: 'AIRTIME', active: true });
      let discount = 0;
      if (airtimePlan) {
        discount = isApiRequest ? (airtimePlan.api_discount || 0) : (airtimePlan.discount || 0);
      }
      const finalAmount = parseFloat(amount) * (1 - discount / 100);

      // Validate user balance
      if (!userId) {
        return ApiResponse.error(res, 'User authentication failed', 401);
      }

      let wallet;
      try {
        wallet = await WalletService.getWalletByUserId(userId);
      } catch (err: any) {
        return ApiResponse.error(res, `Wallet error: ${err.message}`, 400);
      }

      if (!wallet) {
        return ApiResponse.error(res, 'Wallet not found', 404);
      }

      if (wallet.balance <= 0) {
        return ApiResponse.error(res, 'Wallet is empty. Please fund your wallet.', 400);
      }
      if (wallet.balance < finalAmount) {
        return ApiResponse.error(res, 'Insufficient wallet balance', 400);
      }

      // Generate reference
      const ref = topupmateService.generateReference('AIRTIME');

      // Get wallet for wallet_id
      const walletData = await WalletService.getWalletByUserId(userId);

      // Deduct from wallet
      await WalletService.debit(userId, finalAmount, 'Airtime purchase');

      // Create transaction record
      const transaction = await Transaction.create({
        user_id: userId,
        wallet_id: walletData._id,
        type: 'airtime_topup',
        amount: parseFloat(amount),
        total_charged: finalAmount,
        reference_number: ref,
        payment_method: 'wallet',
        status: 'pending',
        destination_account: phone,
        description: `Airtime purchase - ${network.toUpperCase()} - ${phone}`,
      });

      try {
        const selected = await providerRegistry.getPreferredProviderFor('airtime');
        const client = selected?.client || topupmateService;
        const result = await (client.purchaseAirtime
          ? client.purchaseAirtime({
            network: String(providerId),
            phone: String(phone),
            ref,
            airtime_type,
            ported_number,
            amount: String(amount),
          })
          : topupmateService.purchaseAirtime({
            network: String(providerId),
            phone: String(phone),
            ref,
            airtime_type,
            ported_number,
            amount: String(amount),
          }));

        // Update transaction status
        const isSuccess = (result.status === 'success' || result.status === true || result.status === 'true');
        const hasErrorMsg = result.msg || result.error || result.message;

        if (isSuccess && !hasErrorMsg) {
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'successful',
            updated_at: new Date()
          });
          const updatedWallet = await WalletService.getWalletByUserId(userId);
          return ApiResponse.success(res, 'Airtime purchase successful', {
            transaction,
            balance: updatedWallet?.balance,
            provider_response: result,
          });
        } else {
          // Refund user if failed
          const refundAmount = finalAmount;
          await WalletService.credit(userId, refundAmount, 'Airtime purchase refund');
          const errorMsg = hasErrorMsg || (result.status === 'fail' ? 'Provider failed the request' : 'Unknown provider error');
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'failed',
            error_message: errorMsg,
            updated_at: new Date()
          });
          console.error('❌ Airtime purchase failed - Provider Response:', JSON.stringify(result, null, 2));
          return ApiResponse.error(res, `Airtime purchase failed: ${errorMsg}`, 400);
        }
      } catch (error: any) {
        // Refund user on error
        await WalletService.credit(userId, finalAmount, 'Airtime purchase refund');
        await Transaction.findByIdAndUpdate(transaction._id, {
          status: 'failed',
          error_message: error.message,
          updated_at: new Date()
        });
        console.error('❌ Airtime purchase error:', error.message, error.response?.data);
        // Throw a clean error object to avoid circular reference issues in global error handler
        throw new Error(error.response?.data?.message || error.message || 'Airtime purchase failed');
      }
    } catch (error) {
      next(error);
    }
  }

  // Purchase data
  async purchaseData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { network, phone, plan, ported_number = true, pin } = req.body;
      const userId = req.user?.id;

      // Enforce transaction PIN (skip for API users)
      const isApiRequest = !!req.headers['x-api-key'];

      if (!isApiRequest) {
        const user = await User.findById(userId);
        if (!user) return ApiResponse.error(res, 'User not found', 404);
        if (!user.transaction_pin) {
          return ApiResponse.error(res, 'Please set your 4-digit transaction PIN before making purchases', 400);
        }
        if (!pin || !/^\d{4}$/.test(String(pin))) {
          return ApiResponse.error(res, 'Valid 4-digit transaction PIN is required', 400);
        }
        const pinOk = await import('bcryptjs').then(({ default: bcrypt }) => bcrypt.compare(String(pin), user.transaction_pin as string));
        if (!pinOk) {
          return ApiResponse.error(res, 'Incorrect transaction PIN', 400);
        }
      }

      // Normalize network input to provider ID
      const providerId = normalizeNetwork(network);
      if (!providerId) {
        return ApiResponse.error(res, 'Invalid network. Must be: mtn, airtel, glo, or 9mobile', 400);
      }

      // Get plan details from DB
      const dbPlan = await AirtimePlan.findById(plan);
      if (!dbPlan) {
        return ApiResponse.error(res, 'Invalid plan selected', 400);
      }

      const amount = Number(dbPlan.price);

      // Calculate discount
      let discount = isApiRequest ? (dbPlan.api_discount || 0) : (dbPlan.discount || 0);
      const finalAmount = amount * (1 - discount / 100);

      // Validate user balance
      if (!userId) {
        return ApiResponse.error(res, 'User authentication failed', 401);
      }

      let wallet;
      try {
        wallet = await WalletService.getWalletByUserId(userId);
      } catch (err: any) {
        return ApiResponse.error(res, `Wallet error: ${err.message}`, 400);
      }

      if (!wallet) {
        return ApiResponse.error(res, 'Wallet not found', 404);
      }

      if (wallet.balance <= 0) {
        return ApiResponse.error(res, 'Wallet is empty. Please fund your wallet.', 400);
      }
      if (wallet.balance < finalAmount) {
        return ApiResponse.error(res, 'Insufficient wallet balance', 400);
      }

      // Generate reference
      const ref = topupmateService.generateReference('DATA');

      // Get wallet for wallet_id
      const walletData = await WalletService.getWalletByUserId(userId);

      // Deduct from wallet
      await WalletService.debit(userId, finalAmount, 'Data purchase');

      // Create transaction record
      const transaction = await Transaction.create({
        user_id: userId,
        wallet_id: walletData._id,
        type: 'data_purchase',
        amount,
        total_charged: finalAmount,
        reference_number: ref,
        payment_method: 'wallet',
        status: 'pending',
        destination_account: phone,
        description: `Data purchase - ${network.toUpperCase()} - ${phone}`,
        plan_id: dbPlan._id
      });

      try {
        const selected = await providerRegistry.getPreferredProviderFor('data');
        const client = selected?.client || topupmateService;
        const result = await (client.purchaseData
          ? client.purchaseData({
            network: String(providerId),
            phone: String(phone),
            ref,
            plan: String(dbPlan.externalPlanId || dbPlan.code), // Use external ID from DB
            ported_number,
          })
          : topupmateService.purchaseData({
            network: String(providerId),
            phone: String(phone),
            ref,
            plan: String(dbPlan.externalPlanId || dbPlan.code), // Use external ID from DB
            ported_number,
          }));

        // Update transaction status
        const isSuccess = (result.status === 'success' || result.status === true || result.status === 'true');
        const hasErrorMsg = result.msg || result.error || result.message;

        if (isSuccess && !hasErrorMsg) {
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'successful',
            updated_at: new Date()
          });
          const updatedWallet = await WalletService.getWalletByUserId(userId);
          return ApiResponse.success(res, 'Data purchase successful', {
            transaction,
            balance: updatedWallet?.balance,
            provider_response: result,
          });
        } else {
          // Refund user if failed
          const refundAmount = finalAmount;
          await WalletService.credit(userId, refundAmount, 'Data purchase refund');
          const errorMsg = hasErrorMsg || (result.status === 'fail' ? 'Provider failed the request' : 'Unknown provider error');
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'failed',
            error_message: errorMsg,
            updated_at: new Date()
          });
          console.error('❌ Data purchase failed - Provider Response:', JSON.stringify(result, null, 2));
          return ApiResponse.error(res, `Data purchase failed: ${errorMsg}`, 400);
        }
      } catch (error: any) {
        // Refund user on error
        await WalletService.credit(userId, finalAmount, 'Data purchase refund');
        await Transaction.findByIdAndUpdate(transaction._id, {
          status: 'failed',
          error_message: error.message,
          updated_at: new Date()
        });
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  // Verify cable account
  async verifyCableAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, iucnumber } = req.body;
      const selected = await providerRegistry.getPreferredProviderFor('cable');
      const client = selected?.client || topupmateService;
      const result = await (client.verifyCableAccount
        ? client.verifyCableAccount({ provider: String(provider), iucnumber: String(iucnumber) })
        : topupmateService.verifyCableAccount({ provider: String(provider), iucnumber: String(iucnumber) }));

      if (result.status === 'success' || result.status === true || result.status === 'true') {
        return ApiResponse.success(res, 'Account verification successful', {
          customer_name: result.Customer_Name,
          iucnumber,
        });
      } else {
        return ApiResponse.error(res, 'Account verification failed', 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Purchase cable TV
  async purchaseCableTV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { provider, iucnumber, plan, subtype = 'renew', phone } = req.body;
      const userId = req.user?.id;

      // Get plan details
      const plans = await topupmateService.getCableTVPlans();
      const selectedPlan = plans.response?.find((p: any) => p.id === plan);

      if (!selectedPlan) {
        return ApiResponse.error(res, 'Invalid plan selected', 400);
      }

      const amount = parseFloat(selectedPlan.price);

      // Validate user balance
      const wallet = await WalletService.getWalletByUserId(userId);
      if (wallet.balance < amount) {
        return ApiResponse.error(res, 'Insufficient wallet balance', 400);
      }

      // Generate reference
      const ref = topupmateService.generateReference('CABLE');

      // Deduct from wallet
      await WalletService.debit(userId, amount, 'Cable TV purchase');

      // Create transaction record
      const transaction = await Transaction.create({
        user_id: userId,
        type: 'cable',
        amount,
        reference: ref,
        status: 'pending',
        metadata: { provider, iucnumber, plan: selectedPlan, subtype },
      });

      try {
        const selected = await providerRegistry.getPreferredProviderFor('cable');
        const client = selected?.client || topupmateService;
        const result = await (client.purchaseCableTV
          ? client.purchaseCableTV({ provider, iucnumber, plan, ref, subtype, phone })
          : topupmateService.purchaseCableTV({ provider, iucnumber, plan, ref, subtype, phone }));

        // Update transaction status
        if (result.status === 'success' || result.status === true || result.status === 'true') {
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'successful',
            response: result
          });
          const updatedWallet = await WalletService.getWalletByUserId(userId);
          return ApiResponse.success(res, 'Cable TV purchase successful', {
            transaction,
            balance: updatedWallet?.balance,
            provider_response: result,
          });
        } else {
          // Refund user if failed
          await WalletService.credit(userId, amount, 'Cable TV purchase refund');
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'failed',
            response: result
          });
          return ApiResponse.error(res, 'Cable TV purchase failed', 400);
        }
      } catch (error: any) {
        // Refund user on error
        await WalletService.credit(userId, amount, 'Cable TV purchase refund');
        await Transaction.findByIdAndUpdate(transaction._id, {
          status: 'failed',
          response: { error: error.message }
        });
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  // Verify electricity meter
  async verifyElectricityMeter(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, meternumber, metertype } = req.body;
      const selected = await providerRegistry.getPreferredProviderFor('electricity');
      const client = selected?.client || topupmateService;
      const result = await (client.verifyElectricityMeter
        ? client.verifyElectricityMeter({ provider, meternumber, metertype })
        : topupmateService.verifyElectricityMeter({ provider, meternumber, metertype }));

      if (result.status === 'success' || result.status === true || result.status === 'true') {
        return ApiResponse.success(res, 'Meter verification successful', {
          customer_name: result.Customer_Name,
          meternumber,
        });
      } else {
        return ApiResponse.error(res, 'Meter verification failed', 400);
      }
    } catch (error) {
      next(error);
    }
  }

  // Purchase electricity
  async purchaseElectricity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { provider, meternumber, amount, metertype, phone, pin } = req.body;
      const userId = req.user?.id;

      // Enforce transaction PIN
      const isApiRequest = !!req.headers['x-api-key'];
      if (!isApiRequest) {
        const user = await User.findById(userId);
        if (!user) return ApiResponse.error(res, 'User not found', 404);
        
        if (!user.transaction_pin) {
           // Allow legacy
           if (String(pin) !== '1234') {
             return ApiResponse.error(res, 'Incorrect transaction PIN', 400);
           }
        } else {
          const pinOk = await import('bcryptjs').then(({ default: bcrypt }) => bcrypt.compare(String(pin), user.transaction_pin as string));
          if (!pinOk) {
            return ApiResponse.error(res, 'Incorrect transaction PIN', 400);
          }
        }
      }

      // Validate user balance
      const wallet = await WalletService.getWalletByUserId(userId);
      if (wallet.balance < parseFloat(amount)) {
        return ApiResponse.error(res, 'Insufficient wallet balance', 400);
      }

      // Generate reference
      const ref = topupmateService.generateReference('ELECTRIC');

      // Deduct from wallet
      await WalletService.debit(userId, parseFloat(amount), 'Electricity purchase');

      // Create transaction record
      const transaction = await Transaction.create({
        user_id: userId,
        type: 'electricity',
        amount: parseFloat(amount),
        reference_number: ref, // Consistent naming
        status: 'pending',
        destination_account: meternumber,
        description: `Electricity: ${meternumber} (${metertype})`,
        metadata: { provider, meternumber, metertype },
      });

      try {
        const selected = await providerRegistry.getPreferredProviderFor('electricity');
        const client = selected?.client || topupmateService;
        const result = await (client.purchaseElectricity
          ? client.purchaseElectricity({ provider, meternumber, amount, metertype, phone, ref })
          : topupmateService.purchaseElectricity({ provider, meternumber, amount, metertype, phone, ref }));

        // Update transaction status
        const statusValue = String(result.status || result.Status || '').toLowerCase();
        const isSuccess = (statusValue === 'success' || statusValue === 'successful' || statusValue === 'true' || result.status === true);
        const token = result.token || result.msg;

        if (isSuccess) {
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'successful',
            updated_at: new Date()
          });
          const updatedWallet = await WalletService.getWalletByUserId(userId);
          return ApiResponse.success(res, 'Electricity purchase successful', {
            transaction,
            balance: updatedWallet?.balance,
            token: token,
            provider_response: result,
          });
        } else {
          // Refund user if failed
          await WalletService.credit(userId, parseFloat(amount), 'Electricity purchase refund');
          const errorMsg = result.msg || result.error || result.message || 'Provider failed the request';
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'failed',
            error_message: errorMsg,
            updated_at: new Date()
          });
          return ApiResponse.error(res, `Electricity purchase failed: ${errorMsg}`, 400);
        }
      } catch (error: any) {
        // Refund user on error
        await WalletService.credit(userId, parseFloat(amount), 'Electricity purchase refund');
        await Transaction.findByIdAndUpdate(transaction._id, {
          status: 'failed',
          response: { error: error.message }
        });
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  // Purchase exam pin
  async purchaseExamPin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { provider, quantity, pin } = req.body;
      const userId = req.user?.id;

      // Enforce transaction PIN
      const isApiRequest = !!req.headers['x-api-key'];
      if (!isApiRequest) {
        const user = await User.findById(userId);
        if (!user) return ApiResponse.error(res, 'User not found', 404);
        
        if (!user.transaction_pin) {
           if (String(pin) !== '1234') {
             return ApiResponse.error(res, 'Incorrect transaction PIN', 400);
           }
        } else {
          const pinOk = await import('bcryptjs').then(({ default: bcrypt }) => bcrypt.compare(String(pin), user.transaction_pin as string));
          if (!pinOk) {
            return ApiResponse.error(res, 'Incorrect transaction PIN', 400);
          }
        }
      }

      // Hardcoded pricing for providers
      const EXAM_PRICES: Record<string, number> = {
        '1': 3360, // WAEC
        '2': 2180, // NECO
        '3': 950,  // NABTEB
      };

      const unitPrice = EXAM_PRICES[String(provider)];
      if (!unitPrice) {
        return ApiResponse.error(res, 'Invalid exam provider', 400);
      }

      const totalAmount = unitPrice * parseInt(quantity);

      // Validate user balance
      const wallet = await WalletService.getWalletByUserId(userId);
      if (wallet.balance < totalAmount) {
        return ApiResponse.error(res, 'Insufficient wallet balance', 400);
      }

      // Generate reference
      const ref = topupmateService.generateReference('EXAMPIN');

      // Deduct from wallet
      await WalletService.debit(userId, totalAmount, 'Exam pin purchase');

      // Create transaction record
      const transaction = await Transaction.create({
        user_id: userId,
        type: 'exampin',
        amount: totalAmount,
        reference_number: ref,
        status: 'pending',
        destination_account: `Exam Pin (${quantity})`,
        description: `Exam Pin: ${provider === '1' ? 'WAEC' : provider === '2' ? 'NECO' : 'NABTEB'} x ${quantity}`,
        metadata: { provider, quantity },
      });

      try {
        const selected = await providerRegistry.getPreferredProviderFor('exampin');
        const client = selected?.client || topupmateService;
        const result = await (client.purchaseExamPin
          ? client.purchaseExamPin({ provider, quantity, ref })
          : topupmateService.purchaseExamPin({ provider, quantity, ref }));

        // Update transaction status
        const statusValue = String(result.status || result.Status || '').toLowerCase();
        const isSuccess = (statusValue === 'success' || statusValue === 'successful' || statusValue === 'true' || result.status === true);
        const pins = result.pins || result.pin || result.token || result.msg;

        if (isSuccess) {
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'successful',
            updated_at: new Date()
          });
          const updatedWallet = await WalletService.getWalletByUserId(userId);
          return ApiResponse.success(res, 'Exam pin purchase successful', {
            transaction,
            balance: updatedWallet?.balance,
            pins: pins,
            provider_response: result,
          });
        } else {
          // Refund user if failed
          await WalletService.credit(userId, totalAmount, 'Exam pin purchase refund');
          const errorMsg = result.msg || result.error || result.message || 'Provider failed the request';
          await Transaction.findByIdAndUpdate(transaction._id, {
            status: 'failed',
            error_message: errorMsg,
            updated_at: new Date()
          });
          return ApiResponse.error(res, `Exam pin purchase failed: ${errorMsg}`, 400);
        }
      } catch (error: any) {
        // Refund user on error
        await WalletService.credit(userId, totalAmount, 'Exam pin purchase refund');
        await Transaction.findByIdAndUpdate(transaction._id, {
          status: 'failed',
          response: { error: error.message }
        });
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  // Get transaction status
  async getTransactionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { reference } = req.params;

      const selected = await providerRegistry.getPreferredProviderFor('airtime');
      const client = selected?.client || topupmateService;
      const result = await (client.getTransactionStatus
        ? client.getTransactionStatus(reference)
        : topupmateService.getTransactionStatus(reference));

      if (result.status === 'success' || result.status === true || result.status === 'true') {
        return ApiResponse.success(res, 'Transaction status retrieved', result.response);
      } else {
        return ApiResponse.error(res, 'Failed to retrieve transaction status', 400);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get plans for developers (with developer pricing)
   * @route GET /api/billpayment/plans
   */
  async getDeveloperPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await Plan.find({ status: 'active' }).populate('operator_id');

      const payload = plans.map(plan => ({
        id: plan._id,
        name: plan.name,
        operator: (plan.operator_id as any)?.name,
        operator_code: (plan.operator_id as any)?.code,
        price: plan.developer_price || plan.price,
        type: plan.type,
        validity: plan.validity,
        data_amount: plan.data_amount
      }));

      return ApiResponse.success(res, 'Developer plans retrieved successfully', payload);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get wallet balance
   * @route GET /api/billpayment/balance
   */
  async getBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, 'User authentication failed', 401);
      }

      const wallet = await WalletService.getWalletByUserId(userId);
      if (!wallet) {
        return ApiResponse.error(res, 'Wallet not found', 404);
      }

      return ApiResponse.success(res, 'Wallet balance retrieved successfully', {
        balance: wallet.balance,
        currency: wallet.currency || 'NGN'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BillPaymentController();
