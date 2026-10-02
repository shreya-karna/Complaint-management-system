import Department from '../models/Department.js'

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .sort({ createdAt: 1 })

    return res.status(200).json({
      success: true,
      departments,
    })
  } catch (error) {
    console.error(
      'Get departments error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch departments.',
    })
  }
}

export const createDepartment = async (req, res) => {
  try {
    const {
      name,
      description,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required.',
      })
    }

    const existingDepartment =
      await Department.findOne({
        name: name.trim(),
      })

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: 'Department already exists.',
      })
    }

    const department =
      await Department.create({
        name: name.trim(),
        description:
          description
            ? description.trim()
            : '',
        isActive: true,
      })

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department,
    })
  } catch (error) {
    console.error(
      'Create department error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to create department.',
    })
  }
}

export const updateDepartment = async (
  req,
  res
) => {
  try {
    const { id } = req.params

    const {
      name,
      description,
      isActive,
    } = req.body

    const department =
      await Department.findById(id)

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      })
    }

    if (
      name !== undefined &&
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required.',
      })
    }

    if (name !== undefined) {
      department.name = name.trim()
    }

    if (description !== undefined) {
      department.description =
        description.trim()
    }

    if (isActive !== undefined) {
      department.isActive = isActive
    }

    await department.save()

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department,
    })
  } catch (error) {
    console.error(
      'Update department error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to update department.',
    })
  }
}