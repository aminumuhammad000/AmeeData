// utilsvalidators.ts
import Joi from 'joi';

export const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required(),
    phone_number: Joi.string().pattern(/^\d{10,11}$/).required().messages({
      'string.pattern.base': 'Phone number must be 10 or 11 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required',
    }),
    password: Joi.string().min(8).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    referral_code: Joi.string().optional(),
    pin: Joi.string().pattern(/^\d{4}$/).optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export const transactionValidation = {
  create: Joi.object({
    type: Joi.string().valid('airtime_topup', 'data_purchase', 'bill_payment', 'wallet_topup', 'e-pin_purchase').required(),
    amount: Joi.number().positive().required(),
    destination_account: Joi.string().optional(),
    operator_id: Joi.string().optional(),
    plan_id: Joi.string().optional(),
    payment_method: Joi.string().required()
  })
};


// Airtime purchase validation
export const airtimePurchaseSchema = Joi.object({
  network: Joi.string().required().messages({
    'string.empty': 'Network is required',
    'any.required': 'Network is required',
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 or 11 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required',
    }),
  amount: Joi.number().min(50).max(50000).required().messages({
    'number.min': 'Amount must be at least 50',
    'number.max': 'Amount cannot exceed 50000',
    'any.required': 'Amount is required',
  }),
  airtime_type: Joi.string().valid('VTU', 'SHARE_AND_SELL').default('VTU'),
  ported_number: Joi.boolean().default(true),
});

// Data purchase validation
export const dataPurchaseSchema = Joi.object({
  network: Joi.string().required().messages({
    'string.empty': 'Network is required',
    'any.required': 'Network is required',
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 or 11 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required',
    }),
  plan: Joi.string().required().messages({
    'string.empty': 'Plan is required',
    'any.required': 'Plan is required',
  }),
  ported_number: Joi.boolean().default(true),
});

// Cable verification validation
export const cableVerificationSchema = Joi.object({
  provider: Joi.string().required().messages({
    'string.empty': 'Provider is required',
    'any.required': 'Provider is required',
  }),
  iucnumber: Joi.string().required().messages({
    'string.empty': 'IUC number is required',
    'any.required': 'IUC number is required',
  }),
});

// Cable purchase validation
export const cablePurchaseSchema = Joi.object({
  provider: Joi.string().required().messages({
    'string.empty': 'Provider is required',
    'any.required': 'Provider is required',
  }),
  iucnumber: Joi.string().required().messages({
    'string.empty': 'IUC number is required',
    'any.required': 'IUC number is required',
  }),
  plan: Joi.string().required().messages({
    'string.empty': 'Plan is required',
    'any.required': 'Plan is required',
  }),
  subtype: Joi.string().valid('renew', 'change').default('renew'),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 or 11 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required',
    }),
});

// Electricity verification validation
export const electricityVerificationSchema = Joi.object({
  provider: Joi.string().required().messages({
    'string.empty': 'Provider is required',
    'any.required': 'Provider is required',
  }),
  meternumber: Joi.string().required().messages({
    'string.empty': 'Meter number is required',
    'any.required': 'Meter number is required',
  }),
  metertype: Joi.string().valid('prepaid', 'postpaid').required().messages({
    'any.only': 'Meter type must be either prepaid or postpaid',
    'any.required': 'Meter type is required',
  }),
});

// Electricity purchase validation
export const electricityPurchaseSchema = Joi.object({
  provider: Joi.string().required().messages({
    'string.empty': 'Provider is required',
    'any.required': 'Provider is required',
  }),
  meternumber: Joi.string().required().messages({
    'string.empty': 'Meter number is required',
    'any.required': 'Meter number is required',
  }),
  amount: Joi.number().min(500).max(100000).required().messages({
    'number.min': 'Amount must be at least 500',
    'number.max': 'Amount cannot exceed 100000',
    'any.required': 'Amount is required',
  }),
  metertype: Joi.string().valid('prepaid', 'postpaid').required().messages({
    'any.only': 'Meter type must be either prepaid or postpaid',
    'any.required': 'Meter type is required',
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 or 11 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required',
    }),
});

// Exam pin purchase validation
export const examPinPurchaseSchema = Joi.object({
  provider: Joi.string().required().messages({
    'string.empty': 'Provider is required',
    'any.required': 'Provider is required',
  }),
  quantity: Joi.number().integer().min(1).max(10).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 10',
    'any.required': 'Quantity is required',
  }),
});

// Recharge pin purchase validation
export const rechargePinPurchaseSchema = Joi.object({
  network: Joi.string().required().messages({
    'string.empty': 'Network is required',
    'any.required': 'Network is required',
  }),
  quantity: Joi.number().integer().min(1).max(50).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 50',
    'any.required': 'Quantity is required',
  }),
  plan: Joi.string().required().messages({
    'string.empty': 'Plan is required',
    'any.required': 'Plan is required',
  }),
  businessname: Joi.string().required().messages({
    'string.empty': 'Business name is required',
    'any.required': 'Business name is required',
  }),
});

// Data pin purchase validation
export const dataPinPurchaseSchema = Joi.object({
  network: Joi.string().required().messages({
    'string.empty': 'Network is required',
    'any.required': 'Network is required',
  }),
  quantity: Joi.number().integer().min(1).max(50).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 50',
    'any.required': 'Quantity is required',
  }),
  data_plan: Joi.string().required().messages({
    'string.empty': 'Data plan is required',
    'any.required': 'Data plan is required',
  }),
  businessname: Joi.string().required().messages({
    'string.empty': 'Business name is required',
    'any.required': 'Business name is required',
  }),
});
