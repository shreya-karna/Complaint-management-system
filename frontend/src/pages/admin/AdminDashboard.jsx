import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getComplaints } from '../../services/complaintService'

function AdminDashboard() {
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getComplaints()

        setComplaints(
          response.complaints || []
        )

        setStatistics(
          response.statistics || null
        )
      } catch (error) {
        console.error(error)

        setError(
          'Failed to load dashboard data.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  const totalComplaints =
    statistics?.total || 0

  const submittedCount =
    statistics?.submitted || 0

  const underReviewCount =
    statistics?.underReview || 0

  const assignedCount =
    statistics?.assigned || 0

  const inProgressCount =
    statistics?.inProgress || 0

  const resolvedCount =
    statistics?.resolved || 0

  const closedCount =
    statistics?.closed || 0

  const rejectedCount =
    statistics?.rejected || 0

  const reopenedCount =
    statistics?.reopened || 0

  const goToComplaints = (status) => {
    if (status) {
      navigate(
        `/admin/complaints?status=${status}`
      )
      return
    }

    navigate('/admin/complaints')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-500">
            Loading dashboard...
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
          <h1 className="text-3xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Complaint Management System
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Total */}
          <button
            type="button"
            onClick={() =>
              goToComplaints()
            }
            className="w-full rounded-lg bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Total Complaints
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalComplaints}
            </p>
          </button>

          {/* Submitted */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('SUBMITTED')
            }
            className="w-full rounded-lg bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Submitted
            </p>

            <p className="mt-2 text-3xl font-bold">
              {submittedCount}
            </p>
          </button>

          {/* Under Review */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('UNDER_REVIEW')
            }
            className="w-full rounded-lg bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Under Review
            </p>

            <p className="mt-2 text-3xl font-bold">
              {underReviewCount}
            </p>
          </button>

          {/* Assigned */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('ASSIGNED')
            }
            className="w-full rounded-lg bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Assigned
            </p>

            <p className="mt-2 text-3xl font-bold">
              {assignedCount}
            </p>
          </button>

          {/* In Progress */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('IN_PROGRESS')
            }
            className="w-full rounded-lg bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold">
              {inProgressCount}
            </p>
          </button>

          {/* Resolved */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('RESOLVED')
            }
            className="w-full rounded-lg bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold">
              {resolvedCount}
            </p>
          </button>

          {/* Closed */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('CLOSED')
            }
            className="w-full rounded-lg bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Closed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {closedCount}
            </p>
          </button>

          {/* Rejected */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('REJECTED')
            }
            className="w-full rounded-lg bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-bold">
              {rejectedCount}
            </p>
          </button>

          {/* Reopened */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('REOPENED')
            }
            className="w-full rounded-lg bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500">
              Reopened
            </p>

            <p className="mt-2 text-3xl font-bold">
              {reopenedCount}
            </p>
          </button>

        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Quick Actions
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                navigate('/admin/complaints')
              }
              className="rounded-md bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
            >
              View All Complaints
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/admin/departments')
              }
              className="rounded-md border px-5 py-3 font-medium hover:bg-gray-50"
            >
              Manage Departments
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/admin/categories')
              }
              className="rounded-md border px-5 py-3 font-medium hover:bg-gray-50"
            >
              Manage Categories
            </button>

          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard