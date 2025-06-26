import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middleware/auth';
import { ContactModel } from '../models/Contact';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const addContactSchema = z.object({
  email: z.string().email(),
});

const updateContactStatusSchema = z.object({
  status: z.enum(['active', 'blocked']),
});

// Get contacts
router.get('/', protect, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const contacts = await ContactModel.getContacts(req.user.id);
    
    // Get user details for each contact
    const contactsWithUsers = await Promise.all(
      contacts.map(async (contact) => {
        const user = await UserModel.findById(contact.contactUserId);
        if (!user) return null;
        
        return {
          id: contact.id,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            status: user.status,
            lastSeen: user.lastSeen,
          },
          status: contact.status,
          createdAt: contact.createdAt,
        };
      })
    );

    res.json(contactsWithUsers.filter(Boolean));
  } catch (error) {
    next(error);
  }
});

// Add contact
router.post('/', protect, async (req, res, next) => {
  try {
    const { email } = addContactSchema.parse(req.body);

    if (!req.user) {
      throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    // Find user by email
    const contactUser = await UserModel.findByEmail(email);
    if (!contactUser) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    // Check if contact already exists
    const existingContact = await ContactModel.findContact(req.user.id, contactUser.id);
    if (existingContact) {
      throw new AppError(400, 'Contact already exists', 'DUPLICATE_CONTACT');
    }

    // Create contact
    const contact = await ContactModel.create(req.user.id, contactUser.id);

    res.status(201).json({
      id: contact.id,
      user: {
        id: contactUser.id,
        firstName: contactUser.firstName,
        lastName: contactUser.lastName,
        profilePicture: contactUser.profilePicture,
        status: contactUser.status,
        lastSeen: contactUser.lastSeen,
      },
      status: contact.status,
      createdAt: contact.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// Update contact status
router.put('/:contactId', protect, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { status } = updateContactStatusSchema.parse(req.body);

    const contact = await ContactModel.updateStatus(
      req.user?.id || 0,
      parseInt(contactId),
      status
    );

    if (!contact) {
      throw new AppError(404, 'Contact not found', 'NOT_FOUND');
    }

    res.json({
      id: contact.id,
      status: contact.status,
      updatedAt: contact.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

export const contactRoutes = router; 