import { useLocation, useNavigate } from 'react-router-dom'
import {
CheckCircle2,
ArrowLeft,
Home,
FileText,
MapPin,
Building2,
Tag,
Calendar,
Clock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
Card,
CardContent,
CardHeader,
CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function ComplaintSubmitted() {
const location = useLocation()
const navigate = useNavigate()

const complaint = location.state?.complaint

if (!complaint) {
return ( <div className="min-h-screen bg-slate-50"> <header className="border-b bg-white"> <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"> <div> <p className="text-sm font-medium text-blue-600">
CITIZEN SERVICES </p>

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

    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-6 py-12">
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-slate-400" />

          <h2 className="text-2xl font-bold text-slate-900">
            Complaint not found
          </h2>

          <p className="mt-2 text-slate-600">
            There is no recently submitted complaint to display.
          </p>

          <Button
            className="mt-6"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </main>
  </div>
)

}

const formattedDate = complaint.createdAt
? new Date(complaint.createdAt).toLocaleDateString(
'en-US',
{
year: 'numeric',
month: 'long',
day: 'numeric',
}
)
: 'N/A'

const formattedTime = complaint.createdAt
? new Date(complaint.createdAt).toLocaleTimeString(
'en-US',
{
hour: '2-digit',
minute: '2-digit',
}
)
: 'N/A'

return ( <div className="min-h-screen bg-slate-50"> <header className="border-b bg-white"> <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"> <div> <p className="text-sm font-medium text-blue-600">
CITIZEN SERVICES </p>


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

  <main className="mx-auto max-w-4xl px-6 py-12">
    <div className="mb-8 text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-11 w-11 text-green-600" />
      </div>

      <h2 className="text-3xl font-bold text-slate-900">
        Complaint Submitted Successfully
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Your complaint has been successfully submitted.
        Please keep your complaint number for future
        reference.
      </p>
    </div>

    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
          Complaint Number
        </p>

        <p className="mt-2 text-3xl font-bold tracking-wide text-blue-900">
          {complaint.complaintNumber}
        </p>

        <p className="mt-2 text-sm text-blue-700">
          Use this number when checking the status of
          your complaint.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Complaint Details</CardTitle>

          <Badge>
            {complaint.status || 'SUBMITTED'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

            <div>
              <p className="text-sm text-slate-500">
                Complaint Title
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {complaint.title}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

            <div>
              <p className="text-sm text-slate-500">
                Department
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {complaint.departmentName}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Tag className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

            <div>
              <p className="text-sm text-slate-500">
                Category
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {complaint.category}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

            <div>
              <p className="text-sm text-slate-500">
                Location
              </p>

              <p className="mt-1 font-medium text-slate-900">
  {complaint.location
    ? [
        complaint.location.province,
        complaint.location.district,
        complaint.location.municipality,
        `Ward ${complaint.location.ward}`,
        complaint.location.tole,
      ]
        .filter(Boolean)
        .join(', ')
    : 'N/A'}
</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

            <div>
              <p className="text-sm text-slate-500">
                Submitted Date
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

            <div>
              <p className="text-sm text-slate-500">
                Submitted Time
              </p>

              <p className="mt-1 font-medium text-slate-900">
                {formattedTime}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-slate-500">
            Description
          </p>

          <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
            {complaint.description}
          </p>
        </div>

        <div className="mt-6 border-t pt-6">
          <p className="text-sm text-slate-500">
            Current Priority
          </p>

          <div className="mt-2">
            <Badge variant="secondary">
              {complaint.priority || 'MEDIUM'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Button
        variant="outline"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Button
        onClick={() => navigate('/my-complaints')}
      >
        <FileText className="mr-2 h-4 w-4" />
        View My Complaints
      </Button>
    </div>
  </main>
</div>

)
}

export default ComplaintSubmitted

