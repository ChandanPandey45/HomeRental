import ErrorHandler from '../utils/errorHandler.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Firebase Auth errors (from admin SDK) typically have codes like 'auth/invalid-id-token'
  if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
    const message = 'Authentication error. Invalid or expired token.';
    err = new ErrorHandler(message, 401);
  }

  // Generic validation / cast errors fallback
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    const message = err.message || 'Invalid request data';
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    statusCode: err.statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async handler wrapper to catch async errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
