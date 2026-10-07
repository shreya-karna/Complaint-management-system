import {
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  MapPin,
  Bell,
  CheckCircle2,
  ChevronRight,
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
  Star,
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
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ||
        'border-gray-200 bg-gray-50 text-gray-700'
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
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left"
    >
      <Card className="h-full border-slate-200 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-md">
        <CardContent className="flex items-start justify-between p-5">
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
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
          >
            <Icon
              size={21}
              aria-hidden="true"
            />
          </div>
        </CardContent>
      </Card>
    </button>
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
          notificationsResponse.notifications || []
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
        return 'text-slate-500'
    }
  }


  const handleComplaintClick =
    (complaint) => {
      navigate(
        `/complaints/${complaint._id}`,
        {
          state: {
            complaint,
          },
        }
      )
    }


  const handleFeedbackClick =
    (complaint) => {
      navigate(
        `/complaints/${complaint._id}`,
        {
          state: {
            complaint,
            openFeedback: true,
          },
        }
      )
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
    <main className="min-h-screen bg-[#f5f7fa] text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Logo */}
          <div className="flex items-center gap-3">

            <div className="flex size-10 items-center justify-center rounded-xl bg-[#123b63] text-white shadow-sm">
              <ShieldCheck size={21} />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-[#123b63]">
                CITIZEN SERVICES
              </p>

              <p className="text-xs text-slate-500">
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
              className="flex items-center gap-2 rounded-lg bg-[#eaf1f8] px-4 py-2.5 text-sm font-semibold text-[#123b63]"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>


            <button
              type="button"
              onClick={() =>
                navigate('/my-complaints')
              }
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-[#123b63]"
            >
              <FolderOpen size={18} />
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
                className="relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-[#123b63]"
              >
                <Bell size={18} />

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
                <div className="absolute right-0 mt-3 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                  <div className="border-b border-slate-100 px-4 py-4">

                    <div className="flex items-center justify-between">

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Notifications
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {unreadCount} unread
                        </p>
                      </div>

                      <div className="flex size-9 items-center justify-center rounded-lg bg-[#eaf1f8] text-[#123b63]">
                        <Bell size={17} />
                      </div>

                    </div>

                  </div>


                  {notifications.length === 0 ? (

                    <div className="px-4 py-10 text-center">

                      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100">
                        <Bell className="size-6 text-slate-400" />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
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
                            className={`w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
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
                                    {notification.title}
                                  </p>

                                  {!notification.isRead && (
                                    <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-600" />
                                  )}

                                </div>

                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                  {notification.message}
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


          {/* User */}
          <div className="flex items-center gap-3">

            <Separator
              orientation="vertical"
              className="hidden h-8 sm:block"
            />

            <Avatar className="size-9 border border-slate-200">
              <AvatarFallback className="bg-[#e5eef7] text-xs font-bold text-[#123b63]">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {citizenName}
              </p>

              <p className="text-xs text-slate-500">
                Citizen
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:block"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} />
            </button>

            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 md:hidden"
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
            className="border-t border-slate-100 bg-white px-5 py-3 md:hidden"
            aria-label="Mobile navigation"
          >

            <div className="flex flex-col gap-1">

              <button
                type="button"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="flex items-center gap-3 rounded-lg bg-[#eaf1f8] px-3 py-3 text-left text-sm font-semibold text-[#123b63]"
              >
                <LayoutDashboard size={19} />
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  navigate('/my-complaints')
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <FolderOpen size={19} />
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
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Bell size={19} />

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
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={19} />
                Log out
              </button>

            </div>

          </nav>
        )}

      </header>


      {/* MAIN */}
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

        {/* Welcome */}
        <section className="relative overflow-hidden rounded-2xl bg-[#123b63] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">

          <div className="absolute -right-16 -top-20 size-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 right-32 size-48 rounded-full bg-white/5" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div>

              <p className="mb-2 text-sm font-medium text-blue-100">
                {formatCurrentDate()}
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {firstName}!
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
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
              className="w-full shrink-0 bg-white px-5 font-semibold text-[#123b63] shadow-sm hover:bg-blue-50 sm:w-auto"
            >
              <FilePlus2 data-icon="inline-start" />
              Submit a Complaint
            </Button>

          </div>

        </section>


        {/* Error */}
        {error && (
          <Card className="mt-6 border-red-200 bg-red-50 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load dashboard
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={
                  fetchDashboardData
                }
                disabled={isLoading}
                className="border-red-200 bg-white"
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


        {/* STATISTICS */}
        <section
          className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
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
            onClick={() =>
              navigate('/my-complaints')
            }
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
            onClick={() =>
              navigate(
                '/my-complaints?status=SUBMITTED'
              )
            }
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
            onClick={() =>
              navigate(
                '/my-complaints?status=IN_PROGRESS'
              )
            }
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
            onClick={() =>
              navigate(
                '/my-complaints?status=RESOLVED'
              )
            }
          />

        </section>


        {/* CONTENT */}
        <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">

          {/* Recent complaints */}
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">

            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">

              <div>

                <CardTitle className="text-lg font-bold text-slate-900">
                  Recent Complaints
                </CardTitle>

                <p className="mt-1 text-sm text-slate-500">
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
                className="hidden font-semibold text-[#123b63] hover:bg-[#eaf1f8] hover:text-[#123b63] sm:flex"
              >
                View all
                <ChevronRight data-icon="inline-end" />
              </Button>

            </CardHeader>


            <CardContent className="p-0">

              {isLoading ? (

                <div className="space-y-5 p-6">

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

              ) : recentComplaints.length === 0 ? (

                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                  <div className="flex size-16 items-center justify-center rounded-2xl bg-[#eaf1f8]">
                    <MessageSquareText className="size-8 text-[#2e638f]" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    No complaints yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    You haven't submitted any complaints yet. Submit your first complaint to get started.
                  </p>

                  <Button
                    className="mt-5 bg-[#123b63] shadow-sm hover:bg-[#0d2d4c]"
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

                  <table className="w-full min-w-[1000px] text-left text-sm">

                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

                      <tr>
                        {[
                          'Complaint number',
                          'Complaint title',
                          'Department',
                          'Category',
                          'Status',
                          'Priority',
                          'Submitted date',
                          'Action',
                          '',
                        ].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="px-5 py-3 font-semibold"
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
                            className="group transition-colors hover:bg-slate-50"
                          >

                            <td className="px-5 py-4 font-semibold text-[#2e638f]">
                              {
                                complaint.complaintNumber
                              }
                            </td>


                            <td className="max-w-[190px] px-5 py-4">

                              <button
                                type="button"
                                onClick={() =>
                                  handleComplaintClick(
                                    complaint
                                  )
                                }
                                className="font-semibold text-slate-800 transition hover:text-[#2e638f]"
                              >
                                {
                                  complaint.title
                                }
                              </button>

                            </td>


                            <td className="px-5 py-4 text-slate-500">
                              {
                                complaint.departmentName ||
                                'N/A'
                              }
                            </td>


                            <td className="px-5 py-4 text-slate-500">
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
                                className={`font-semibold ${getPriorityClass(
                                  complaint.priority
                                )}`}
                              >
                                {
                                  complaint.priority
                                }
                              </span>

                            </td>


                            <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                              {formatDate(
                                complaint.createdAt
                              )}
                            </td>


                            {/* View button */}
                            <td className="px-5 py-4">

                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-semibold text-[#2e638f] hover:bg-[#eaf1f8] hover:text-[#123b63]"
                                onClick={() =>
                                  handleComplaintClick(
                                    complaint
                                  )
                                }
                              >
                                View
                              </Button>

                            </td>


                            {/* Feedback button */}
                            <td className="px-5 py-4">

                              {[
                                'RESOLVED',
                                'CLOSED',
                              ].includes(
                                complaint.status
                              ) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleFeedbackClick(
                                      complaint
                                    )
                                  }
                                  className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                >
                                  <Star
                                    size={15}
                                    className="mr-1.5"
                                  />

                                  Feedback
                                </Button>
                              )}

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
            <Card className="border-slate-200 bg-white shadow-sm">

              <CardHeader className="px-5 pb-3 pt-5">

                <CardTitle className="text-lg font-bold text-slate-900">
                  Quick Actions
                </CardTitle>

              </CardHeader>


              <CardContent className="flex flex-col gap-2 px-5 pb-5">

                <Button
                  variant="outline"
                  onClick={() =>
                    navigate('/public-complaints')
                  }
                  className="h-11 justify-start border-slate-200 font-medium hover:border-slate-300 hover:bg-slate-50"
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
                  className="h-11 justify-start bg-[#123b63] font-medium shadow-sm hover:bg-[#0d2d4c]"
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
                  className="h-11 justify-start border-slate-200 font-medium hover:border-slate-300 hover:bg-slate-50"
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
                  className="h-11 justify-start border-slate-200 font-medium hover:border-slate-300 hover:bg-slate-50"
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

          </aside>

        </section>


        {/* FOOTER */}
        <footer className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} Citizen
            Services · Complaint Management System
          </p>


          <div className="flex gap-4">

            <button
              type="button"
              className="transition hover:text-slate-800"
            >
              Privacy policy
            </button>


            <button
              type="button"
              className="transition hover:text-slate-800"
            >
              Help centre
            </button>


            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 transition hover:text-slate-800"
            >
              <LogOut size={14} />
              Log out
            </button>

          </div>

        </footer>

      </div>

    </main>
  )
}


export default CitizenDashboard