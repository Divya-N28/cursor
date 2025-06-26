import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middleware/auth';
import { MessageModel } from '../models/Message';
import { ContactModel } from '../models/Contact';
import { AppError } from '../middleware/errorHandler';
import { Server } from 'socket.io';

const router = Router();

// Validation schemas
const sendMessageSchema = z.object({
  receiverId: z.number(),
  content: z.string().min(1),
  messageType: z.enum(['text', 'image', 'document']).default('text'),
  mediaUrl: z.string().url().optional(),
});

const updateMessageStatusSchema = z.object({
  status: z.enum(['delivered', 'read']),
});

// Send message
router.post('/', protect, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const { receiverId, content, messageType, mediaUrl } = sendMessageSchema.parse(req.body);

    // Ensure sender has receiver in contacts. If not, create it.
    let senderToReceiverContact = await ContactModel.findContact(req.user.id, receiverId);
    if (!senderToReceiverContact) {
      senderToReceiverContact = await ContactModel.create(req.user.id, receiverId);
    }

    // Ensure receiver has sender in contacts. If not, create it.
    let receiverToSenderContact = await ContactModel.findContact(receiverId, req.user.id);
    if (!receiverToSenderContact) {
      receiverToSenderContact = await ContactModel.create(receiverId, req.user.id);
    }

    const message = await MessageModel.create({
      senderId: req.user.id,
      receiverId,
      content,
      messageType,
      mediaUrl,
      status: 'sent'
    });

    // Emit socket event for real-time message delivery
    const io: Server = req.app.get('io');
    io.to(receiverId.toString()).emit('message.received', message);

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// Get messages
router.get('/', protect, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const { contactId, limit = '50', before } = req.query;

    if (!contactId) {
      throw new AppError(400, 'Contact ID is required', 'BAD_REQUEST');
    }

    const contactIdNum = parseInt(contactId as string);
    if (isNaN(contactIdNum)) {
      throw new AppError(400, 'Invalid contact ID', 'BAD_REQUEST');
    }

    // Ensure contact exists and is active. If not, create it.
    let contact = await ContactModel.findContact(req.user.id, contactIdNum);
    if (!contact) {
      contact = await ContactModel.create(req.user.id, contactIdNum);
    } else if (contact.status !== 'active') {
      // If contact exists but is not active, set it to active
      contact = await ContactModel.updateStatus(req.user.id, contactIdNum, 'active');
    }
    
    // Also ensure the other user has the current user as a contact
    let otherUserContact = await ContactModel.findContact(contactIdNum, req.user.id);
    if (!otherUserContact) {
      await ContactModel.create(contactIdNum, req.user.id);
    } else if (otherUserContact.status !== 'active') {
      await ContactModel.updateStatus(contactIdNum, req.user.id, 'active');
    }

    const messages = await MessageModel.getMessagesBetweenUsers(
      req.user.id,
      contactIdNum,
      Number(limit),
      before ? new Date(before as string) : undefined
    );

    res.json({
      messages: messages,
      hasMore: messages.length === Number(limit),
    });
  } catch (error) {
    next(error);
  }
});

// Update message status
router.put('/:messageId/status', protect, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const { messageId } = req.params;
    const { status } = updateMessageStatusSchema.parse(req.body);

    const message = await MessageModel.updateStatus(
      parseInt(messageId),
      status
    );

    if (!message) {
      throw new AppError(404, 'Message not found', 'NOT_FOUND');
    }

    // Emit socket event for real-time status update
    const io: Server = req.app.get('io');
    io.to(message.senderId.toString()).emit('message.status', {
      messageId: message.id,
      status: message.status,
      updatedAt: message.updatedAt,
    });

    res.json({
      id: message.id,
      status: message.status,
      updatedAt: message.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

export const messageRoutes = router; 