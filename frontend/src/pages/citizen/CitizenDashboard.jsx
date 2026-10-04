import {
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  MapPin,
} from 'lucide-react'

import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  FilePlus2,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import {
  getComplaints,
  getComplaintById,
} from '@/services/complaintService'

import {
  getNotifications,
  markNotificationAsRead,
} from '@/services/notificationService'


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


function StatusBadge({ status }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ?? ''
      }`}
    >
      {formatStatus(status)}
    </Badge>
  )
}


function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-start justify-between p-5">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>

          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>

          <p className="text-xs text-muted-foreground">
            {detail}
          </p>
        </div>

        <div
          className={`flex size-11 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  )
}


function CitizenDashboard() {
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] =
    useState(false)

  const [complaints, setComplaints] =
    useState([])

  const [notifications, setNotifications] =
    useState([])

  const [user, setUser] = useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false)


  useEffect(() => {
    const storedUser =
      localStorage.getItem('user')

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error(
          'Failed to parse stored user:',
          error
        )
      }
    }
  }, [])


  const fetchDashboardData =
    async () => {
      try {
        setIsLoading(true)
        setError('')

        const [
          complaintsResponse,
          notificationsResponse,
        ] = await Promise.all([
          getComplaints(),
          getNotifications(),
        ])

        setComplaints(
          complaintsResponse.complaints || []
        )

        setNotifications(
          notificationsResponse.notifications ||
            []
        )
      } catch (error) {
        console.error(
          'Failed to load citizen dashboard:',
          error
        )

        setError(
          error.response?.data?.message ||
            'Failed to load dashboard data. Please try again.'
        )
      } finally {
        setIsLoading(false)
      }
    }


  useEffect(() => {
    fetchDashboardData()
  }, [])


  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length


  const totalComplaints =
    complaints.length


  const submittedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === 'SUBMITTED'
    ).length


  const inProgressComplaints =
    complaints.filter((complaint) =>
      [
        'UNDER_REVIEW',
        'ASSIGNED',
        'IN_PROGRESS',
      ].includes(complaint.status)
    ).length


  const resolvedComplaints =
    complaints.filter((complaint) =>
      [
        'RESOLVED',
        'CLOSED',
      ].includes(complaint.status)
    ).length


  const recentComplaints =
    complaints.slice(0, 5)


  const citizenName =
    user?.name || 'Citizen'


  const firstName =
    citizenName.split(' ')[0]


  const initials =
    citizenName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name.charAt(0).toUpperCase()
      )
      .join('') || 'C'


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


  const formatCurrentDate = () => {
    return new Date().toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    )
  }


  const getPriorityClass = (
    priority
  ) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return 'text-rose-600'

      case 'MEDIUM':
        return 'text-amber-600'

      default:
        return 'text-muted-foreground'
    }
  }


  const getComplaintLocation = (
    location
  ) => {
    if (!location) {
      return 'N/A'
    }

    if (typeof location === 'string') {
      return location
    }

    return [
      location.province,
      location.district,
      location.municipality,
      location.ward
        ? `Ward ${location.ward}`
        : '',
      location.tole,
    ]
      .filter(Boolean)
      .join(', ')
  }


  const handleComplaintClick =
    async (complaint) => {
      try {
        /*
         * We already have the complaint object
         * from the dashboard API, so pass it
         * through navigation to avoid an
         * unnecessary API request.
         */
        navigate(
          `/complaints/${complaint._id}`,
          {
            state: {
              complaint,
            },
          }
        )
      } catch (error) {
        console.error(
          'Failed to open complaint:',
          error
        )
      }
    }


  const handleNotificationClick =
    async (notification) => {
      try {
        if (!notification.isRead) {
          await markNotificationAsRead(
            notification._id
          )

          setNotifications(
            (current) =>
              current.map((item) =>
                item._id ===
                notification._id
                  ? {
                      ...item,
                      isRead: true,
                    }
                  : item
              )
          )
        }

        setShowNotifications(false)

        if (
          notification.complaintId?._id
        ) {
          navigate(
            `/complaints/${notification.complaintId._id}`
          )
        }
      } catch (error) {
        console.error(
          'Failed to open notification:',
          error
        )
      }
    }


  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }


  return (
    <main className="min-h-screen bg-[#f6f8fb] text-foreground">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#123b63] text-white shadow-sm">
              <ShieldCheck aria-hidden="true" />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-[#123b63]">
                CITIZEN SERVICES
              </p>

              <p className="text-xs text-muted-foreground">
                Complaint Management System
              </p>
            </div>
          </div>


          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >

            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-[#eaf1f8] px-4 py-2.5 text-sm font-medium text-[#123b63]"
            >
              <LayoutDashboard aria-hidden="true" />
              Dashboard
            </button>


            <button
              type="button"
              onClick={() =>
                navigate('/my-complaints')
              }
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground"
            >
              <FolderOpen aria-hidden="true" />
              My Complaints
            </button>


            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (current) =>
                      !current
                  )
                }
                className="relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground"
              >
                <Bell aria-hidden="true" />

                Notifications

                {unreadCount > 0 && (
                  <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-[#dceaf7] text-[10px] font-bold text-[#123b63]">
                    {unreadCount > 9
                      ? '9+'
                      : unreadCount}
                  </span>
                )}
              </button>


              {showNotifications && (
                <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                  <div className="border-b px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Notifications
                        </h3>

                        <p className="text-xs text-slate-500">
                          {unreadCount}{' '}
                          unread
                        </p>
                      </div>

                      <Bell
                        size={18}
                        className="text-[#123b63]"
                      />
                    </div>
                  </div>


                  {notifications.length ===
                  0 ? (
                    <div className="px-4 py-10 text-center">
                      <Bell className="mx-auto mb-3 size-8 text-slate-300" />

                      <p className="text-sm font-medium text-slate-700">
                        No notifications
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        You're all caught up.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">

                      {notifications.map(
                        (notification) => (
                          <button
                            key={
                              notification._id
                            }
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`w-full border-b px-4 py-4 text-left transition hover:bg-slate-50 ${
                              !notification.isRead
                                ? 'bg-blue-50/60'
                                : 'bg-white'
                            }`}
                          >
                            <div className="flex gap-3">

                              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eaf1f8] text-[#123b63]">
                                <Bell size={16} />
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {
                                      notification.title
                                    }
                                  </p>

                                  {!notification.isRead && (
                                    <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-600" />
                                  )}
                                </div>

                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                  {
                                    notification.message
                                  }
                                </p>

                                <p className="mt-2 text-[11px] text-slate-400">
                                  {formatDate(
                                    notification.createdAt
                                  )}
                                </p>

                              </div>
                            </div>
                          </button>
                        )
                      )}

                    </div>
                  )}

                </div>
              )}
            </div>

          </nav>


          {/* User section */}
          <div className="flex items-center gap-3">

            <Separator
              orientation="vertical"
              className="hidden h-8 sm:block"
            />


            <Avatar className="size-9 border border-slate-200">
              <AvatarFallback className="bg-[#e5eef7] text-xs font-semibold text-[#123b63]">
                {initials}
              </AvatarFallback>
            </Avatar>


            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold">
                {citizenName}
              </p>

              <p className="text-xs text-muted-foreground">
                Citizen
              </p>
            </div>


            <button
              type="button"
              onClick={handleLogout}
              className="hidden text-muted-foreground hover:text-foreground sm:block"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} />
            </button>


            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground hover:bg-slate-100 md:hidden"
              onClick={() =>
                setMobileOpen(
                  !mobileOpen
                )
              }
              aria-label={
                mobileOpen
                  ? 'Close navigation'
                  : 'Open navigation'
              }
            >
              {mobileOpen ? (
                <X />
              ) : (
                <Menu />
              )}
            </button>

          </div>

        </div>


        {/* MOBILE NAVIGATION */}
        {mobileOpen && (
          <nav
            className="flex flex-col gap-1 border-t border-slate-100 px-5 py-3 md:hidden"
            aria-label="Mobile navigation"
          >

            <button
              type="button"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex items-center gap-3 rounded-lg bg-[#eaf1f8] px-3 py-3 text-left text-sm font-medium text-[#123b63]"
            >
              <LayoutDashboard />
              Dashboard
            </button>


            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                navigate('/my-complaints')
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground"
            >
              <FolderOpen />
              My Complaints
            </button>


            <button
              type="button"
              onClick={() =>
                setShowNotifications(
                  (current) =>
                    !current
                )
              }
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground"
            >
              <Bell />

              Notifications

              {unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-[#dceaf7] px-2 py-0.5 text-xs font-bold text-[#123b63]">
                  {unreadCount}
                </span>
              )}
            </button>


            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-rose-600"
            >
              <LogOut />

              Log out
            </button>

          </nav>
        )}

      </header>


      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

        {/* Welcome section */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="mb-2 text-sm font-medium text-[#52708d]">
              {formatCurrentDate()}
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#102d49] sm:text-4xl">
              Welcome back,{' '}
              {firstName}!
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Report an issue in your community,
              track your complaints, and stay
              updated on their progress.
            </p>
          </div>


          <Button
            onClick={() =>
              navigate(
                '/select-department'
              )
            }
            className="w-full bg-[#123b63] px-5 hover:bg-[#0d2d4c] sm:w-auto"
          >
            <FilePlus2 data-icon="inline-start" />

            Submit a Complaint
          </Button>

        </section>


        {/* Error */}
        {error && (
          <Card className="mt-8 border-red-200 bg-red-50">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-red-700">
                {error}
              </p>

              <Button
                variant="outline"
                onClick={
                  fetchDashboardData
                }
                disabled={isLoading}
              >
                <RefreshCw
                  className={
                    isLoading
                      ? 'mr-2 animate-spin'
                      : 'mr-2'
                  }
                  size={16}
                />

                Try Again
              </Button>
            </CardContent>
          </Card>
        )}


        {/* Statistics */}
        <section
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Complaint statistics"
        >

          <StatCard
            label="Total Complaints"
            value={
              isLoading
                ? '—'
                : totalComplaints
            }
            detail="All your submissions"
            icon={MessageSquareText}
            tone="bg-[#eaf1f8] text-[#2e638f]"
          />


          <StatCard
            label="Submitted"
            value={
              isLoading
                ? '—'
                : submittedComplaints
            }
            detail="Awaiting review"
            icon={FilePlus2}
            tone="bg-sky-50 text-sky-600"
          />


          <StatCard
            label="In Progress"
            value={
              isLoading
                ? '—'
                : inProgressComplaints
            }
            detail="Currently being handled"
            icon={TrendingUp}
            tone="bg-amber-50 text-amber-600"
          />


          <StatCard
            label="Resolved"
            value={
              isLoading
                ? '—'
                : resolvedComplaints
            }
            detail="Successfully completed"
            icon={CheckCircle2}
            tone="bg-emerald-50 text-emerald-600"
          />

        </section>


        {/* Recent complaints */}
        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">

          <Card className="overflow-hidden border-border/70 shadow-sm">

            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">

              <div>
                <CardTitle className="text-lg">
                  Recent complaints
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  A quick overview of your latest submissions
                </p>
              </div>


              <Button
                variant="ghost"
                onClick={() =>
                  navigate(
                    '/my-complaints'
                  )
                }
                className="hidden text-[#123b63] sm:flex"
              >
                View all

                <ChevronRight data-icon="inline-end" />
              </Button>

            </CardHeader>


            <CardContent className="p-0">

              {isLoading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className="animate-pulse space-y-3"
                      >
                        <div className="h-4 w-32 rounded bg-slate-200" />

                        <div className="h-5 w-2/3 rounded bg-slate-200" />

                        <div className="h-4 w-1/3 rounded bg-slate-200" />
                      </div>
                    )
                  )}
                </div>
              ) : recentComplaints.length ===
                0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

                  <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-slate-100">
                    <MessageSquareText className="size-7 text-slate-400" />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900">
                    No complaints yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    You haven't submitted any complaints yet.
                  </p>

                  <Button
                    className="mt-5 bg-[#123b63] hover:bg-[#0d2d4c]"
                    onClick={() =>
                      navigate(
                        '/select-department'
                      )
                    }
                  >
                    <FilePlus2 className="mr-2 size-4" />

                    Submit a Complaint
                  </Button>

                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px] text-left text-sm">

                    <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-muted-foreground">

                      <tr>
                        {[
                          'Complaint number',
                          'Complaint title',
                          'Department',
                          'Category',
                          'Status',
                          'Priority',
                          'Submitted date',
                          '',
                        ].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="px-5 py-3 font-medium"
                            >
                              {heading}
                            </th>
                          )
                        )}
                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-100">

                      {recentComplaints.map(
                        (complaint) => (
                          <tr
                            key={
                              complaint._id
                            }
                            className="transition-colors hover:bg-slate-50/70"
                          >

                            <td className="px-5 py-4 font-medium text-[#2e638f]">
                              {
                                complaint.complaintNumber
                              }
                            </td>


                            <td className="max-w-[190px] px-5 py-4 font-medium text-foreground">
                              <button
                                type="button"
                                onClick={() =>
                                  handleComplaintClick(
                                    complaint
                                  )
                                }
                                className="text-left hover:text-[#2e638f]"
                              >
                                {
                                  complaint.title
                                }
                              </button>
                            </td>


                            <td className="px-5 py-4 text-muted-foreground">
                              {
                                complaint.departmentName ||
                                'N/A'
                              }
                            </td>


                            <td className="px-5 py-4 text-muted-foreground">
                              {
                                complaint.category ||
                                'N/A'
                              }
                            </td>


                            <td className="px-5 py-4">
                              <StatusBadge
                                status={
                                  complaint.status
                                }
                              />
                            </td>


                            <td className="px-5 py-4">
                              <span
                                className={`font-medium ${getPriorityClass(
                                  complaint.priority
                                )}`}
                              >
                                {
                                  complaint.priority
                                }
                              </span>
                            </td>


                            <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                              {formatDate(
                                complaint.createdAt
                              )}
                            </td>


                            <td className="px-5 py-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#2e638f]"
                                onClick={() =>
                                  handleComplaintClick(
                                    complaint
                                  )
                                }
                              >
                                View
                              </Button>
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}


              <div className="border-t border-slate-100 p-4 sm:hidden">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navigate(
                      '/my-complaints'
                    )
                  }
                >
                  View all complaints

                  <ChevronRight data-icon="inline-end" />
                </Button>
              </div>

            </CardContent>
          </Card>


          {/* RIGHT SIDEBAR */}
          <aside className="flex flex-col gap-6">

            {/* Quick actions */}
            <Card className="border-border/70 shadow-sm">

              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="text-lg">
                  Quick actions
                </CardTitle>
              </CardHeader>


              <CardContent className="flex flex-col gap-2 px-5 pb-5">

    <Button
  variant="outline"
  onClick={() =>
    navigate('/public-complaints')
  }
  className="justify-start"
>
  <MapPin data-icon="inline-start" />

  View local complaints

  <ChevronRight
    className="ml-auto"
    data-icon="inline-end"
  />
</Button>            

                <Button
                  onClick={() =>
                    navigate(
                      '/select-department'
                    )
                  }
                  className="justify-start bg-[#123b63] hover:bg-[#0d2d4c]"
                >
                  <FilePlus2 data-icon="inline-start" />

                  Submit new complaint

                  <ChevronRight
                    className="ml-auto"
                    data-icon="inline-end"
                  />
                </Button>


                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      '/my-complaints'
                    )
                  }
                  className="justify-start"
                >
                  <FolderOpen data-icon="inline-start" />

                  View my complaints

                  <ChevronRight
                    className="ml-auto"
                    data-icon="inline-end"
                  />
                </Button>


                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      '/track-complaint'
                    )
                  }
                  className="justify-start"
                >
                  <Search data-icon="inline-start" />

                  Track a complaint

                  <ChevronRight
                    className="ml-auto"
                    data-icon="inline-end"
                  />
                </Button>

              </CardContent>
            </Card>


            {/* Notification summary */}
            <Card className="border-[#d8e5f0] bg-[#eef5fa] shadow-sm">

              <CardContent className="flex gap-3 p-5">

                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#2e638f]">
                  <Bell aria-hidden="true" />
                </div>


                <div>
                  <p className="text-sm font-semibold text-[#123b63]">
                    Notifications
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#52708d]">
                    {unreadCount > 0
                      ? `You have ${unreadCount} unread notification${
                          unreadCount ===
                          1
                            ? ''
                            : 's'
                        }.`
                      : 'You have no unread notifications.'}
                  </p>


                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifications(
                        true
                      )
                    }
                    className="mt-3 text-xs font-semibold text-[#2e638f] underline underline-offset-4"
                  >
                    View notifications
                  </button>
                </div>

              </CardContent>
            </Card>

          </aside>

        </section>


        {/* FOOTER */}
        <footer className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} Citizen
            Services · Complaint Management System
          </p>


          <div className="flex gap-4">

            <button
              type="button"
              className="hover:text-foreground"
            >
              Privacy policy
            </button>


            <button
              type="button"
              className="hover:text-foreground"
            >
              Help centre
            </button>


            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 hover:text-foreground"
            >
              <LogOut />

              Log out
            </button>

          </div>

        </footer>

      </div>

    </main>
  )
}


export default CitizenDashboard