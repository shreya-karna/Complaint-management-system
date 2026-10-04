import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react'

import {
  getComplaintById,
  reopenComplaint,
} from '../../services/complaintService'

const SERVER_URL =
  import.meta.env.VITE_API_URL?.replace(
    '/api',
    ''
  )

const formatDateTime = (date) => {
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

function ComplaintDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [complaint, setComplaint] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [reopenReason, setReopenReason] =
    useState('')

  const [isReopening, setIsReopening] =
    useState(false)

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response =
          await getComplaintById(id)

        setComplaint(response.complaint)
      } catch (error) {
        console.error(
          'Failed to fetch complaint:',
          error
        )

        setError(
          error.response?.data?.message ||
            'Failed to load complaint.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchComplaint()
  }, [id])

  const handleReopen = async () => {
    if (!reopenReason.trim()) {
      setError(
        'Please provide a reason for reopening the complaint.'
      )
      return
    }

    try {
      setIsReopening(true)
      setError('')

      const response = await reopenComplaint(
        id,
        reopenReason
      )

      setComplaint(response.complaint)
      setReopenReason('')
    } catch (error) {
      console.error(
        'Failed to reopen complaint:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to reopen complaint.'
      )
    } finally {
      setIsReopening(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading complaint...
        </p>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Complaint not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              'The requested complaint could not be found.'}
          </p>

          <button
            onClick={() =>
              navigate('/my-complaints')
            }
            className="mt-5 rounded-md bg-black px-4 py-2 text-white"
          >
            Back to My Complaints
          </button>
        </div>
      </div>
    )
  }

  const formattedSubmittedDate =
    formatDateTime(
      complaint.createdAt
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Back button */}
        <button
          onClick={() =>
            navigate('/my-complaints')
          }
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to My Complaints
        </button>

        {/* Complaint heading */}
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">
            {complaint.complaintNumber}
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            {complaint.title}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Submitted on {formattedSubmittedDate}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">

          {/* LEFT SIDE */}
          <div className="space-y-6 md:col-span-2">

            {/* Complaint Details */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">
                Complaint Details
              </h2>

              <div className="mt-5 space-y-5">

                {/* Department */}
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm">
                    {complaint.departmentName}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Category
                  </p>

                  <p className="mt-1 text-sm">
                    {complaint.category}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Description
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {complaint.description}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Location
                  </p>

                  <div className="mt-1 flex items-start gap-2 text-sm">
                    <MapPin
                      size={17}
                      className="mt-0.5"
                    />

                    <span>
                      {complaint.location
                        ? typeof complaint.location === 'string'
                          ? complaint.location
                          : [
                              complaint.location.province,
                              complaint.location.district,
                              complaint.location.municipality,
                              complaint.location.ward
                                ? `Ward ${complaint.location.ward}`
                                : '',
                              complaint.location.tole,
                            ]
                              .filter(Boolean)
                              .join(', ')
                        : 'N/A'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Attachments */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">
                Attachments
              </h2>

              {!complaint.attachments ||
              complaint.attachments.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No attachments.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {complaint.attachments.map(
                    (file, index) => (
                      <a
                        key={`${file.name}-${index}`}
                        href={`${SERVER_URL}${file.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
                      >
                        <FileText size={20} />

                        <div>
                          <p className="text-sm font-medium">
                            {file.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {(
                              file.size /
                              1024 /
                              1024
                            ).toFixed(2)}{' '}
                            MB
                          </p>
                        </div>
                      </a>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Reopen Complaint */}
            {['RESOLVED', 'CLOSED'].includes(
              complaint.status
            ) && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">

                <h2 className="text-lg font-semibold">
                  Reopen Complaint
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  If the issue has not been completely
                  resolved, you can reopen this complaint.
                </p>

                <textarea
                  value={reopenReason}
                  onChange={(event) =>
                    setReopenReason(event.target.value)
                  }
                  placeholder="Explain why you want to reopen this complaint..."
                  rows={4}
                  className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <button
                  onClick={handleReopen}
                  disabled={isReopening}
                  className="mt-3 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isReopening
                    ? 'Reopening...'
                    : 'Reopen Complaint'}
                </button>

              </div>
            )}

          </div>

          {/* RIGHT SIDE */}
          <div>

            {/* Complaint Status */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">

              <h2 className="text-lg font-semibold">
                Complaint Status
              </h2>

              <div className="mt-5 flex items-center gap-3">
                <CheckCircle
                  size={22}
                  className="text-green-600"
                />

                <div>
                  <p className="text-sm font-medium">
                    {complaint.status}
                  </p>

                  <p className="text-xs text-gray-500">
                    Current status
                  </p>
                </div>
              </div>

              {/* Status History */}
              <div className="mt-6 border-t pt-5">

                <div className="flex items-center gap-2">
                  <Clock size={18} />

                  <p className="text-sm font-medium">
                    Status History
                  </p>
                </div>

                <div className="mt-4 space-y-4">

                  {complaint.history?.length > 0 ? (
                    complaint.history.map(
                      (item, index) => (
                        <div
                          key={`${item.changedAt}-${index}`}
                          className="border-l-2 pl-4"
                        >
                          <p className="text-sm font-medium">
                            {item.status}
                          </p>

                          {item.note && (
                            <p className="mt-1 text-xs text-gray-500">
                              {item.note}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-gray-400">
                            {formatDateTime(
                              item.changedAt
                            )}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-gray-500">
                      No status history available.
                    </p>
                  )}

                </div>
              </div>

            </div>

            {/* Priority */}
            <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase text-gray-400">
                Priority
              </p>

              <p className="mt-1 text-lg font-semibold">
                {complaint.priority}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default ComplaintDetails