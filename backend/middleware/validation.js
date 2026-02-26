import { validationResult } from 'express-validator';
import ErrorHandler from '../utils/errorHandler.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((error) => ({
      field: error.param,
      message: error.msg
    }));

    return next(new ErrorHandler(`Validation error: ${JSON.stringify(messages)}`, 400));
  }

  next();
};
