import { useEffect, useState } from 'react'

import {
  createCategory,
  getCategories,
  updateCategory,
} from '../../services/categoryService'

import {
  getDepartments,
} from '../../services/departmentService'

function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])

  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [departmentId, setDepartmentId] = useState('')

  const [editingId, setEditingId] = useState(null)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadDepartments = async () => {
    try {
      const response = await getDepartments()

      setDepartments(
        response.departments || []
      )
    } catch (error) {
      console.error(
        'Load departments error:',
        error
      )

      setError(
        'Failed to load departments.'
      )
    }
  }

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getCategories()

      setCategories(
        response.categories || []
      )
    } catch (error) {
      console.error(
        'Load categories error:',
        error
      )

      setError(
        'Failed to load categories.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
    loadCategories()
  }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setDepartmentId('')
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!name.trim()) {
      setError(
        'Category name is required.'
      )
      return
    }

    if (!departmentId) {
      setError(
        'Please select a department.'
      )
      return
    }

    try {
      setError('')
      setMessage('')

      if (editingId) {
        const response =
          await updateCategory(
            editingId,
            {
              name,
              description,
              departmentId,
            }
          )

        setCategories((current) =>
          current.map((category) =>
            category._id === editingId
              ? response.category
              : category
          )
        )

        setMessage(
          'Category updated successfully.'
        )
      } else {
        const response =
          await createCategory({
            name,
            description,
            departmentId,
          })

        setCategories((current) => [
          ...current,
          response.category,
        ])

        setMessage(
          'Category created successfully.'
        )
      }

      resetForm()
    } catch (error) {
      console.error(
        'Save category error:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to save category.'
      )
    }
  }

  const handleEdit = (category) => {
    setEditingId(category._id)
    setName(category.name)
    setDescription(
      category.description || ''
    )

    setDepartmentId(
      category.departmentId?._id ||
        category.departmentId
    )

    setError('')
    setMessage('')
  }

  const handleToggleStatus = async (
    category
  ) => {
    try {
      setError('')
      setMessage('')

      const response =
        await updateCategory(
          category._id,
          {
            isActive:
              !category.isActive,
          }
        )

      setCategories((current) =>
        current.map((item) =>
          item._id === category._id
            ? response.category
            : item
        )
      )

      setMessage(
        `Category ${
          response.category.isActive
            ? 'enabled'
            : 'disabled'
        } successfully.`
      )
    } catch (error) {
      console.error(
        'Toggle category error:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to update category.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold">
          Manage Categories
        </h1>

        <p className="mt-2 text-gray-500">
          Add, edit, enable, or disable
          complaint categories.
        </p>

        {message && (
          <div className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-xl font-semibold">
              {editingId
                ? 'Edit Category'
                : 'Add Category'}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Road Damage"
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Department
                </label>

                <select
                  value={departmentId}
                  onChange={(event) =>
                    setDepartmentId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="">
                    Select department
                  </option>

                  {departments
                    .filter(
                      (department) =>
                        department.isActive
                    )
                    .map((department) => (
                      <option
                        key={department._id}
                        value={department._id}
                      >
                        {department.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Category description"
                  rows={4}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-md bg-black px-5 py-2 text-white"
                >
                  {editingId
                    ? 'Update Category'
                    : 'Add Category'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-md border px-5 py-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white">
              <div className="border-b px-6 py-4">
                <h2 className="text-xl font-semibold">
                  Categories
                </h2>
              </div>

              {loading ? (
                <div className="p-6 text-gray-500">
                  Loading categories...
                </div>
              ) : categories.length ===
                0 ? (
                <div className="p-6 text-gray-500">
                  No categories found.
                </div>
              ) : (
                <div className="divide-y">
                  {categories.map(
                    (category) => (
                      <div
                        key={category._id}
                        className="flex items-center justify-between gap-4 px-6 py-5"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {category.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {category.description ||
                              'No description'}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Department:{' '}
                            {category
                              .departmentId
                              ?.name ||
                              'Unknown'}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                              category.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {category.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                category
                              )
                            }
                            className="rounded-md border px-3 py-2 text-sm"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                category
                              )
                            }
                            className="rounded-md border px-3 py-2 text-sm"
                          >
                            {category.isActive
                              ? 'Disable'
                              : 'Enable'}
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageCategories