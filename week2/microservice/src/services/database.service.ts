import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import { DatabaseService, User, PaginationParams, PaginatedResponse, UserUpdate } from '../types';

const createDatabaseService = (): DatabaseService => {
  const dbPath = process.env.DB_FILE_PATH || path.join(__dirname, '../../database/users.json');
  let users = new Map<string, User>();

  const initialize = async (): Promise<void> => {
    try {
      await loadDatabase();
    } catch (error) {
      logger.error('Database initialization error:', error);
      await createDatabase();
    }
  };

  const createDatabase = async (): Promise<void> => {
    try {
      await fs.mkdir(path.dirname(dbPath), { recursive: true });
      await fs.writeFile(dbPath, JSON.stringify({ users: [] }));
      logger.info('Database created successfully');
    } catch (error) {
      logger.error('Error creating database:', error);
      throw error;
    }
  };

  const loadDatabase = async (): Promise<void> => {
    try {
      const data = await fs.readFile(dbPath, 'utf8');
      const { users: loadedUsers } = JSON.parse(data);
      users = new Map(loadedUsers.map((user: User) => [user.id, user]));
      logger.info('Database loaded successfully');
    } catch (error) {
      logger.error('Error loading database:', error);
      throw error;
    }
  };

  const saveDatabase = async (): Promise<void> => {
    try {
      const data = JSON.stringify({ users: Array.from(users.values()) }, null, 2);
      await fs.writeFile(dbPath, data);
      logger.info('Database saved successfully');
    } catch (error) {
      logger.error('Error saving database:', error);
      throw error;
    }
  };

  const create = async (user: User): Promise<User> => {
    users.set(user.id, user);
    await saveDatabase();
    return user;
  };

  const findById = async (id: string): Promise<User | null> => {
    return users.get(id) || null;
  };

  const findByEmail = async (email: string): Promise<User | null> => {
    return Array.from(users.values()).find(user => user.email === email) || null;
  };

  const findByUsername = async (username: string): Promise<User | null> => {
    return Array.from(users.values()).find(user => user.username === username) || null;
  };

  const findAll = async (query: PaginationParams = {}): Promise<PaginatedResponse<User>> => {
    let filteredUsers = Array.from(users.values());

    // Apply filters
    if (query.role) {
      filteredUsers = filteredUsers.filter(user => user.role === query.role);
    }
    if (query.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isActive === query.isActive);
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (query.sort) {
      const [field, order] = query.sort.split(':');
      filteredUsers.sort((a, b) => {
        const aValue = a[field as keyof User];
        const bValue = b[field as keyof User];
        return order === 'desc' 
          ? String(bValue).localeCompare(String(aValue))
          : String(aValue).localeCompare(String(bValue));
      });
    }

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      pagination: {
        total: filteredUsers.length,
        page,
        limit,
        pages: Math.ceil(filteredUsers.length / limit)
      }
    };
  };

  const update = async (id: string, updates: UserUpdate): Promise<User | null> => {
    const user = users.get(id);
    if (!user) return null;

    const updatedUser = { 
      ...user, 
      ...updates, 
      updatedAt: new Date() 
    };
    users.set(id, updatedUser);
    await saveDatabase();
    return updatedUser;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    const deleted = users.delete(id);
    if (deleted) {
      await saveDatabase();
    }
    return deleted;
  };

  return {
    initialize,
    createDatabase,
    loadDatabase,
    saveDatabase,
    create,
    findById,
    findByEmail,
    findByUsername,
    findAll,
    update,
    delete: deleteUser
  };
};

export const databaseService = createDatabaseService(); 