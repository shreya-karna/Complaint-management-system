import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../../services/api'

const formatDateTime = (date) => {
  if (!date) {
    return 'Date unavailable'
  }

  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'COMPLAINT_ASSIGNED':
      return '📋'

    case 'STATUS_UPDATED':
      return '🔄'

    case 'COMPLAINT_RESOLVED':
      return '✅'

    case 'COMPLAINT_REOPENED':
      return '🔓'

    default:
      return '🔔'
  }
}

function StaffNotifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] =
    useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingRead, setMarkingRead] = useState(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get(
        '/notifications'
      )

      setNotifications(
        response.data.notifications || []
      )
    } catch (error) {
      console.error(
        'Failed to load notifications:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to load notifications.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleNotificationClick = async (
    notification
  ) => {
    try {
      if (!notification.isRead) {
        setMarkingRead(notification._id)

        await api.patch(
          `/notifications/${notification._id}/read`
        )

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          )
        )
      }

      if (notification.complaintId?._id) {
        navigate(
          `/staff/complaints/${notification.complaintId._id}`
        )
      }
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to update notification.'
      )
    } finally {
      setMarkingRead(null)
    }
  }

  const unreadCount =
    notifications.filter(
      (notification) => !notification.isRead
    ).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-500">
            Loading notifications...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Notifications
            </h1>

            <p className="mt-1 text-gray-500">
              Stay updated about your assigned
              complaints.
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">
              🔔
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(
              (notification) => {
                const complaint =
                  notification.complaintId

                const isLoading =
                  markingRead === notification._id

                return (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    disabled={isLoading}
                    className={`w-full rounded-lg border p-5 text-left shadow-sm transition hover:shadow-md ${
                      notification.isRead
                        ? 'border-gray-200 bg-white'
                        : 'border-blue-200 bg-blue-50'
                    } ${
                      isLoading
                        ? 'cursor-wait opacity-70'
                        : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-gray-900">
                              {notification.title}
                            </h2>

                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </div>

                          <span className="shrink-0 text-xs text-gray-500">
                            {formatDateTime(
                              notification.createdAt
                            )}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {notification.message}
                        </p>

                        {complaint && (
                          <div className="mt-3 rounded-md bg-white px-3 py-2">
                            <p className="text-xs text-gray-500">
                              Complaint
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                              #
                              {
                                complaint.complaintNumber
                              }
                            </p>

                            {complaint.title && (
                              <p className="mt-1 truncate text-xs text-gray-500">
                                {complaint.title}
                              </p>
                            )}
                          </div>
                        )}

                        <p className="mt-3 text-xs font-medium text-blue-600">
                          {isLoading
                            ? 'Opening complaint...'
                            : complaint
                              ? 'Click to view complaint →'
                              : 'Notification'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              }
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffNotifications