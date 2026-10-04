import express from 'express'

import {
  getNotifications,
  markNotificationAsRead,
} from '../controllers/notificationController.js'

import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get notifications for logged-in user
router.get(
  '/',
  authenticate,
  getNotifications
)

// Mark one notification as read
router.patch(
  '/:id/read',
  authenticate,
  markNotificationAsRead
)

export default router