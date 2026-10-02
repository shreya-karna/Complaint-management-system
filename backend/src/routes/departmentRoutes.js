import express from 'express'

import {
  getDepartments,
  createDepartment,
  updateDepartment,
} from '../controllers/departmentController.js'

const router = express.Router()

router.get(
  '/',
  getDepartments
)

router.post(
  '/',
  createDepartment
)

router.patch(
  '/:id',
  updateDepartment
)

export default router