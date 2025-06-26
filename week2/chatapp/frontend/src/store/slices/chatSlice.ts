import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface Contact {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
  };
  status: 'active' | 'blocked';
}

interface ChatState {
  contacts: Contact[];
  activeContact: Contact | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  contacts: [],
  activeContact: null,
  messages: [],
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    setActiveContact: (state, action: PayloadAction<Contact>) => {
      state.activeContact = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: number; status: Message['status'] }>) => {
      const message = state.messages.find(msg => msg.id === action.payload.messageId);
      if (message) {
        message.status = action.payload.status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateContactStatus: (state, action: PayloadAction<{ contactId: number; status: Contact['status'] }>) => {
      const contact = state.contacts.find(contact => contact.id === action.payload.contactId);
      if (contact) {
        contact.status = action.payload.status;
      }
    },
  },
});

export const {
  setContacts,
  setActiveContact,
  setMessages,
  addMessage,
  updateMessageStatus,
  setLoading,
  setError,
  updateContactStatus,
} = chatSlice.actions;

export default chatSlice.reducer; 