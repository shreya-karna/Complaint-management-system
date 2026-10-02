import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Clock,
  LoaderCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

import { getComplaints } from '../../services/complaintService'

function StaffDashboard() {
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true)

        const response = await getComplaints()

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
  }, [])

  const totalComplaints = complaints.length

  const pendingComplaints = complaints.filter(
    (complaint) =>
      complaint.status === 'SUBMITTED' ||
      complaint.status === 'UNDER_REVIEW' ||
      complaint.status === 'ASSIGNED'
  ).length

  const inProgressComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === 'IN_PROGRESS'
    ).length

  const resolvedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === 'RESOLVED' ||
        complaint.status === 'CLOSED'
    ).length

  const recentComplaints = complaints.slice(
    0,
    5
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading staff dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Staff Portal
            </p>

            <h1 className="text-2xl font-bold">
              Staff Dashboard
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/staff/complaints')
            }
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            View Complaints
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total Complaints
              </p>

              <FileText size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {totalComplaints}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Pending
              </p>

              <Clock size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {pendingComplaints}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                In Progress
              </p>

              <LoaderCircle size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {inProgressComplaints}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Resolved
              </p>

              <CheckCircle size={20} />
            </div>

            <p className="mt-3 text-3xl font-bold">
              {resolvedComplaints}
            </p>
          </div>

        </div>

        <div className="mt-8 rounded-xl border bg-white shadow-sm">

          <div className="flex items-center justify-between border-b px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold">
                Recent Complaints
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Recently submitted complaints
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/staff/complaints')
              }
              className="flex items-center gap-1 text-sm font-medium hover:underline"
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">
                No complaints found.
              </p>
            </div>
          ) : (
            <div className="divide-y">

              {recentComplaints.map(
                (complaint) => (
                  <button
                    key={complaint._id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/staff/complaints/${complaint._id}`
                      )
                    }
                    className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50"
                  >

                    <div>
                      <p className="text-sm font-semibold">
                        {complaint.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {complaint.complaintNumber}
                        {' • '}
                        {complaint.departmentName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-medium">
                        {complaint.status}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(
                          complaint.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                  </button>
                )
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default StaffDashboard