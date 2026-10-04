import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Search,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { trackComplaint } from '@/services/complaintService'


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


const formatDateTime = (date) => {
  if (!date) {
    return 'N/A'
  }

  return new Date(date).toLocaleString(
    'en-US',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  )
}


function TrackComplaint() {
  const navigate = useNavigate()

  const [complaintNumber, setComplaintNumber] =
    useState('')

  const [complaint, setComplaint] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(false)

  const [error, setError] =
    useState('')


  const handleSearch = async (event) => {
    event.preventDefault()

    if (!complaintNumber.trim()) {
      setError(
        'Please enter a complaint number.'
      )

      return
    }

    try {
      setIsLoading(true)
      setError('')
      setComplaint(null)

      const response =
        await trackComplaint(
          complaintNumber.trim()
        )

      setComplaint(response.complaint)
    } catch (error) {
      console.error(
        'Failed to track complaint:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to find complaint.'
      )
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-slate-50">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <div>
            <p className="text-sm font-medium text-blue-600">
              CITIZEN SERVICES
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Track Complaint
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              navigate('/')
            }
          >
            Dashboard
          </Button>

        </div>
      </header>


      <main className="mx-auto max-w-4xl px-6 py-10">

        <button
          type="button"
          onClick={() =>
            navigate('/')
          }
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={18} />

          Back to Dashboard
        </button>


        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Track your complaint
          </h2>

          <p className="mt-2 text-slate-600">
            Enter your complaint number to view
            its current status and progress history.
          </p>
        </div>


        <Card className="mb-8">
          <CardContent className="p-6">

            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-3 sm:flex-row"
            >

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={complaintNumber}
                  onChange={(event) => {
                    setComplaintNumber(
                      event.target.value
                    )

                    setError('')
                  }}
                  placeholder="e.g. CMP-2026-000001"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#123b63] hover:bg-[#0d2d4c]"
              >
                <Search className="mr-2 size-4" />

                {isLoading
                  ? 'Searching...'
                  : 'Track Complaint'}
              </Button>

            </form>


            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

          </CardContent>
        </Card>


        {complaint && (
          <div className="space-y-6">

            {/* Complaint summary */}
            <Card>
              <CardContent className="p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <p className="text-sm font-semibold text-blue-600">
                      {complaint.complaintNumber}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                      {complaint.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Submitted on{' '}
                      {formatDateTime(
                        complaint.createdAt
                      )}
                    </p>
                  </div>


                  <Badge
                    variant="outline"
                    className={`w-fit rounded-full px-3 py-1 ${
                      statusStyles[
                        complaint.status
                      ] || ''
                    }`}
                  >
                    {formatStatus(
                      complaint.status
                    )}
                  </Badge>

                </div>


                {complaint.status ===
                  'REJECTED' && (
                  <div className="mt-6 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4">

                    <XCircle className="mt-0.5 shrink-0 text-rose-600" />

                    <div>
                      <p className="font-semibold text-rose-800">
                        Complaint rejected
                      </p>

                      <p className="mt-1 text-sm text-rose-700">
                        This complaint has been
                        rejected by the responsible
                        department.
                      </p>
                    </div>

                  </div>
                )}

              </CardContent>
            </Card>


            {/* Complaint information */}
            <Card>
              <CardContent className="p-6">

                <h3 className="text-lg font-semibold text-slate-900">
                  Complaint Information
                </h3>


                <div className="mt-5 grid gap-5 sm:grid-cols-2">

                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Department
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {complaint.departmentName}
                    </p>
                  </div>


                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {complaint.category}
                    </p>
                  </div>


                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Priority
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {complaint.priority}
                    </p>
                  </div>


                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {formatDateTime(
                        complaint.updatedAt
                      )}
                    </p>
                  </div>

                </div>


                <div className="mt-6">

                  <p className="text-xs font-medium uppercase text-slate-400">
                    Location
                  </p>

                  <div className="mt-2 flex items-start gap-2 text-sm text-slate-700">

                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {complaint.location
                        ? [
                            complaint.location
                              .province,
                            complaint.location
                              .district,
                            complaint.location
                              .municipality,
                            complaint.location
                              .ward
                              ? `Ward ${complaint.location.ward}`
                              : '',
                            complaint.location
                              .tole,
                          ]
                            .filter(Boolean)
                            .join(', ')
                        : 'N/A'}
                    </span>

                  </div>

                </div>

              </CardContent>
            </Card>


            {/* Status history */}
            <Card>
              <CardContent className="p-6">

                <div className="flex items-center gap-2">
                  <Clock size={19} />

                  <h3 className="text-lg font-semibold text-slate-900">
                    Status History
                  </h3>
                </div>


                <div className="mt-6 space-y-5">

                  {complaint.history?.length >
                  0 ? (
                    complaint.history.map(
                      (item, index) => (
                        <div
                          key={`${item.changedAt}-${index}`}
                          className="relative border-l-2 border-slate-200 pl-6"
                        >

                          <div className="absolute -left-[7px] top-0 size-3 rounded-full border-2 border-white bg-blue-600" />

                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                            <p className="font-semibold text-slate-900">
                              {formatStatus(
                                item.status
                              )}
                            </p>

                            <p className="text-xs text-slate-400">
                              {formatDateTime(
                                item.changedAt
                              )}
                            </p>

                          </div>


                          {item.note && (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {item.note}
                            </p>
                          )}

                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-slate-500">
                      No status history available.
                    </p>
                  )}

                </div>

              </CardContent>
            </Card>

          </div>
        )}

      </main>
    </div>
  )
}

export default TrackComplaint