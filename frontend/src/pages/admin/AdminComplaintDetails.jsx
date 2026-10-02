import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getComplaintById } from '../../services/complaintService'

const formatDateTime = (date) => {
  if (!date) {
    return 'Date unavailable'
  }

  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function AdminComplaintDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true)

        const response = await getComplaintById(id)

        setComplaint(response.complaint)
      } catch (error) {
        console.error(error)
        setError('Failed to load complaint.')
      } finally {
        setLoading(false)
      }
    }

    fetchComplaint()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-500">
            Loading complaint...
          </p>
        </div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 rounded-md border px-4 py-2"
          >
            ← Back
          </button>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-red-500">
              {error || 'Complaint not found.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Complaint Details
          </h1>

          <p className="mt-2 text-gray-500">
            Complaint #{complaint.complaintNumber}
          </p>
        </div>

        <div className="space-y-6">
          {/* Complaint Information */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
              Complaint Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Complaint Number
                </p>

                <p className="mt-1 font-medium">
                  {complaint.complaintNumber}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Submitted
                </p>

                <p className="mt-1 font-medium">
                  {formatDateTime(
                    complaint.createdAt
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Department
                </p>

                <p className="mt-1 font-medium">
                  {complaint.departmentName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Category
                </p>

                <p className="mt-1 font-medium">
                  {complaint.category}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Location
                </p>

                <p className="mt-1 font-medium">
                  {complaint.location}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Priority
                </p>

                <p className="mt-1 font-medium">
                  {complaint.priority}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Title
              </p>

              <p className="mt-1 text-lg font-semibold">
                {complaint.title}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap text-gray-700">
                {complaint.description}
              </p>
            </div>
          </div>

          {/* Current Status */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              Current Status
            </h2>

            <span className="inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
              {complaint.status}
            </span>
          </div>

          {/* Status History */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
              Status History
            </h2>

            {complaint.history &&
            complaint.history.length > 0 ? (
              <div className="space-y-4">
                {complaint.history.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4"
                    >
                      <p className="font-semibold">
                        {item.status}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatDateTime(
                          item.changedAt
                        )}
                      </p>

                      {item.note && (
                        <p className="mt-2 text-sm text-gray-700">
                          {item.note}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                No status history available.
              </p>
            )}
          </div>

          {/* Resolution */}
          {complaint.resolution && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">
                Resolution
              </h2>

              <p className="whitespace-pre-wrap text-gray-700">
                {complaint.resolution}
              </p>
            </div>
          )}

          {/* Attachments */}
          {complaint.attachments &&
            complaint.attachments.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">
                  Attachments
                </h2>

                <div className="space-y-2">
                  {complaint.attachments.map(
                    (attachment, index) => (
                      <a
                        key={index}
                        href={`http://localhost:5000${attachment.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-md border p-3 text-blue-600 hover:bg-gray-50"
                      >
                        {attachment.name}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default AdminComplaintDetails