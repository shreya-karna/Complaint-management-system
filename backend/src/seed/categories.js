import dotenv from 'dotenv'
import mongoose from 'mongoose'

import Department from '../models/Department.js'
import Category from '../models/Category.js'

dotenv.config()

const categories = {
  'Public Works': [
    {
      name: 'Road Damage',
      description: 'Damaged roads, potholes, and road surface problems.',
    },
    {
      name: 'Street Light',
      description: 'Broken, damaged, or non-functioning street lights.',
    },
    {
      name: 'Drainage',
      description: 'Blocked, damaged, or overflowing drainage systems.',
    },
    {
      name: 'Public Infrastructure',
      description: 'Issues related to public infrastructure and facilities.',
    },
  ],

  'Water Services': [
    {
      name: 'Water Supply',
      description: 'Problems with public water supply.',
    },
    {
      name: 'Pipeline Leakage',
      description: 'Leaking or damaged water pipelines.',
    },
    {
      name: 'Water Quality',
      description: 'Problems related to water quality or contamination.',
    },
    {
      name: 'Low Water Pressure',
      description: 'Low or insufficient water pressure.',
    },
  ],

  Sanitation: [
    {
      name: 'Garbage Collection',
      description: 'Missed, delayed, or inadequate garbage collection.',
    },
    {
      name: 'Waste Disposal',
      description: 'Improper waste disposal or waste management.',
    },
    {
      name: 'Public Cleanliness',
      description: 'Issues related to cleanliness of public areas.',
    },
    {
      name: 'Sewerage',
      description: 'Blocked, damaged, or overflowing sewerage systems.',
    },
  ],

  Electricity: [
    {
      name: 'Power Outage',
      description: 'Unexpected or prolonged electricity outages.',
    },
    {
      name: 'Street Electricity',
      description: 'Issues with public electrical infrastructure.',
    },
    {
      name: 'Electrical Hazard',
      description: 'Exposed wires or other electrical safety hazards.',
    },
    {
      name: 'Meter Issue',
      description: 'Problems with electricity meters.',
    },
  ],

  'Health Services': [
    {
      name: 'Public Hospital',
      description: 'Issues related to public hospitals and services.',
    },
    {
      name: 'Medicine Availability',
      description: 'Problems with availability of medicines.',
    },
    {
      name: 'Health Facility',
      description: 'Issues related to public health facilities.',
    },
    {
      name: 'Public Health',
      description: 'General public health-related issues.',
    },
  ],

  Other: [
    {
      name: 'Public Service',
      description: 'General public service issues.',
    },
    {
      name: 'Government Office',
      description: 'Issues related to government offices.',
    },
    {
      name: 'Public Property',
      description: 'Damage or problems involving public property.',
    },
    {
      name: 'Community Issue',
      description: 'Issues affecting the local community.',
    },
    {
      name: 'Other',
      description: 'Issues that do not fit another category.',
    },
  ],
}

const seedCategories = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    )

    console.log(
      'MongoDB connected successfully.'
    )

    for (const [
      departmentName,
      departmentCategories,
    ] of Object.entries(categories)) {
      const department =
        await Department.findOne({
          name: departmentName,
        })

      if (!department) {
        console.log(
          `Department "${departmentName}" not found. Skipping.`
        )

        continue
      }

      for (const categoryData of departmentCategories) {
        const existingCategory =
          await Category.findOne({
            name: categoryData.name,
            departmentId: department._id,
          })

        if (existingCategory) {
          console.log(
            `${categoryData.name} already exists under ${departmentName}.`
          )

          continue
        }

        await Category.create({
          name: categoryData.name,
          description:
            categoryData.description,
          departmentId:
            department._id,
          isActive: true,
        })

        console.log(
          `${categoryData.name} created under ${departmentName}.`
        )
      }
    }

    console.log(
      'Category seeding completed.'
    )

    await mongoose.disconnect()

    process.exit(0)
  } catch (error) {
    console.error(
      'Category seeding failed:',
      error.message
    )

    await mongoose.disconnect()

    process.exit(1)
  }
}

seedCategories()