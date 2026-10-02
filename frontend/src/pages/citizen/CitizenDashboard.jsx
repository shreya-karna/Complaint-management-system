import { useNavigate } from 'react-router-dom'

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
Search,
ShieldCheck,
TrendingUp,
X,
} from 'lucide-react'
import { useState } from 'react'

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


const complaints = [
{
number: 'CMP-2024-0182',
title: 'Street Light Not Working',
department: 'Public Works',
category: 'Infrastructure',
status: 'In Progress',
priority: 'High',
date: '24 May 2024',
},
{
number: 'CMP-2024-0176',
title: 'Garbage Collection Issue',
department: 'Sanitation',
category: 'Waste Management',
status: 'Under Review',
priority: 'Medium',
date: '19 May 2024',
},
{
number: 'CMP-2024-0164',
title: 'Water Supply Problem',
department: 'Water Services',
category: 'Utilities',
status: 'Resolved',
priority: 'High',
date: '12 May 2024',
},
{
number: 'CMP-2024-0151',
title: 'Road Damage',
department: 'Public Works',
category: 'Infrastructure',
status: 'Submitted',
priority: 'Low',
date: '04 May 2024',
},
]

const statusStyles = {
Submitted: 'border-sky-200 bg-sky-50 text-sky-700',
'Under Review': 'border-amber-200 bg-amber-50 text-amber-700',
Assigned: 'border-violet-200 bg-violet-50 text-violet-700',
'In Progress': 'border-blue-200 bg-blue-50 text-blue-700',
Resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
Closed: 'border-slate-200 bg-slate-50 text-slate-700',
Rejected: 'border-rose-200 bg-rose-50 text-rose-700',
Reopened: 'border-orange-200 bg-orange-50 text-orange-700',
}

function StatusBadge({ status }) {
return (
<Badge
variant="outline"
className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ?? ''
      }`}
>
{status} </Badge>
)
}

function StatCard({ label, value, detail, icon: Icon, tone }) {
return ( <Card className="border-border/70 shadow-sm"> <CardContent className="flex items-start justify-between p-5"> <div className="flex flex-col gap-3"> <p className="text-sm font-medium text-muted-foreground">
{label} </p>

```
      <p className="text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>

      <p className="text-xs text-muted-foreground">{detail}</p>
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
const [mobileOpen, setMobileOpen] = useState(false)

return ( <main className="min-h-screen bg-[#f6f8fb] text-foreground"> <header className="border-b border-slate-200 bg-white"> <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10"> <div className="flex items-center gap-3"> <div className="flex size-10 items-center justify-center rounded-xl bg-[#123b63] text-white shadow-sm"> <ShieldCheck aria-hidden="true" /> </div>

        <div>
          <p className="text-sm font-bold tracking-tight text-[#123b63]">
            CITIZEN SERVICES
          </p>
          <p className="text-xs text-muted-foreground">
            Complaint Management System
          </p>
        </div>
      </div>

      <nav
        className="hidden items-center gap-1 md:flex"
        aria-label="Primary navigation"
      >
        <button className="flex items-center gap-2 rounded-lg bg-[#eaf1f8] px-4 py-2.5 text-sm font-medium text-[#123b63]">
          <LayoutDashboard aria-hidden="true" />
          Dashboard
        </button>

        <button type="button" onClick={() => navigate('/my-complaints')} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground">
          <FolderOpen aria-hidden="true" />
          My Complaints
        </button>

        <button className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground">
          <Bell aria-hidden="true" />
          Notifications

          <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-[#dceaf7] text-[10px] font-bold text-[#123b63]">
            3
          </span>
        </button>
      </nav>

      <div className="flex items-center gap-3">
        <Separator
          orientation="vertical"
          className="hidden h-8 sm:block"
        />

        <Avatar className="size-9 border border-slate-200">
          <AvatarFallback className="bg-[#e5eef7] text-xs font-semibold text-[#123b63]">
            JD
          </AvatarFallback>
        </Avatar>

        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-semibold">John Doe</p>
          <p className="text-xs text-muted-foreground">Citizen</p>
        </div>

        <button
          className="hidden text-muted-foreground hover:text-foreground sm:block"
          aria-label="Open profile menu"
        >
          <ChevronDown aria-hidden="true" />
        </button>

        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={
            mobileOpen ? 'Close navigation' : 'Open navigation'
          }
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>
    </div>

    {mobileOpen && (
      <nav
        className="flex flex-col gap-1 border-t border-slate-100 px-5 py-3 md:hidden"
        aria-label="Mobile navigation"
      >
        <button className="flex items-center gap-3 rounded-lg bg-[#eaf1f8] px-3 py-3 text-left text-sm font-medium text-[#123b63]">
          <LayoutDashboard />
          Dashboard
        </button>

        <button className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground">
          <FolderOpen />
          My Complaints
        </button>

        <button className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground">
          <Bell />
          Notifications

          <span className="ml-auto rounded-full bg-[#dceaf7] px-2 py-0.5 text-xs font-bold text-[#123b63]">
            3
          </span>
        </button>
      </nav>
    )}
  </header>

  <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-sm font-medium text-[#52708d]">
          Tuesday, 28 May 2024
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#102d49] sm:text-4xl">
          Welcome back, John!
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Report an issue in your community, track your complaints, and
          stay updated on their progress.
        </p>
      </div>

      <Button onClick={() => navigate('/select-department')} className="w-full bg-[#123b63] px-5 hover:bg-[#0d2d4c] sm:w-auto">
        <FilePlus2 data-icon="inline-start" />
        Submit a Complaint
      </Button>
    </section>

    <section
      className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Complaint statistics"
    >
      <StatCard
        label="Total Complaints"
        value="24"
        detail="All time submissions"
        icon={MessageSquareText}
        tone="bg-[#eaf1f8] text-[#2e638f]"
      />

      <StatCard
        label="Submitted"
        value="05"
        detail="Awaiting review"
        icon={FilePlus2}
        tone="bg-sky-50 text-sky-600"
      />

      <StatCard
        label="In Progress"
        value="08"
        detail="Currently being handled"
        icon={TrendingUp}
        tone="bg-amber-50 text-amber-600"
      />

      <StatCard
        label="Resolved"
        value="11"
        detail="Successfully completed"
        icon={CheckCircle2}
        tone="bg-emerald-50 text-emerald-600"
      />
    </section>

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
            className="hidden text-[#123b63] sm:flex"
          >
            View all
            <ChevronRight data-icon="inline-end" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
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
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 font-medium"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {complaints.map((complaint) => (
                  <tr
                    key={complaint.number}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 font-medium text-[#2e638f]">
                      {complaint.number}
                    </td>

                    <td className="max-w-[190px] px-5 py-4 font-medium text-foreground">
                      {complaint.title}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {complaint.department}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {complaint.category}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={complaint.status} />
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`font-medium ${
                          complaint.priority === 'High'
                            ? 'text-rose-600'
                            : complaint.priority === 'Medium'
                              ? 'text-amber-600'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {complaint.priority}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {complaint.date}
                    </td>

                    <td className="px-5 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#2e638f]"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 p-4 sm:hidden">
            <Button variant="outline" className="w-full">
              View all complaints
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <aside className="flex flex-col gap-6">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="px-5 pb-3 pt-5">
            <CardTitle className="text-lg">Quick actions</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-2 px-5 pb-5">
            <Button onClick={() => navigate('/select-department')} className="justify-start bg-[#123b63] hover:bg-[#0d2d4c]">
              <FilePlus2 data-icon="inline-start" />
              Submit new complaint
              <ChevronRight
                className="ml-auto"
                data-icon="inline-end"
              />
            </Button>

            <Button variant="outline" className="justify-start">
              <FolderOpen data-icon="inline-start" />
              View my complaints
              <ChevronRight
                className="ml-auto"
                data-icon="inline-end"
              />
            </Button>

            <Button variant="outline" className="justify-start">
              <Search data-icon="inline-start" />
              Track a complaint
              <ChevronRight
                className="ml-auto"
                data-icon="inline-end"
              />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#d8e5f0] bg-[#eef5fa] shadow-sm">
          <CardContent className="flex gap-3 p-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#2e638f]">
              <CircleDot aria-hidden="true" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#123b63]">
                Need help?
              </p>

              <p className="mt-1 text-xs leading-5 text-[#52708d]">
                Our support team is available to help you with your
                complaint.
              </p>

              <button className="mt-3 text-xs font-semibold text-[#2e638f] underline underline-offset-4">
                Contact support
              </button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </section>

    <footer className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>© 2024 Citizen Services · Complaint Management System</p>

      <div className="flex gap-4">
        <button className="hover:text-foreground">
          Privacy policy
        </button>

        <button className="hover:text-foreground">
          Help centre
        </button>

        <button className="flex items-center gap-1 hover:text-foreground">
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
