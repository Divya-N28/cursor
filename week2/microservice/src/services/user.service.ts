import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { validateUser, createUser, hashPassword, toJSON } from '../models/user.model';
import { databaseService } from './database.service';
import { UserService, UserInput, UserResponse, PaginationParams, UserUpdate } from '../types';

const createUserService = (): UserService => {
  const createUser = async (userData: UserInput): Promise<UserResponse> => {
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
    return toJSON(savedUser);
  };

  const getUserById = async (id: string): Promise<UserResponse> => {
    const user = await databaseService.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return toJSON(user);
  };

  const getAllUsers = async (query?: PaginationParams): Promise<PaginatedResponse<UserResponse>> => {
    const result = await databaseService.findAll(query);
    return {
      users: result.users.map(toJSON),
      pagination: result.pagination
    };
  };

  const updateUser = async (id: string, updates: UserUpdate): Promise<UserResponse> => {
    const user = await databaseService.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent updating sensitive fields
    const allowedUpdates = ['firstName', 'lastName', 'email', 'username', 'role', 'isActive'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key as keyof UserUpdate];
        return obj;
      }, {} as UserUpdate);

    if (Object.keys(filteredUpdates).length === 0) {
      throw new AppError('No valid updates provided', 400);
    }

    // Check for unique constraints
    if (filteredUpdates.email && filteredUpdates.email !== user.email) {
      const existingUser = await databaseService.findByEmail(filteredUpdates.email);
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
    }

    if (filteredUpdates.username && filteredUpdates.username !== user.username) {
      const existingUser = await databaseService.findByUsername(filteredUpdates.username);
      if (existingUser) {
        throw new AppError('Username already in use', 400);
      }
    }

    const updatedUser = await databaseService.update(id, filteredUpdates);
    if (!updatedUser) {
      throw new AppError('Failed to update user', 500);
    }

    return toJSON(updatedUser);
  };

  const deleteUser = async (id: string): Promise<{ message: string }> => {
    const user = await databaseService.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await databaseService.delete(id);
    return { message: 'User deleted successfully' };
  };

  const searchUsers = async (query: string): Promise<PaginatedResponse<UserResponse>> => {
    const result = await databaseService.findAll({ search: query });
    return {
      users: result.users.map(toJSON),
      pagination: result.pagination
    };
  };

  return {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    searchUsers
  };
};

export const userService = createUserService(); 