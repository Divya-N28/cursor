const userService = require('../services/user.service');
const databaseService = require('../services/database.service');
const { AppError } = require('../middleware/errorHandler');

// Mock database service
jest.mock('../services/database.service');

describe('UserService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const mockUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };

    it('should create a new user successfully', async () => {
      databaseService.findByEmail.mockResolvedValue(null);
      databaseService.findByUsername.mockResolvedValue(null);
      databaseService.create.mockResolvedValue({
        ...mockUserData,
        id: '123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await userService.createUser(mockUserData);
      expect(result).toHaveProperty('id');
      expect(result.username).toBe(mockUserData.username);
      expect(result.email).toBe(mockUserData.email);
    });

    it('should throw error if user already exists', async () => {
      databaseService.findByEmail.mockResolvedValue({ id: '123', ...mockUserData });

      await expect(userService.createUser(mockUserData))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      };
      databaseService.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('123');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      databaseService.findById.mockResolvedValue(null);

      await expect(userService.getUserById('123'))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('updateUser', () => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should update user successfully', async () => {
      databaseService.findById.mockResolvedValue(mockUser);
      databaseService.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Updated'
      });

      const result = await userService.updateUser('123', { firstName: 'Updated' });
      expect(result.firstName).toBe('Updated');
    });

    it('should throw error if user not found', async () => {
      databaseService.findById.mockResolvedValue(null);

      await expect(userService.updateUser('123', { firstName: 'Updated' }))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      databaseService.findById.mockResolvedValue({ id: '123' });
      databaseService.delete.mockResolvedValue(true);

      const result = await userService.deleteUser('123');
      expect(result).toHaveProperty('message');
    });

    it('should throw error if user not found', async () => {
      databaseService.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('123'))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('searchUsers', () => {
    it('should return search results', async () => {
      const mockUsers = [
        { id: '1', username: 'user1' },
        { id: '2', username: 'user2' }
      ];
      databaseService.findAll.mockResolvedValue({
        users: mockUsers,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          pages: 1
        }
      });

      const result = await userService.searchUsers('user');
      expect(result.users).toHaveLength(2);
      expect(result.pagination).toBeDefined();
    });
  });
}); 