import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler';
import { validateUser, createUser, hashPassword, toJSON } from '../models/user.model';
import { databaseService } from './database.service';
import { AuthService, User, UserInput, AuthResponse, UserResponse, UserUpdate } from '../types';
import { logger } from '../utils/logger';

const createAuthService = (): AuthService => {
  const generateToken = (user: User): string => {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  };

  const register = async (userData: UserInput): Promise<AuthResponse> => {
    // Validate user data
    const { error } = validateUser(userData);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    // Check if user already exists
    const existingUser = await databaseService.findByEmail(userData.email) ||
                        await databaseService.findByUsername(userData.username);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create new user
    const user = createUser({
      ...userData,
      id: uuidv4()
    });

    // Hash password
    user.password = await hashPassword(user.password);

    // Save user
    const savedUser = await databaseService.create(user);

    // Generate token
    const token = generateToken(savedUser);

    return {
      user: toJSON(savedUser),
      token
    };
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    // Find user
    const user = await databaseService.findByEmail(email);
    logger.info('Login attempt for email:', email);
    logger.info('User found:', user ? 'Yes' : 'No');
    if (user) {
      logger.info('User details:', {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
        hasPassword: !!user.password
      });
    }
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is inactive', 401);
    }

    // Verify password
    logger.info('Attempting password comparison');
    const isValidPassword = await bcrypt.compare(password, user.password);
    logger.info('Password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user);
    logger.info('Login successful, token generated');

    return {
      user: toJSON(user),
      token
    };
  };

  const getProfile = async (userId: string): Promise<UserResponse> => {
    const user = await databaseService.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return toJSON(user);
  };

  const updateProfile = async (userId: string, updates: UserUpdate): Promise<UserResponse> => {
    const user = await databaseService.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent updating sensitive fields
    const allowedUpdates = ['firstName', 'lastName', 'password'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key as keyof UserUpdate];
        return obj;
      }, {} as UserUpdate);

    if (Object.keys(filteredUpdates).length === 0) {
      throw new AppError('No valid updates provided', 400);
    }

    // If password is being updated, hash it
    if (filteredUpdates.password) {
      filteredUpdates.password = await hashPassword(filteredUpdates.password);
    }

    const updatedUser = await databaseService.update(userId, filteredUpdates);
    if (!updatedUser) {
      throw new AppError('Failed to update user', 500);
    }

    return toJSON(updatedUser);
  };

  return {
    generateToken,
    register,
    login,
    getProfile,
    updateProfile
  };
};

export const authService = createAuthService(); 