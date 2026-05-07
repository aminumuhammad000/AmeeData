// middleware/logger.middleware.ts
import { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { logger } from '../config/bootstrap.js';

// Extend Request interface to include custom properties
interface CustomRequest extends Request {
  _startTime?: [number, number];
}

// Custom token to get user ID if authenticated
morgan.token('user-id', (req: Request) => {
  return (req as any).user?.id || 'anonymous';
});

// Custom format for detailed logging (using built-in response-time)
const detailedFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Morgan stream to integrate with winston
const stream = {
  write: (message: string) => {
    // Remove trailing newline
    logger.info(message.trim());
  }
};

// Create morgan middleware with custom format
export const requestLogger = morgan(detailedFormat, { stream });

// Additional custom request logging middleware for detailed info
export const detailedRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  const customReq = req as CustomRequest;
  
  // Store start time
  customReq._startTime = process.hrtime();
  
  const startTime = Date.now();
  
  // Log incoming request
  const requestLog: any = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id || 'anonymous',
    headers: {
      origin: req.get('origin'),
      contentType: req.get('content-type'),
      authorization: req.get('authorization') ? 'Bearer ***' : undefined
    }
  };

  // Log request body for POST, PUT, PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '***';
    if (sanitizedBody.password_hash) sanitizedBody.password_hash = '***';
    if (sanitizedBody.otp_code) sanitizedBody.otp_code = '***';
    requestLog.body = sanitizedBody;
  }

  logger.info('📥 Incoming Request', requestLog);

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    
    const responseLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.id || 'anonymous',
      ip: req.ip || req.connection.remoteAddress
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('📤 Response Error', responseLog);
    } else if (res.statusCode >= 400) {
      logger.warn('📤 Response Warning', responseLog);
    } else {
      logger.info('📤 Response Success', responseLog);
    }

    return originalSend.call(this, data);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    userId: (req as any).user?.id || 'anonymous',
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  };

  logger.error('💥 Error occurred', errorLog);
  next(err);
};
