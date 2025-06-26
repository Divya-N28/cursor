import Database from 'better-sqlite3';
import db from '../config/database';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  messageType: 'text' | 'image' | 'document';
  mediaUrl?: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

interface DbMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: 'text' | 'image' | 'document';
  media_url: string | null;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  updated_at: string;
}

export interface MessageReaction {
  id: number;
  messageId: number;
  userId: number;
  emoji: string;
  createdAt: Date;
}

interface DbMessageReaction {
  id: number;
  message_id: number;
  user_id: number;
  emoji: string;
  created_at: string;
}

export class MessageModel {
  static async create(messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<Message> {
    const result = db.prepare(
      `INSERT INTO messages (sender_id, receiver_id, content, message_type, media_url, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      messageData.senderId,
      messageData.receiverId,
      messageData.content,
      messageData.messageType,
      messageData.mediaUrl,
      messageData.status
    ) as Database.RunResult;

    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid) as DbMessage;
    return this.mapMessageFromDb(row);
  }

  static async findById(id: number): Promise<Message | null> {
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as DbMessage | undefined;
    return row ? this.mapMessageFromDb(row) : null;
  }

  static async getMessagesBetweenUsers(
    userId1: number,
    userId2: number,
    limit: number = 50,
    before?: Date
  ): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ${before ? 'AND created_at < ?' : ''}
      ORDER BY created_at ASC
      LIMIT ?
    `;

    const rows = before
      ? db.prepare(query).all(userId1, userId2, userId2, userId1, before.toISOString(), limit) as DbMessage[]
      : db.prepare(query).all(userId1, userId2, userId2, userId1, limit) as DbMessage[];

    return rows.map(this.mapMessageFromDb);
  }

  static async updateStatus(id: number, status: Message['status']): Promise<Message | null> {
    const result = db.prepare(
      `UPDATE messages 
       SET status = ?
       WHERE id = ?`
    ).run(status, id) as Database.RunResult;

    if (result.changes === 0) return null;

    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as DbMessage;
    return row ? this.mapMessageFromDb(row) : null;
  }

  static async addReaction(messageId: number, userId: number, emoji: string): Promise<MessageReaction> {
    const result = db.prepare(
      `INSERT INTO message_reactions (message_id, user_id, emoji)
       VALUES (?, ?, ?)
       ON CONFLICT (message_id, user_id) DO UPDATE
       SET emoji = ?
       RETURNING *`
    ).run(messageId, userId, emoji, emoji) as Database.RunResult;

    const row = db.prepare('SELECT * FROM message_reactions WHERE id = ?').get(result.lastInsertRowid) as DbMessageReaction;
    return this.mapReactionFromDb(row);
  }

  static async removeReaction(messageId: number, userId: number): Promise<void> {
    db.prepare('DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?').run(messageId, userId);
  }

  static async getReactions(messageId: number): Promise<MessageReaction[]> {
    const rows = db.prepare('SELECT * FROM message_reactions WHERE message_id = ?').all(messageId) as DbMessageReaction[];
    return rows.map(this.mapReactionFromDb);
  }

  private static mapMessageFromDb(row: DbMessage): Message {
    return {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      messageType: row.message_type,
      mediaUrl: row.media_url || undefined,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private static mapReactionFromDb(row: DbMessageReaction): MessageReaction {
    return {
      id: row.id,
      messageId: row.message_id,
      userId: row.user_id,
      emoji: row.emoji,
      createdAt: new Date(row.created_at),
    };
  }
} 