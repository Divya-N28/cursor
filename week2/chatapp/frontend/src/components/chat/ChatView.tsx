import { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { io, Socket } from 'socket.io-client';
import { authenticatedRequest } from '../../utils/api';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
  messageType: 'text' | 'image' | 'document';
  mediaUrl?: string;
}

interface MessageResponse {
  messages: Message[];
  hasMore: boolean;
}

interface ChatViewProps {
  contactId: number;
  currentUserId: number;
  contactName: string;
  contactEmail?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  contactId,
  currentUserId,
  contactName,
  contactEmail,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token'),
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'Authentication required') {
        // Handle authentication error (e.g., redirect to login)
        window.location.href = '/login';
      }
    });

    newSocket.on('message.received', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message.status', ({ messageId, status }: { messageId: number; status: Message['status'] }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const loadMessages = async (before?: string) => {
    try {
      setIsLoading(true);
      const data = await authenticatedRequest<MessageResponse>(
        `/messages?contactId=${contactId}${before ? `&before=${before}` : ''}`
      );
      setMessages(prev => [...prev, ...data.messages]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading messages:', error);
      if (error instanceof Error && error.message.includes('403')) {
        // Handle forbidden error - maybe redirect or show a message
        console.error('You do not have permission to view these messages');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [contactId]); // Only reload when contactId changes

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'document') => {
    if (!socket) return;

    try {
      const message = await authenticatedRequest<Message>('/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: contactId,
          content,
          messageType: type,
        }),
      });

      setMessages(prev => [...prev, message]);
      socket.emit('message.sent', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { contactId });
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6">
          {contactName}
          {contactEmail && (
            <Typography variant="subtitle2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
              ({contactEmail})
            </Typography>
          )}
        </Typography>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onLoadMore={() => loadMessages(messages[0]?.createdAt)}
          hasMore={hasMore}
          isLoading={isLoading}
        />
      </Box>

      <MessageInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
      />
    </Box>
  );
}; 