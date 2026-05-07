// utils/response.ts
import { Response } from 'express';

export class ApiResponse {
  // Support both signatures:
  // ApiResponse.success(res, data, message?)
  // ApiResponse.success(res, message, data?)
  static success(res: Response, a: any, b: any = undefined, statusCode = 200) {
    let data: any;
    let message: string;

    // If second arg is a string, treat as message: (res, message, data?)
    if (typeof a === 'string') {
      message = a;
      data = b;
    } else {
      // Otherwise treat as (res, data, message?)
      data = a;
      message = typeof b === 'string' ? b : 'Success';
    }

    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res: Response, message = 'Error', statusCode = 500, errors?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }

  static paginated(res: Response, data: any[], pagination: any, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination
    });
  }
}