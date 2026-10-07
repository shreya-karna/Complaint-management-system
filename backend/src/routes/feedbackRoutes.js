import express from 'express'

import {
  createFeedback,
  getComplaintFeedback,
  getAllFeedback,
  getStaffFeedback,
} from '../controllers/feedbackController.js'

import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()


// Citizen submits feedback
router.post(
  '/complaints/:complaintId',
  authenticate,
  createFeedback
)


// Citizen/admin/staff can get feedback
// for a specific complaint
router.get(
  '/complaints/:complaintId',
  authenticate,
  getComplaintFeedback
)


// Admin: get all feedback
router.get(
  '/admin',
  authenticate,
  getAllFeedback
)


// Staff: get feedback for their assigned complaints
router.get(
  '/staff',
  authenticate,
  getStaffFeedback
)


export default router
