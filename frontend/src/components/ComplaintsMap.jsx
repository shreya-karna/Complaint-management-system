import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

const COLORS = {
  CRITICAL: '#7f1d1d',
  HIGH: '#d93025',
  MEDIUM: '#f9ab00',
  LOW: '#188038',
}

const PRIORITY_LABELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

const STATUS_LABELS = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
  REOPENED: 'Reopened',
  DUPLICATE: 'Duplicate',
}

const formatDate = (date) => {
  if (!date) return 'N/A'

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getDepartmentName = (complaint) => {
  return (
    complaint.department?.name ||
    complaint.departmentName ||
    complaint.department?.departmentName ||
    'N/A'
  )
}

const MapBounds = ({ complaints }) => {
  const map = useMap()

  useEffect(() => {
    if (!complaints.length) return

    const bounds = complaints.map((complaint) => [
      complaint.coordinates.lat,
      complaint.coordinates.lng,
    ])

    if (bounds.length === 1) {
      map.setView(bounds[0], 14)
      return
    }

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
    })
  }, [complaints, map])

  return null
}

export default function ComplaintsMap({
  complaints = [],
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const items = complaints.filter(
    (complaint) =>
      complaint.coordinates?.lat != null &&
      complaint.coordinates?.lng != null
  )

  const isStaffMap =
    location.pathname.startsWith('/staff')

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          No complaints with a map location yet.
        </p>
      </div>
    )
  }

  const center = [
    items[0].coordinates.lat,
    items[0].coordinates.lng,
  ]

  return (
    <div className="relative h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBounds complaints={items} />

        {items.map((complaint) => {
          const priority =
            complaint.priority || 'LOW'

          const color =
            COLORS[priority] || '#666666'

          return (
            <CircleMarker
              key={complaint._id}
              center={[
                complaint.coordinates.lat,
                complaint.coordinates.lng,
              ]}
              radius={11}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: color,
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <div className="min-w-[230px]">
                  <p className="text-sm font-semibold text-[#123b63]">
                    {complaint.complaintNumber ||
                      'No complaint number'}
                  </p>

                  <h3 className="mt-1 text-sm font-semibold text-gray-900">
                    {complaint.title ||
                      'Untitled complaint'}
                  </h3>

                  {complaint.aiSummary && (
                    <p className="mt-2 text-xs leading-5 text-gray-600">
                      {complaint.aiSummary}
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <p>
                      <span className="font-medium">
                        Priority:
                      </span>{' '}
                      <span
                        className="font-semibold"
                        style={{ color }}
                      >
                        {PRIORITY_LABELS[
                          priority
                        ] || priority}
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">
                        Status:
                      </span>{' '}
                      {STATUS_LABELS[
                        complaint.status
                      ] || complaint.status || 'N/A'}
                    </p>

                    <p>
                      <span className="font-medium">
                        Department:
                      </span>{' '}
                      {getDepartmentName(complaint)}
                    </p>

                    <p>
                      <span className="font-medium">
                        Submitted:
                      </span>{' '}
                      {formatDate(
                        complaint.createdAt
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `${isStaffMap ? '/staff' : '/admin'}/complaints/${complaint._id}`
                      )
                    }
                    className="w-full px-3 py-2 mt-3 text-xs font-medium text-white bg-black rounded-lg transition hover:bg-gray-800"
                  >
                    View Complaint
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Priority Legend */}
      <div className="absolute z-[1000] top-4 right-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="mb-2 text-xs font-semibold text-gray-900">
          Priority
        </p>

        <div className="space-y-1.5">
          {Object.entries(COLORS).map(
            ([priority, color]) => (
              <div
                key={priority}
                className="flex items-center gap-2"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                />

                <span className="text-xs text-gray-600">
                  {PRIORITY_LABELS[priority]}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}