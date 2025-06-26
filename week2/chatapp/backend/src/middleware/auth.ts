import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { UserModel } from '../models/User';

interface JwtPayload {
  id: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        status: 'online' | 'offline' | 'away';
        lastSeen?: Date;
      };
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-super-secret-jwt-key'
    ) as JwtPayload;

    // Get user from token
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw new AppError(401, 'User not found', 'UNAUTHORIZED');
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      status: user.status,
      lastSeen: user.lastSeen,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token', 'UNAUTHORIZED'));
    } else {
      next(error);
    }
  }
}; 