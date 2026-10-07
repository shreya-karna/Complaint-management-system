import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Clock,
  UserCheck,
  LoaderCircle,
  CheckCircle,
  Lock,
  XCircle,
  RotateCcw,
  Copy,
  ArrowRight,
  Users,
  Building2,
  Tags,
} from 'lucide-react'

import { getComplaints } from '../../services/complaintService'
import ComplaintsMap from "../../components/ComplaintsMap";

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

  const duplicateCount =
    statistics?.duplicate || 0

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
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="text-center">
          <LoaderCircle className="w-10 h-10 mx-auto mb-3 animate-spin text-blue-600" />

          <p className="text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Complaint Management System
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Total */}
          <button
            type="button"
            onClick={() =>
              goToComplaints()
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Complaints
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalComplaints}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600">
              View all complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Submitted */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('SUBMITTED')
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Submitted
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {submittedCount}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600">
              View submitted complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Under Review */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('UNDER_REVIEW')
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-yellow-300 hover:bg-yellow-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Under Review
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {underReviewCount}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-yellow-600">
              View complaints under review
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Assigned */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('ASSIGNED')
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Assigned
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {assignedCount}
                </p>
              </div>

              <div className="rounded-lg bg-purple-100 p-3">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-purple-600">
              View assigned complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* In Progress */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('IN_PROGRESS')
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {inProgressCount}
                </p>
              </div>

              <div className="rounded-lg bg-orange-100 p-3">
                <LoaderCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-orange-600">
              View in-progress complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Resolved */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('RESOLVED')
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-green-300 hover:bg-green-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Resolved
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {resolvedCount}
                </p>
              </div>

              <div className="rounded-lg bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600">
              View resolved complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Closed */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('CLOSED')
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Closed
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {closedCount}
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 p-3">
                <Lock className="h-6 w-6 text-gray-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-600">
              View closed complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Rejected */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('REJECTED')
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-red-300 hover:bg-red-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Rejected
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {rejectedCount}
                </p>
              </div>

              <div className="rounded-lg bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-red-600">
              View rejected complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Reopened */}
          <button
            type="button"
            onClick={() =>
              goToComplaints('REOPENED')
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-pink-300 hover:bg-pink-50/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Reopened
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {reopenedCount}
                </p>
              </div>

              <div className="rounded-lg bg-pink-100 p-3">
                <RotateCcw className="h-6 w-6 text-pink-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-pink-600">
              View reopened complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() =>
              navigate('/admin/complaints/duplicates')
            }
            className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Duplicate
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {duplicateCount}
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 p-3">
                <Copy className="h-6 w-6 text-gray-600" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-600">
              Manage duplicate complaints
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quickly access common administration tasks.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* View Complaints */}
            <button
              type="button"
              onClick={() =>
                navigate('/admin/complaints')
              }
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  View Complaints
                </p>

                <p className="text-xs text-gray-500">
                  Manage complaints
                </p>
              </div>
            </button>

            {/* Users */}
            <button
              type="button"
              onClick={() =>
                navigate('/admin/users')
              }
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-purple-300 hover:bg-purple-50"
            >
              <div className="rounded-lg bg-purple-100 p-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  Manage Users
                </p>

                <p className="text-xs text-gray-500">
                  Manage system users
                </p>
              </div>
            </button>

            {/* Departments */}
            <button
              type="button"
              onClick={() =>
                navigate('/admin/departments')
              }
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="rounded-lg bg-green-100 p-2">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  Manage Departments
                </p>

                <p className="text-xs text-gray-500">
                  Manage departments
                </p>
              </div>
            </button>

            {/* Categories */}
            <button
              type="button"
              onClick={() =>
                navigate('/admin/categories')
              }
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-orange-300 hover:bg-orange-50"
            >
              <div className="rounded-lg bg-orange-100 p-2">
                <Tags className="h-5 w-5 text-orange-600" />
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  Manage Categories
                </p>

                <p className="text-xs text-gray-500">
                  Manage complaint categories
                </p>
              </div>
            </button>

          </div>
                </div>

        {/* Complaint Map */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Complaint Map
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View all complaints based on their reported locations.
            </p>
          </div>

          <div className="mt-5">
 
            <ComplaintsMap
              complaints={complaints}
            />
          </div>
        </div>

      </main>
    </div>
  )
}

export default AdminDashboard
