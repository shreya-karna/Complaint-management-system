import express from 'express'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

import {
  getUsers,
  createUser,
  updateUser,
  loginUser,
} from '../controllers/userController.js'

import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/', createUser)
router.post('/login', loginUser)

// Protected routes
// Protected routes
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