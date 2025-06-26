import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { User, UserInput, UserResponse } from '../types';

export const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('user', 'admin').default('user'),
  isActive: Joi.boolean().default(true)
});

export const validateUser = (data: UserInput): Joi.ValidationResult => {
  return userSchema.validate(data);
};

export const createUser = (data: UserInput & { id: string }): User => {
  return {
    ...data,
    role: data.role || 'user',
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const toJSON = (user: User): UserResponse => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}; 