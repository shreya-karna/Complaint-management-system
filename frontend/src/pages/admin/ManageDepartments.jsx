import { useEffect, useState } from 'react'
import {
  createDepartment,
  getDepartments,
  updateDepartment,
} from '../../services/departmentService'

function ManageDepartments() {
  const [departments, setDepartments] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [name, setName] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [editingId, setEditingId] =
    useState(null)

  const [message, setMessage] =
    useState('')

  const loadDepartments = async () => {
    try {
      setLoading(true)
      setError('')

      const response =
        await getDepartments()

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!name.trim()) {
      setError(
        'Department name is required.'
      )
      return
    }

    try {
      setError('')
      setMessage('')

      if (editingId) {
        const response =
          await updateDepartment(
            editingId,
            {
              name,
              description,
            }
          )

        setDepartments((current) =>
          current.map((department) =>
            department._id === editingId
              ? response.department
              : department
          )
        )

        setMessage(
          'Department updated successfully.'
        )
      } else {
        const response =
          await createDepartment({
            name,
            description,
          })

        setDepartments((current) => [
          ...current,
          response.department,
        ])

        setMessage(
          'Department created successfully.'
        )
      }

      resetForm()
    } catch (error) {
      console.error(
        'Save department error:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to save department.'
      )
    }
  }

  const handleEdit = (department) => {
    setEditingId(department._id)
    setName(department.name)
    setDescription(
      department.description || ''
    )

    setError('')
    setMessage('')
  }

  const handleToggleStatus = async (
    department
  ) => {
    try {
      setError('')
      setMessage('')

      const response =
        await updateDepartment(
          department._id,
          {
            isActive:
              !department.isActive,
          }
        )

      setDepartments((current) =>
        current.map((item) =>
          item._id === department._id
            ? response.department
            : item
        )
      )

      setMessage(
        `Department ${
          response.department.isActive
            ? 'enabled'
            : 'disabled'
        } successfully.`
      )
    } catch (error) {
      console.error(
        'Toggle department error:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to update department.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold">
            Manage Departments
          </h1>

          <p className="mt-2 text-gray-500">
            Add, edit, enable, or disable
            complaint departments.
          </p>
        </div>

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
                ? 'Edit Department'
                : 'Add Department'}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Department Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Public Works"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                />
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
                  placeholder="Department description"
                  rows={4}
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-md bg-black px-5 py-2 text-white"
                >
                  {editingId
                    ? 'Update Department'
                    : 'Add Department'}
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
                  Departments
                </h2>
              </div>

              {loading ? (
                <div className="p-6 text-gray-500">
                  Loading departments...
                </div>
              ) : departments.length === 0 ? (
                <div className="p-6 text-gray-500">
                  No departments found.
                </div>
              ) : (
                <div className="divide-y">
                  {departments.map(
                    (department) => (
                      <div
                        key={department._id}
                        className="flex items-center justify-between gap-4 px-6 py-5"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {department.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {department.description ||
                              'No description'}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                              department.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {department.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                department
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
                                department
                              )
                            }
                            className="rounded-md border px-3 py-2 text-sm"
                          >
                            {department.isActive
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

export default ManageDepartments