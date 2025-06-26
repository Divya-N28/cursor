import db from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = db.prepare(
      `INSERT INTO users (email, password, first_name, last_name, profile_picture, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      userData.email,
      hashedPassword,
      userData.firstName,
      userData.lastName,
      userData.profilePicture,
      userData.status
    );

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    return this.mapUserFromDb(row);
  }

  static async findById(id: number): Promise<User | null> {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? this.mapUserFromDb(row) : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    return row ? this.mapUserFromDb(row) : null;
  }

  static async findAll(): Promise<User[]> {
    const rows = db.prepare('SELECT * FROM users').all();
    return rows.map(this.mapUserFromDb);
  }

  static async updateStatus(id: number, status: User['status']): Promise<User | null> {
    const result = db.prepare(
      `UPDATE users 
       SET status = ?, last_seen = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(status, id);

    if (result.changes === 0) return null;

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? this.mapUserFromDb(row) : null;
  }

  static async updateProfile(id: number, updates: Partial<Omit<User, 'id' | 'email' | 'password' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const db = await dbPromise;
    const updateFields = [];
    const values = [];

    if (updates.firstName !== undefined) {
      updateFields.push('first_name = ?');
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      updateFields.push('last_name = ?');
      values.push(updates.lastName);
    }
    if (updates.profilePicture !== undefined) {
      updateFields.push('profile_picture = ?');
      values.push(updates.profilePicture);
    }
    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      values.push(updates.status);
    }

    if (updateFields.length === 0) {
      return this.findById(id) as Promise<User>;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE users 
       SET ${updateFields.join(', ')}
       WHERE id = ?`,
      values
    );

    const row = await db.get('SELECT * FROM users WHERE id = ?', id);
    return this.mapUserFromDb(row);
  }

  private static mapUserFromDb(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      profilePicture: row.profile_picture,
      status: row.status,
      lastSeen: row.last_seen ? new Date(row.last_seen) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
} 