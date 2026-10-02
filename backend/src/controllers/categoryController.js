import Category from '../models/Category.js'
import Department from '../models/Department.js'

export const getCategories = async (
  req,
  res
) => {
  try {
    const { departmentId } = req.query

    const filter = {}

    if (departmentId) {
      filter.departmentId = departmentId
    }

    const categories =
      await Category.find(filter)
        .populate(
          'departmentId',
          'name'
        )
        .sort({ createdAt: 1 })

    return res.status(200).json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error(
      'Get categories error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories.',
    })
  }
}

export const createCategory = async (
  req,
  res
) => {
  try {
    const {
      name,
      description,
      departmentId,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      })
    }

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department is required.',
      })
    }

    const department =
      await Department.findById(
        departmentId
      )

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      })
    }

    const existingCategory =
      await Category.findOne({
        name: name.trim(),
        departmentId,
      })

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message:
          'Category already exists in this department.',
      })
    }

    const category =
      await Category.create({
        name: name.trim(),
        description:
          description
            ? description.trim()
            : '',
        departmentId,
        isActive: true,
      })

    const populatedCategory =
      await Category.findById(
        category._id
      ).populate(
        'departmentId',
        'name'
      )

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: populatedCategory,
    })
  } catch (error) {
    console.error(
      'Create category error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to create category.',
    })
  }
}

export const updateCategory = async (
  req,
  res
) => {
  try {
    const { id } = req.params

    const {
      name,
      description,
      departmentId,
      isActive,
    } = req.body

    const category =
      await Category.findById(id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      })
    }

    if (
      name !== undefined &&
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      })
    }

    if (departmentId !== undefined) {
      const department =
        await Department.findById(
          departmentId
        )

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found.',
        })
      }

      category.departmentId =
        departmentId
    }

    if (name !== undefined) {
      category.name = name.trim()
    }

    if (description !== undefined) {
      category.description =
        description.trim()
    }

    if (isActive !== undefined) {
      category.isActive = isActive
    }

    await category.save()

    const updatedCategory =
      await Category.findById(
        category._id
      ).populate(
        'departmentId',
        'name'
      )

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category: updatedCategory,
    })
  } catch (error) {
    console.error(
      'Update category error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to update category.',
    })
  }
}