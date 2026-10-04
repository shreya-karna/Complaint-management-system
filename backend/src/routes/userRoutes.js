import express from 'express'

import {
  getUsers,
  createUser,
  updateUser,
  loginUser,
  getStaffByDepartment,
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/userController.js'

import { authenticate } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Public routes
router.post('/', createUser)
router.post('/login', loginUser)
router.get('/verify-email/:token', verifyEmail)
router.post('/resend-verification', resendVerificationEmail)

// Admin-only routes
router.get(
  '/',
  authenticate,
  authorizeRoles('ADMIN'),
  getUsers
)

router.get(
  '/department/:departmentId/staff',
  authenticate,
  authorizeRoles('ADMIN'),
  getStaffByDepartment
)

router.patch(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  updateUser
)

export default router