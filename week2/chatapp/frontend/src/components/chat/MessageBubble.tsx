import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

interface Message {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
  messageType: 'text' | 'image' | 'document';
  mediaUrl?: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showStatus?: boolean;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  maxWidth: '70%',
  wordBreak: 'break-word',
}));

const StatusIndicator = styled(Box)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showStatus = true,
}) => {
  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'read':
        return 'primary.main';
      case 'delivered':
        return 'text.secondary';
      default:
        return 'text.disabled';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <StyledPaper
        elevation={1}
        sx={{
          backgroundColor: isOwn ? 'primary.main' : 'background.paper',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
        }}
      >
        {message.messageType === 'text' ? (
          <Typography variant="body1">{message.content}</Typography>
        ) : message.messageType === 'image' ? (
          <Box
            component="img"
            src={message.mediaUrl}
            alt="Message attachment"
            sx={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: 1,
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">📎 Document</Typography>
            <Typography variant="caption">
              {message.mediaUrl?.split('/').pop()}
            </Typography>
          </Box>
        )}
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {format(new Date(message.createdAt), 'HH:mm')}
          </Typography>
          
          {isOwn && showStatus && (
            <StatusIndicator sx={{ color: getStatusColor(message.status) }}>
              {message.status === 'read' ? '✓✓' : '✓'}
            </StatusIndicator>
          )}
        </Box>
      </StyledPaper>
    </Box>
  );
}; 