import { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface MessageInputProps {
  onSend: (content: string, type: 'text' | 'image' | 'document') => void;
  onTyping: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message, 'text');
      setMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onSend(result, file.type.startsWith('image/') ? 'image' : 'document');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ position: 'relative', p: 2 }}>
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          p: 1,
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={disabled}
                >
                  <EmojiIcon />
                </IconButton>
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  <AttachFileIcon />
                </IconButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </InputAdornment>
            ),
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          sx={{ ml: 1 }}
        >
          <SendIcon />
        </IconButton>
      </Paper>

      {showEmojiPicker && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            mb: 1,
            zIndex: 1000,
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </Box>
      )}
    </Box>
  );
}; 