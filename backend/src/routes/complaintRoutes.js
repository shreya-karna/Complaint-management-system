import express from 'express'
import multer from 'multer'
import fs from 'fs'

import {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaint,
} from '../controllers/complaintController.js'

import { authenticate } from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

const uploadDirectory =
  process.cwd() + '/uploads'

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory)
  },

  filename: (req, file, cb) => {
    const filename =
      Date.now() + '-' + file.originalname

    cb(null, filename)
  },
})

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const mimetype = file.mimetype

    if (
      mimetype === 'image/jpeg' ||
      mimetype === 'image/png' ||
      mimetype === 'image/webp' ||
      mimetype === 'image/gif' ||
      mimetype === 'application/pdf'
    ) {
      cb(null, true)
      return
    }

    cb(
      new Error(
        'Only JPG, PNG, WEBP, GIF and PDF files are allowed.'
      )
    )
  },
})

// Citizen - submit complaint
router.post(
  '/',
  authenticate,
  authorizeRoles('CITIZEN'),
  upload.array('attachments', 5),
  createComplaint
)

// Logged-in users - view complaints
router.get(
  '/',
  authenticate,
  getComplaints
)

// Logged-in users - view one complaint
router.get(
  '/:id',
  authenticate,
  getComplaintById
)

// Admin - assign complaint to staff
router.patch(
  '/:id/assign',
  authenticate,
  authorizeRoles('ADMIN'),
  assignComplaint
)

// Staff/Admin - update complaint
router.patch(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN', 'STAFF'),
  updateComplaint
)

export default router