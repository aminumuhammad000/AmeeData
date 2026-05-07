// middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../utils/response.js';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return ApiResponse.error(res, 'Validation error', 422);
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};