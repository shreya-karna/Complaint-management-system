import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getComplaints } from '../../services/complaintService'
import { getDepartments } from '../../services/departmentService'

function AdminComplaints() {
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [departments, setDepartments] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [departmentFilter, setDepartmentFilter] =
    useState('ALL')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [complaintsResponse, departmentsResponse] =
          await Promise.all([
            getComplaints(),
            getDepartments(),
          ])

        setComplaints(
  complaintsResponse.complaints || []
)

setDepartments(
  departmentsResponse.departments || []
)
      } catch (error) {
        console.error(error)
        setError(
          'Failed to load complaints.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredComplaints =
    complaints.filter((complaint) => {
      const search = searchTerm
        .trim()
        .toLowerCase()

      const matchesSearch =
        !search ||
        complaint.complaintNumber
          ?.toLowerCase()
          .includes(search) ||
        complaint.title
          ?.toLowerCase()
          .includes(search) ||
        complaint.description
          ?.toLowerCase()
          .includes(search) ||
        complaint.category
          ?.toLowerCase()
          .includes(search) ||
        complaint.departmentName
          ?.toLowerCase()
          .includes(search)

      const matchesStatus =
        statusFilter === 'ALL' ||
        complaint.status === statusFilter

      const matchesPriority =
        priorityFilter === 'ALL' ||
        complaint.priority === priorityFilter

      const matchesDepartment =
        departmentFilter === 'ALL' ||
        complaint.departmentId ===
          departmentFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesDepartment
      )
    })

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
    setDepartmentFilter('ALL')
  }

  const formatDate = (date) => {
    if (!date) {
      return 'Date unavailable'
    }

    return new Date(date).toLocaleString(
      undefined,
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-500">
            Loading complaints...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-5 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold">
            All Complaints
          </h1>

          <p className="mt-2 text-gray-500">
            Manage and review submitted complaints.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Search
              </label>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search complaints..."
                className="w-full rounded-md border px-4 py-2 outline-none focus:ring-2"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-md border px-4 py-2"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="SUBMITTED">
                  Submitted
                </option>

                <option value="UNDER_REVIEW">
                  Under Review
                </option>

                <option value="ASSIGNED">
                  Assigned
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="RESOLVED">
                  Resolved
                </option>

                <option value="CLOSED">
                  Closed
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

                <option value="REOPENED">
                  Reopened
                </option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Priority
              </label>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-md border px-4 py-2"
              >
                <option value="ALL">
                  All Priorities
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="CRITICAL">
                  Critical
                </option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Department
              </label>

              <select
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-md border px-4 py-2"
              >
                <option value="ALL">
                  All Departments
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department._id}
                      value={department._id}
                    >
                      {department.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Clear */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-md border px-4 py-2 font-medium hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-900">
              {filteredComplaints.length}
            </span>{' '}
            of{' '}
            <span className="font-medium text-gray-900">
              {complaints.length}
            </span>{' '}
            complaints
          </p>
        </div>

        {/* Complaints */}
        {filteredComplaints.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              No complaints found.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Complaint
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Department
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Category
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Priority
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Submitted
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredComplaints.map(
                    (complaint) => (
                      <tr
                        key={complaint._id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium">
                            {complaint.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              complaint.complaintNumber
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {complaint.departmentName}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {complaint.category}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                            {complaint.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                            {complaint.priority}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(
                            complaint.createdAt
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/complaints/${complaint._id}`
                              )
                            }
                            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminComplaints