import AirtimePlan from '../models/airtime_plan.model.js';
import logger from '../utils/logger.js';
import { ApiResponse } from '../utils/response.js';
export class AdminPricingController {
    /**
     * Get all airtime/data plans with optional filters
     */
    static async getAllPlans(req, res) {
        try {
            const { providerId, type, active } = req.query;
            const filter = {};
            if (providerId)
                filter.providerId = parseInt(providerId);
            if (type)
                filter.type = type;
            if (active !== undefined)
                filter.active = active === 'true';
            const plans = await AirtimePlan.find(filter).sort({ providerId: 1, type: 1, price: 1 });
            ApiResponse.success(res, 'Plans retrieved successfully', { plans, total: plans.length });
        }
        catch (error) {
            logger.error('Error getting plans:', error);
            ApiResponse.error(res, 'Failed to retrieve plans', 500);
        }
    }
    /**
     * Get a specific plan by ID
     */
    static async getPlanById(req, res) {
        try {
            const { id } = req.params;
            const plan = await AirtimePlan.findById(id);
            if (!plan) {
                ApiResponse.error(res, 'Plan not found', 404);
                return;
            }
            ApiResponse.success(res, 'Plan retrieved successfully', { plan });
        }
        catch (error) {
            logger.error('Error getting plan:', error);
            ApiResponse.error(res, 'Failed to retrieve plan', 500);
        }
    }
    /**
     * Create a new airtime/data plan
     */
    static async createPlan(req, res) {
        try {
            const { providerId, providerName, externalPlanId, code, name, price, type, discount, api_discount, meta, active } = req.body;
            // Validation
            if (!providerId || !providerName || !name || price === undefined || !type) {
                ApiResponse.error(res, 'Missing required fields: providerId, providerName, name, price, type', 400);
                return;
            }
            if (![1, 2, 3, 4].includes(providerId)) {
                ApiResponse.error(res, 'Invalid providerId. Must be 1-4', 400);
                return;
            }
            if (!['AIRTIME', 'DATA'].includes(type)) {
                ApiResponse.error(res, 'Invalid type. Must be AIRTIME or DATA', 400);
                return;
            }
            const newPlan = new AirtimePlan({
                providerId,
                providerName,
                externalPlanId,
                code,
                name,
                price,
                type,
                discount: discount || 0,
                api_discount: api_discount || 0,
                meta,
                active: active !== false,
            });
            await newPlan.save();
            logger.info(`New plan created: ${newPlan._id}`);
            ApiResponse.success(res, 'Plan created successfully', { plan: newPlan }, 201);
        }
        catch (error) {
            logger.error('Error creating plan:', error);
            ApiResponse.error(res, 'Failed to create plan', 500);
        }
    }
    /**
     * Update an existing plan
     */
    static async updatePlan(req, res) {
        try {
            const { id } = req.params;
            const { providerId, providerName, externalPlanId, code, name, price, type, discount, api_discount, meta, active } = req.body;
            const plan = await AirtimePlan.findById(id);
            if (!plan) {
                ApiResponse.error(res, 'Plan not found', 404);
                return;
            }
            // Update only provided fields
            if (providerId !== undefined)
                plan.providerId = providerId;
            if (providerName !== undefined)
                plan.providerName = providerName;
            if (externalPlanId !== undefined)
                plan.externalPlanId = externalPlanId;
            if (code !== undefined)
                plan.code = code;
            if (name !== undefined)
                plan.name = name;
            if (price !== undefined)
                plan.price = price;
            if (type !== undefined)
                plan.type = type;
            if (discount !== undefined)
                plan.discount = discount;
            if (api_discount !== undefined)
                plan.api_discount = api_discount;
            if (meta !== undefined)
                plan.meta = meta;
            if (active !== undefined)
                plan.active = active;
            await plan.save();
            logger.info(`Plan updated: ${id}`);
            ApiResponse.success(res, 'Plan updated successfully', { plan });
        }
        catch (error) {
            logger.error('Error updating plan:', error);
            ApiResponse.error(res, 'Failed to update plan', 500);
        }
    }
    /**
     * Delete a plan
     */
    static async deletePlan(req, res) {
        try {
            const { id } = req.params;
            const plan = await AirtimePlan.findByIdAndDelete(id);
            if (!plan) {
                ApiResponse.error(res, 'Plan not found', 404);
                return;
            }
            logger.info(`Plan deleted: ${id}`);
            ApiResponse.success(res, 'Plan deleted successfully', { plan });
        }
        catch (error) {
            logger.error('Error deleting plan:', error);
            ApiResponse.error(res, 'Failed to delete plan', 500);
        }
    }
    /**
     * Bulk import plans from array
     */
    static async bulkImportPlans(req, res) {
        try {
            const { plans } = req.body;
            if (!Array.isArray(plans)) {
                ApiResponse.error(res, 'plans must be an array', 400);
                return;
            }
            // Validate each plan
            for (const plan of plans) {
                if (!plan.providerId || !plan.providerName || !plan.name || plan.price === undefined || !plan.type) {
                    ApiResponse.error(res, 'Each plan must have: providerId, providerName, name, price, type', 400);
                    return;
                }
            }
            // Clear existing plans (optional - remove if you want to keep old data)
            // await AirtimePlan.deleteMany({});
            const result = await AirtimePlan.insertMany(plans);
            logger.info(`Bulk imported ${result.length} plans`);
            ApiResponse.success(res, 'Plans imported successfully', { count: result.length }, 201);
        }
        catch (error) {
            logger.error('Error bulk importing plans:', error);
            ApiResponse.error(res, 'Failed to import plans', 500);
        }
    }
    /**
     * Get plans by provider
     */
    static async getPlansByProvider(req, res) {
        try {
            const { providerId } = req.params;
            const { type } = req.query;
            const filter = { providerId: parseInt(providerId), active: true };
            if (type)
                filter.type = type;
            const plans = await AirtimePlan.find(filter).sort({ price: 1 });
            ApiResponse.success(res, 'Plans retrieved successfully', { plans, total: plans.length });
        }
        catch (error) {
            logger.error('Error getting plans by provider:', error);
            ApiResponse.error(res, 'Failed to retrieve plans', 500);
        }
    }
}
export default AdminPricingController;
