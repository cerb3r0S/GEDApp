import express from 'express';
import { getUsers, getUserById } from '../controllers/userController.js';
import { protegerRoute } from '../middleware/auth.js';

const router = express.Router();

// Routes utilisateurs protégées
router.get('/', protegerRoute, getUsers);
router.get('/:id', protegerRoute, getUserById);

export default router;
