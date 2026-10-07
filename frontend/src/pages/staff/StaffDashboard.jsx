import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  FileText,
  Clock,
  LoaderCircle,
  CheckCircle,
  ArrowRight,
  Bell,
} from 'lucide-react'

import { getComplaints } from '../../services/complaintService'
import { getNotifications } from '../../services/notificationService'
import ComplaintsMap from '../../components/ComplaintsMap'


const statusStyles = {
  SUBMITTED:
    'border-sky-200 bg-sky-50 text-sky-700',

  UNDER_REVIEW:
    'border-amber-200 bg-amber-50 text-amber-700',

  ASSIGNED:
    'border-violet-200 bg-violet-50 text-violet-700',

  IN_PROGRESS:
    'border-blue-200 bg-blue-50 text-blue-700',

  RESOLVED:
    'border-emerald-200 bg-emerald-50 text-emerald-700',

  CLOSED:
    'border-slate-200 bg-slate-50 text-slate-700',

  REJECTED:
    'border-rose-200 bg-rose-50 text-rose-700',

  REOPENED:
    'border-orange-200 bg-orange-50 text-orange-700',

  DUPLICATE:
    'border-purple-200 bg-purple-50 text-purple-700',
}


const formatStatus = (status) => {
  if (!status) {
    return 'Unknown'
  }

  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}


function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ||
        'border-gray-200 bg-gray-50 text-gray-700'
      }`}
    >
      {formatStatus(status)}
    </span>
  )
}


function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left"
    >
      <div className="h-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-md">
        <div className="flex items-start justify-between p-5">
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-sm font-medium text-slate-500">
              {label}
            </p>

            <p className="text-3xl font-bold tracking-tight text-[#102d49]">
              {value}
            </p>

            <p className="text-xs text-slate-500">
              {detail}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
          >
            <Icon
              size={21}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </button>
  )
}


function StaffDashboard() {
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          complaintsData,
          notificationsData,
        ] = await Promise.all([
          getComplaints(),
          getNotifications(),
        ])

        setComplaints(
          Array.isArray(complaintsData)
            ? complaintsData
            : complaintsData?.complaints || []
        )

        setNotifications(
          Array.isArray(notificationsData)
            ? notificationsData
            : notificationsData?.notifications || []
        )
      } catch (err) {
        console.error(
          'Failed to load staff dashboard:',
          err
        )

        setError(
          err?.response?.data?.message ||
            'Failed to load dashboard.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])


  const totalComplaints =
    complaints.length


  const pendingComplaints =
    complaints.filter(
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


  const recentComplaints =
    [...complaints]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5)


  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length


  const formatDate = (date) => {
    if (!date) {
      return 'N/A'
    }

    return new Date(date).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    )
  }


  const goToComplaints = (status) => {
    if (status) {
      navigate(
        `/staff/complaints?status=${status}`
      )

      return
    }

    navigate('/staff/complaints')
  }


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoaderCircle className="mx-auto mb-3 h-10 w-10 animate-spin text-blue-600" />

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Manage and track complaints assigned to
              your department.
            </p>
          </div>


          {/* Notifications */}
          <button
            type="button"
            onClick={() =>
              navigate('/staff/notifications')
            }
            className="relative inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Bell className="h-5 w-5" />

            Notifications

            {unreadNotifications > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {unreadNotifications}
              </span>
            )}
          </button>

        </div>


        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}


        {/* Statistics */}
        <section
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Complaint statistics"
        >

          <StatCard
            label="Total Complaints"
            value={totalComplaints}
            detail="All complaints assigned to you"
            icon={FileText}
            tone="bg-blue-50 text-blue-600"
            onClick={() =>
              goToComplaints()
            }
          />


          <StatCard
            label="Pending"
            value={pendingComplaints}
            detail="Awaiting further action"
            icon={Clock}
            tone="bg-yellow-50 text-yellow-600"
            onClick={() =>
              goToComplaints('PENDING')
            }
          />


          <StatCard
            label="In Progress"
            value={inProgressComplaints}
            detail="Currently being handled"
            icon={LoaderCircle}
            tone="bg-orange-50 text-orange-600"
            onClick={() =>
              goToComplaints('IN_PROGRESS')
            }
          />


          <StatCard
            label="Resolved"
            value={resolvedComplaints}
            detail="Successfully completed"
            icon={CheckCircle}
            tone="bg-emerald-50 text-emerald-600"
            onClick={() =>
              goToComplaints('RESOLVED')
            }
          />

        </section>


        {/* Recent Complaints */}
        <section className="mt-8">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
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
              className="hidden items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>


          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            {recentComplaints.length === 0 ? (

              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  No complaints found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Complaints assigned to your department
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-gray-100">

                {recentComplaints.map(
                  (complaint) => (

                    <div
                      key={complaint._id}
                      className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >

                      {/* Complaint Information */}
                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-sm font-semibold text-blue-600">
                            {complaint.complaintNumber ||
                              'No complaint number'}
                          </span>

                          <StatusBadge
                            status={
                              complaint.status
                            }
                          />

                        </div>


                        <h3 className="mt-1 truncate font-medium text-gray-900">
                          {complaint.title ||
                            'Untitled complaint'}
                        </h3>


                        <p className="mt-1 text-sm text-gray-500">
                          {complaint.departmentName ||
                            'N/A'}

                          {' • '}

                          {formatDate(
                            complaint.createdAt
                          )}
                        </p>

                      </div>


                      {/* View Button */}
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/staff/complaints/${complaint._id}`
                          )
                        }
                        className="w-full shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
                      >
                        View
                      </button>

                    </div>

                  )
                )}

              </div>

            )}


            {/* Mobile View All */}
            <div className="border-t border-gray-100 p-4 sm:hidden">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/staff/complaints'
                  )
                }
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                View all complaints
                <ArrowRight className="h-4 w-4" />
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
      View complaints reported within your department.
    </p>
  </div>

  <div className="mt-5">
    <ComplaintsMap
      complaints={complaints}
    />
  </div>
</div>

        </section>



      </main>

    </div>
  )
}


export default StaffDashboard