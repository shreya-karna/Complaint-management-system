import express from 'express'

import {
  getUsers,
  createUser,
  updateUser,
  loginUser,
} from '../controllers/userController.js'

import { authenticate } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Public routes
router.post('/', createUser)
router.post('/login', loginUser)

// Admin-only routes
router.get(
  '/',
  authenticate,
  authorizeRoles('ADMIN'),
  getUsers
)

router.patch(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  updateUser
)

export default router