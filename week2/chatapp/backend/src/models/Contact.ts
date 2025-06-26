import mongoose, { Document, Schema } from 'mongoose';
import db from '../config/database';

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  contactUserId: mongoose.Types.ObjectId;
  status: 'active' | 'blocked';
}

const contactSchema = new Schema<IContact>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can't add the same contact twice
contactSchema.index({ userId: 1, contactUserId: 1 }, { unique: true });

export const Contact = mongoose.model<IContact>('Contact', contactSchema);

export interface Contact {
  id: number;
  userId: number;
  contactUserId: number;
  status: 'active' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export class ContactModel {
  static async create(userId: number, contactUserId: number): Promise<Contact> {
    try {
      const result = db.prepare(
        `INSERT INTO contacts (user_id, contact_user_id, status)
         VALUES (?, ?, 'active')`
      ).run(userId, contactUserId);

      const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
      if (!row) {
        throw new Error('Failed to create contact');
      }
      return this.mapContactFromDb(row);
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Contact already exists');
      }
      throw error;
    }
  }

  static async getContacts(userId: number): Promise<Contact[]> {
    try {
      const rows = db.prepare(
        `SELECT * FROM contacts 
         WHERE user_id = ? AND status = 'active'
         ORDER BY created_at DESC`
      ).all(userId);

      return rows.map(this.mapContactFromDb);
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  static async updateStatus(userId: number, contactId: number, status: Contact['status']): Promise<Contact | null> {
    try {
      const result = db.prepare(
        `UPDATE contacts 
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND contact_user_id = ?`
      ).run(status, userId, contactId);

      if (result.changes === 0) return null;

      const row = db.prepare(
        'SELECT * FROM contacts WHERE user_id = ? AND contact_user_id = ?'
      ).get(userId, contactId);

      return row ? this.mapContactFromDb(row) : null;
    } catch (error) {
      console.error('Error updating contact status:', error);
      return null;
    }
  }

  static async delete(userId: number, contactUserId: number): Promise<void> {
    try {
      db.prepare(
        'DELETE FROM contacts WHERE user_id = ? AND contact_user_id = ?'
      ).run(userId, contactUserId);
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  static async findContact(userId: number, contactUserId: number): Promise<Contact | null> {
    try {
      const row = db.prepare(
        'SELECT * FROM contacts WHERE user_id = ? AND contact_user_id = ?'
      ).get(userId, contactUserId);

      return row ? this.mapContactFromDb(row) : null;
    } catch (error) {
      console.error('Error finding contact:', error);
      return null;
    }
  }

  private static mapContactFromDb(row: any): Contact {
    return {
      id: row.id,
      userId: row.user_id,
      contactUserId: row.contact_user_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
} 