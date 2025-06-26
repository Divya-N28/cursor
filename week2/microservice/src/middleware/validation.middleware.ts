import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { userSchema } from '../models/user.model';
import { ValidationErrorItem } from 'joi';

export const validateUserInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((detail: ValidationErrorItem) => detail.message).join(', ');
      throw new AppError(errorMessage, 400);
    }
    next();
  } catch (error) {
    next(error);
  }
}; 