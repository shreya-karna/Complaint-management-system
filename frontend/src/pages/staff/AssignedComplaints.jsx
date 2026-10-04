import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  FileText,
  SlidersHorizontal,
} from 'lucide-react'

import { getComplaints } from '../../services/complaintService'

const statuses = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
  'REOPENED',
]

const priorities = [
  'ALL',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]

function getStatusClass(status) {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-blue-100 text-blue-700'

    case 'UNDER_REVIEW':
      return 'bg-yellow-100 text-yellow-700'

    case 'ASSIGNED':
      return 'bg-purple-100 text-purple-700'

    case 'IN_PROGRESS':
      return 'bg-orange-100 text-orange-700'

    case 'RESOLVED':
      return 'bg-green-100 text-green-700'

    case 'CLOSED':
      return 'bg-gray-100 text-gray-700'

    case 'REJECTED':
      return 'bg-red-100 text-red-700'

    case 'REOPENED':
      return 'bg-pink-100 text-pink-700'

    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case 'LOW':
      return 'bg-gray-100 text-gray-700'

    case 'MEDIUM':
      return 'bg-blue-100 text-blue-700'

    case 'HIGH':
      return 'bg-orange-100 text-orange-700'

    case 'CRITICAL':
      return 'bg-red-100 text-red-700'

    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function AssignedComplaints() {
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] =
    useState('ALL')

  const [view, setView] = useState('department')

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await getComplaints(
          view === 'assigned'
        )

        setComplaints(response.complaints || [])
      } catch (error) {
        console.error(
          'Failed to fetch complaints:',
          error
        )

        setError(
          error.response?.data?.message ||
            'Failed to load complaints.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplaints()
  }, [view])

  const filteredComplaints = complaints.filter(
    (complaint) => {
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

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      )
    }
  )

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
  }

  const handleViewChange = (newView) => {
    setView(newView)
    clearFilters()
  }

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">

          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <ArrowLeft size={18} />
            Back to Staff Dashboard
          </button>

        </div>
      </div>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-8">

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold">
            Complaints
          </h1>

          <p className="mt-2 text-gray-500">
            Search, filter, and manage submitted
            complaints.
          </p>
        </div>

        {/* Complaint View Tabs */}
        <div className="mt-8 rounded-xl border bg-white p-2 shadow-sm">

          <div className="grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() =>
                handleViewChange('department')
              }
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                view === 'department'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Department Complaints
            </button>

            <button
              type="button"
              onClick={() =>
                handleViewChange('assigned')
              }
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                view === 'assigned'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Assigned Complaints
            </button>

          </div>

        </div>

        {/* Filters */}
        <div className="mt-4 rounded-xl border bg-white p-5 shadow-sm">

          <div className="flex items-center gap-2">

            <SlidersHorizontal
              size={18}
              className="text-gray-500"
            />

            <h2 className="text-sm font-semibold">
              Filters
            </h2>

          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            {/* Search */}
            <div className="relative md:col-span-1">

              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search complaints..."
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-black"
              />

            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === 'ALL'
                    ? 'All Statuses'
                    : status.replaceAll('_', ' ')}
                </option>
              ))}
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              {priorities.map((priority) => (
                <option
                  key={priority}
                  value={priority}
                >
                  {priority === 'ALL'
                    ? 'All Priorities'
                    : priority}
                </option>
              ))}
            </select>

          </div>

          {/* Filter information */}
          <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-700">
                {filteredComplaints.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-700">
                {complaints.length}
              </span>{' '}
              complaints
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            )}

          </div>

        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mt-8 rounded-xl border bg-white p-10 text-center">
            <p className="text-gray-500">
              Loading complaints...
            </p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center">

            <p className="font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* No results */}
        {!isLoading &&
          !error &&
          filteredComplaints.length === 0 && (
            <div className="mt-8 rounded-xl border bg-white p-12 text-center">

              <FileText
                size={40}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-4 text-lg font-semibold">
                No complaints found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {view === 'assigned'
                  ? 'No complaints are currently assigned to you.'
                  : 'There are no complaints in your department.'}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}

            </div>
          )}

        {/* Complaints */}
        {!isLoading &&
          !error &&
          filteredComplaints.length > 0 && (
            <div className="mt-6 space-y-4">

              {filteredComplaints.map(
                (complaint) => (
                  <button
                    key={complaint._id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/staff/complaints/${complaint._id}`
                      )
                    }
                    className="w-full rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-gray-400 hover:shadow-md"
                  >

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      {/* Main information */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-sm font-semibold text-blue-600">
                            {complaint.complaintNumber}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              complaint.status
                            )}`}
                          >
                            {complaint.status.replaceAll(
                              '_',
                              ' '
                            )}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority ||
                              'MEDIUM'}
                          </span>

                        </div>

                        <h2 className="mt-2 text-lg font-semibold text-gray-900">
                          {complaint.title}
                        </h2>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                          {complaint.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">

                          <span>
                            Department:{' '}
                            <span className="font-medium text-gray-700">
                              {complaint.departmentName}
                            </span>
                          </span>

                          <span>
                            Category:{' '}
                            <span className="font-medium text-gray-700">
                              {complaint.category}
                            </span>
                          </span>

                          <span>
                            Location:{' '}
                            <span className="font-medium text-gray-700">
                              {complaint.location
    ? typeof complaint.location === 'string'
      ? complaint.location
      : [
          complaint.location.province,
          complaint.location.district,
          complaint.location.municipality,
          complaint.location.ward
            ? 'Ward ' + complaint.location.ward
            : '',
          complaint.location.tole,
        ]
          .filter(Boolean)
          .join(', ')
    : 'N/A'}
                            </span>
                          </span>

                        </div>

                      </div>

                      {/* Date */}
                      <div className="shrink-0 md:text-right">

                        <p className="text-xs text-gray-400">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {new Date(
                            complaint.createdAt
                          ).toLocaleDateString()}
                        </p>

                      </div>

                    </div>

                  </button>
                )
              )}

            </div>
          )}

      </main>

    </div>
  )
}

export default AssignedComplaints

