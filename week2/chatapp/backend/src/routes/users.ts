import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middleware/auth';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  profilePicture: z.string().url().optional(),
  status: z.enum(['online', 'offline', 'away']).optional(),
});

// Get all users (for adding contacts)
router.get('/', protect, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const users = await UserModel.findAll();
    
    // Filter out the current user and return only necessary fields
    const filteredUsers = users
      .filter(user => user.id !== req.user?.id)
      .map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        status: user.status,
        lastSeen: user.lastSeen,
      }));

    res.json(filteredUsers);
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', protect, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      status: user.status,
      lastSeen: user.lastSeen,
    });
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put('/me', protect, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const updates = updateProfileSchema.parse(req.body);
    const updatedUser = await UserModel.updateProfile(req.user.id, updates);

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profilePicture: updatedUser.profilePicture,
      status: updatedUser.status,
      lastSeen: updatedUser.lastSeen,
    });
  } catch (error) {
    next(error);
  }
});

export const userRoutes = router; 