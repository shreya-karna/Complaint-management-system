import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  FileText,
  Home,
  MapPin,
  RefreshCw,
} from 'lucide-react'

import { getComplaints } from '@/services/complaintService'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function MyComplaints() {
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchComplaints = async () => {
    try {
      setIsLoading(true)
      setError('')

      const result = await getComplaints()

      setComplaints(result.complaints || [])
    } catch (error) {
      console.error(
        'Failed to fetch complaints:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to load complaints. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

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

  const getStatusVariant = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'default'

      case 'REJECTED':
        return 'destructive'

      case 'IN_PROGRESS':
      case 'ASSIGNED':
      case 'UNDER_REVIEW':
        return 'secondary'

      default:
        return 'outline'
    }
  }

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return 'destructive'

      case 'MEDIUM':
        return 'secondary'

      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-blue-600">
              CITIZEN SERVICES
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Complaint Management System
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mb-3 flex items-center text-sm text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </button>

            <h2 className="text-3xl font-bold text-slate-900">
              My Complaints
            </h2>

            <p className="mt-2 text-slate-600">
              View and track your submitted complaints.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={fetchComplaints}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-red-600">
                  {error}
                </p>

                <Button
                  variant="outline"
                  onClick={fetchComplaints}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="grid gap-5">
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-5 w-1/3 rounded bg-slate-200" />
                    <div className="h-4 w-1/4 rounded bg-slate-200" />
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading &&
          !error &&
          complaints.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  No complaints found
                </h3>

                <p className="mt-2 max-w-md text-slate-500">
                  You haven't submitted any complaints yet.
                </p>

                <Button
                  className="mt-6"
                  onClick={() =>
                    navigate('/select-department')
                  }
                >
                  Submit a Complaint
                </Button>
              </CardContent>
            </Card>
          )}

        {!isLoading &&
          !error &&
          complaints.length > 0 && (
            <div className="space-y-5">
              {complaints.map((complaint) => (
                <Card
                  key={complaint._id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-blue-600">
                            {complaint.complaintNumber}
                          </span>

                          <Badge
                            variant={getStatusVariant(
                              complaint.status
                            )}
                          >
                            {complaint.status}
                          </Badge>

                          <Badge
                            variant={getPriorityVariant(
                              complaint.priority
                            )}
                          >
                            {complaint.priority}
                          </Badge>
                        </div>

                        <h3 className="mt-3 text-xl font-semibold text-slate-900">
                          {complaint.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {complaint.description}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>
                              {complaint.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {complaint.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(
                                complaint.createdAt
                              )}
                            </span>
                          </div>
                        </div>

                        <p className="mt-4 text-sm text-slate-500">
                          Department:{' '}
                          <span className="font-medium text-slate-700">
                            {complaint.departmentName}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0">
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/complaints/${complaint._id}`,
                              {
                                state: {
                                  complaint,
                                },
                              }
                            )
                          }
                        >
                          View Details
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </main>
    </div>
  )
}

export default MyComplaints