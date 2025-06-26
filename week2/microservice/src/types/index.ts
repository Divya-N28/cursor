import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface UserResponse extends Omit<User, 'password'> {}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  search?: string;
}

export interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CustomRequest extends Request {
  user?: User;
}

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: 'user' | 'admin';
}

export interface DatabaseService {
  initialize(): Promise<void>;
  createDatabase(): Promise<void>;
  loadDatabase(): Promise<void>;
  saveDatabase(): Promise<void>;
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(query?: PaginationParams): Promise<PaginatedResponse<User>>;
  update(id: string, updates: UserUpdate): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export interface AuthService {
  generateToken(user: User): string;
  register(userData: UserInput): Promise<AuthResponse>;
  login(email: string, password: string): Promise<AuthResponse>;
  getProfile(userId: string): Promise<UserResponse>;
  updateProfile(userId: string, updates: UserUpdate): Promise<UserResponse>;
}

export interface UserService {
  createUser(userData: UserInput): Promise<UserResponse>;
  getUserById(id: string): Promise<UserResponse>;
  getAllUsers(query?: PaginationParams): Promise<PaginatedResponse<UserResponse>>;
  updateUser(id: string, updates: UserUpdate): Promise<UserResponse>;
  deleteUser(id: string): Promise<{ message: string }>;
  searchUsers(query: string): Promise<PaginatedResponse<UserResponse>>;
} 