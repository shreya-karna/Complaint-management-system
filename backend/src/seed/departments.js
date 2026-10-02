import dotenv from 'dotenv'
import mongoose from 'mongoose'

import Department from '../models/Department.js'

dotenv.config()

const departments = [
  {
    name: 'Public Works',
    description:
      'Roads, drainage, public infrastructure, and street-related issues.',
  },
  {
    name: 'Water Services',
    description:
      'Water supply, pipelines, water quality, and pressure issues.',
  },
  {
    name: 'Sanitation',
    description:
      'Garbage collection, waste disposal, cleanliness, and sewerage.',
  },
  {
    name: 'Electricity',
    description:
      'Power outages, street electricity, electrical hazards, and meters.',
  },
  {
    name: 'Health Services',
    description:
      'Public hospitals, medicines, health facilities, and public health.',
  },
  {
    name: 'Other',
    description:
      'Public service issues that do not belong to another department.',
  },
]

const seedDepartments = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    )

    console.log(
      'MongoDB connected successfully.'
    )

    for (const department of departments) {
      const existingDepartment =
        await Department.findOne({
          name: department.name,
        })

      if (existingDepartment) {
        console.log(
          `${department.name} already exists.`
        )
        continue
      }

      await Department.create(department)

      console.log(
        `${department.name} created.`
      )
    }

    console.log(
      'Department seeding completed.'
    )

    await mongoose.disconnect()

    process.exit(0)
  } catch (error) {
    console.error(
      'Department seeding failed:',
      error.message
    )

    await mongoose.disconnect()

    process.exit(1)
  }
}

seedDepartments()