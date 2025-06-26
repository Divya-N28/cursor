const authService = require('../services/auth.service');
const databaseService = require('../services/database.service');
const { AppError } = require('../middleware/errorHandler');

// Mock database service
jest.mock('../services/database.service');

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should register a new user successfully', async () => {
      databaseService.findByEmail.mockResolvedValue(null);
      databaseService.findByUsername.mockResolvedValue(null);
      databaseService.create.mockResolvedValue({
        ...mockUserData,
        id: '123',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await authService.register(mockUserData);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.username).toBe(mockUserData.username);
    });

    it('should throw error if user already exists', async () => {
      databaseService.findByEmail.mockResolvedValue({ id: '123', ...mockUserData });

      await expect(authService.register(mockUserData))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('login', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      isActive: true,
      comparePassword: jest.fn()
    };

    it('should login user successfully', async () => {
      databaseService.findByEmail.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password123');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });

    it('should throw error if user not found', async () => {
      databaseService.findByEmail.mockResolvedValue(null);

      await expect(authService.login('test@example.com', 'password123'))
        .rejects
        .toThrow(AppError);
    });

    it('should throw error if password is incorrect', async () => {
      databaseService.findByEmail.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow(AppError);
    });

    it('should throw error if account is inactive', async () => {
      databaseService.findByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false
      });

      await expect(authService.login('test@example.com', 'password123'))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        toJSON: jest.fn().mockReturnThis()
      };
      databaseService.findById.mockResolvedValue(mockUser);

      const result = await authService.getProfile('123');
      expect(result).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      databaseService.findById.mockResolvedValue(null);

      await expect(authService.getProfile('123'))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('updateProfile', () => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      toJSON: jest.fn().mockReturnThis()
    };

    it('should update profile successfully', async () => {
      databaseService.findById.mockResolvedValue(mockUser);
      databaseService.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Updated'
      });

      const result = await authService.updateProfile('123', { firstName: 'Updated' });
      expect(result).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      databaseService.findById.mockResolvedValue(null);

      await expect(authService.updateProfile('123', { firstName: 'Updated' }))
        .rejects
        .toThrow(AppError);
    });
  });
}); 