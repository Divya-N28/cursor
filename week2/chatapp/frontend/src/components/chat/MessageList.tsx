import { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { MessageBubble } from './MessageBubble';
import { format } from 'date-fns';

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

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onLoadMore,
  hasMore,
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (loadingRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            onLoadMore();
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {hasMore && (
        <Box
          ref={loadingRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 2,
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Box sx={{ height: 24 }} />
          )}
        </Box>
      )}

      {Object.entries(messageGroups).map(([date, messages]) => (
        <Box key={date} sx={{ mb: 2 }}>
          <Box
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '0.875rem',
              mb: 2,
            }}
          >
            {format(new Date(date), 'MMMM d, yyyy')}
          </Box>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))}
        </Box>
      ))}

      <div ref={messagesEndRef} />
    </Box>
  );
}; 