import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { UserModel } from './models/User';
import { ContactModel, Contact } from './models/Contact';
import { AppError } from './middleware/errorHandler';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

interface JwtPayload {
  id: number;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-super-secret-jwt-key'
      ) as JwtPayload;

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new Error('Invalid token'));
      } else {
        next(error as Error);
      }
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.userId) {
      socket.disconnect();
      return;
    }

    // Join user's room for private messages
    socket.join(socket.userId.toString());

    // Update user's online status
    UserModel.updateStatus(socket.userId, 'online');

    // Handle typing indicator
    socket.on('typing', (data: { contactId: number }) => {
      io.to(data.contactId.toString()).emit('typing', {
        userId: socket.userId,
        isTyping: true,
      });
    });

    // Handle user status changes
    socket.on('status', async (data: { status: 'online' | 'offline' | 'away' }) => {
      try {
        await UserModel.updateStatus(socket.userId!, data.status);

        // Notify all contacts about status change
        const contacts = await ContactModel.getContacts(socket.userId!);
        
        contacts.forEach((contact: Contact) => {
          io.to(contact.contactUserId.toString()).emit('user.status', {
            userId: socket.userId,
            status: data.status,
            lastSeen: new Date(),
          });
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      if (socket.userId) {
        try {
          await UserModel.updateStatus(socket.userId, 'offline');

          // Notify all contacts about user going offline
          const contacts = await ContactModel.getContacts(socket.userId);
          
          contacts.forEach((contact: Contact) => {
            io.to(contact.contactUserId.toString()).emit('user.status', {
              userId: socket.userId,
              status: 'offline',
              lastSeen: new Date(),
            });
          });
        } catch (error) {
          console.error('Error handling user disconnect:', error);
        }
      }
    });
  });
}; 