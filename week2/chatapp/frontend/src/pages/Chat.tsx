import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  ListItemButton,
  Alert,
  Snackbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ChatView } from '../components/chat/ChatView';
import { logout } from '../store/slices/authSlice';
import { setContacts, setActiveContact } from '../store/slices/chatSlice';
import { RootState } from '../store';
import { authenticatedRequest } from '../utils/api';

interface Contact {
  id: number;
  status: 'active' | 'blocked';
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    status: 'online' | 'offline' | 'away';
    profilePicture?: string;
    lastSeen?: string;
  };
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

const DRAWER_WIDTH = 320;

export const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { contacts, activeContact } = useSelector((state: RootState) => state.chat) as { contacts: Contact[], activeContact: Contact | null };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await authenticatedRequest<Contact[]>('/contacts');
        const data = response as Contact[];
        dispatch(setContacts(data));
        
        // Set first contact as active if none is selected
        if (data.length > 0 && !activeContact) {
          dispatch(setActiveContact(data[0]));
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError('Failed to load contacts');
        dispatch(setContacts([]));
      }
    };

    if (user?.id) {
      fetchContacts();
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authenticatedRequest<User[]>('/users');
        const data = response as User[];
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
      }
    };

    if (addContactOpen) {
      fetchUsers();
    }
  }, [addContactOpen, contacts, user?.id]);

  useEffect(() => {
    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  // Add this console log for debugging
  console.log('users:', users, 'filteredUsers:', filteredUsers);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleContactSelect = (contact: Contact) => {
    dispatch(setActiveContact(contact));
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleAddContact = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Check if contact already exists before making the request
      const contactExists = contacts.some(c => c.user.id === userId);
      if (contactExists) {
        setError('This user is already in your contacts');
        return;
      }

      const response = await authenticatedRequest<Contact>('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
        }),
      });
      const contact = response as Contact;

      dispatch(setContacts([...contacts, contact]));
      setAddContactOpen(false);
      setSearchQuery('');
    } catch (error) {
      if (error instanceof Error) {
        const errorData = JSON.parse(error.message);
        if (errorData?.error?.code === 'DUPLICATE_CONTACT') {
          setError('This user is already in your contacts');
        } else {
          setError(errorData?.error?.message || 'Failed to add contact');
        }
      } else {
        setError('Failed to add contact');
      }
      console.error('Error adding contact:', error);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Contacts
        </Typography>
        <IconButton color="inherit" onClick={() => setAddContactOpen(true)}>
          <PersonAddIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {contacts.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No contacts yet"
              secondary="Add contacts to start chatting"
              sx={{ textAlign: 'center', color: 'text.secondary' }}
            />
          </ListItem>
        ) : (
          contacts.map((contact: Contact) => (
            <ListItem
              key={contact.id}
              button
              selected={activeContact?.id === contact.id}
              onClick={() => handleContactSelect(contact)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar src={contact.user.profilePicture}>
                  {contact.user.firstName[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${contact.user.firstName} ${contact.user.lastName}`}
                secondary={contact.user.status}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {activeContact ? (
              <>
                {`${activeContact.user.firstName} ${activeContact.user.lastName}`}
                {activeContact.user.email && (
                  <Typography variant="subtitle2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                    ({activeContact.user.email})
                  </Typography>
                )}
              </>
            ) : (
              'Chat'
            )}
          </Typography>
          {user?.email && (
            <Typography variant="subtitle1" noWrap component="div" sx={{ mr: 2 }}>
              {user.email}
            </Typography>
          )}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
        }}
      >
        {activeContact ? (
          <ChatView
            contactId={activeContact.user.id}
            currentUserId={user?.id || 0}
            contactName={`${activeContact.user.firstName} ${activeContact.user.lastName}`}
            contactEmail={activeContact.user.email}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a contact to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog open={addContactOpen} onClose={() => setAddContactOpen(false)}>
        <DialogTitle>Add Contact</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search users"
            type="text"
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List>
            {filteredUsers.length === 0 ? (
              <ListItem>
                <ListItemText primary="No users found" />
              </ListItem>
            ) : (
              filteredUsers.map((user) => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Avatar src={user.profilePicture || undefined}>
                      {user.firstName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={user.email}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddContact(user.id)}
                  >
                    Add
                  </Button>
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 