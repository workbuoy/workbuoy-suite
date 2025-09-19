import AppError from '../../AppError';
import { log } from '../../logging/logger';

// Express-like error handler middleware that integrates with structured logger
export function errorHandler(err: any, req: any, res: any, next: any): void {
  // correlationId from request context if present
  const correlationId = req?.correlationId || 'unknown';

  if (err instanceof AppError) {
    // Log application errors at error level
    log(
      'error',
      'http.errorHandler',
      err.message,
      { details: err.details || null, type: 'APP_ERROR' },
      correlationId
    );
    res.status(err.statusCode || 500).json({
      message: err.message,
      details: err.details || null,
    });
  } else {
    // Log unexpected errors and mask details from client
    log(
      'error',
      'http.errorHandler',
      'UNEXPECTED_ERROR',
      { error: err, type: 'UNEXPECTED' },
      correlationId
    );
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
