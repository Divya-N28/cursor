import express from 'express';
import { verifyToken, restrictTo } from '../middleware/auth.middleware';
import userController from '../controllers/user.controller';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Admin only routes
router.post('/', restrictTo('admin'), userController.createUser);
router.get('/', restrictTo('admin'), userController.getAllUsers);

// Mixed access routes
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', restrictTo('admin'), userController.deleteUser);

export default router; 