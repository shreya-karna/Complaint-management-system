import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  ArrowLeft,
  ChevronRight,
  Filter,
  MapPin,
} from 'lucide-react'

import {
  getPublicComplaints,
} from '@/services/complaintService'

import provinces from '@/data/provinces.json'
import districts from '@/data/districts.json'
import localLevels from '@/data/localLevels.json'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

function PublicComplaints() {
  const navigate = useNavigate()

  const [complaints, setComplaints] =
    useState([])

  const [filters, setFilters] = useState({
    province: '',
    district: '',
    municipality: '',
    ward: '',
    status: '',
  })

  const [
    availableDistricts,
    setAvailableDistricts,
  ] = useState([])

  const [
    availableMunicipalities,
    setAvailableMunicipalities,
  ] = useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  // ------------------------------------------
  // Province -> District
  // ------------------------------------------

  useEffect(() => {
    if (!filters.province) {
      setAvailableDistricts([])
      return
    }

    const filteredDistricts =
      districts.filter(
        (district) =>
          district.province_code ===
          filters.province
      )

    setAvailableDistricts(
      filteredDistricts
    )
  }, [filters.province])

  // ------------------------------------------
  // District -> Municipality
  // ------------------------------------------

  useEffect(() => {
    if (!filters.district) {
      setAvailableMunicipalities([])
      return
    }

    const filteredMunicipalities =
      localLevels.filter(
        (localLevel) =>
          localLevel.district_code ===
          filters.district
      )

    setAvailableMunicipalities(
      filteredMunicipalities
    )
  }, [filters.district])

  // ------------------------------------------
  // Load complaints
  // ------------------------------------------

  const loadComplaints = async (
    activeFilters = filters
  ) => {
    try {
      setIsLoading(true)
      setError('')

      const response =
        await getPublicComplaints(
          activeFilters
        )

      setComplaints(
        response.complaints || []
      )
    } catch (error) {
      console.error(
        'Failed to load public complaints:',
        error
      )

      setError(
        error.response?.data?.message ||
          'Failed to load complaints.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  // ------------------------------------------
  // Province change
  // ------------------------------------------

  const handleProvinceChange = (
    event
  ) => {
    const provinceCode =
      event.target.value

    setFilters((previous) => ({
      ...previous,
      province: provinceCode,
      district: '',
      municipality: '',
      ward: '',
    }))

    setAvailableMunicipalities([])
  }

  // ------------------------------------------
  // District change
  // ------------------------------------------

  const handleDistrictChange = (
    event
  ) => {
    const districtCode =
      event.target.value

    setFilters((previous) => ({
      ...previous,
      district: districtCode,
      municipality: '',
      ward: '',
    }))
  }

  // ------------------------------------------
  // Municipality change
  // ------------------------------------------

  const handleMunicipalityChange = (
    event
  ) => {
    const municipality =
      event.target.value

    setFilters((previous) => ({
      ...previous,
      municipality,
      ward: '',
    }))
  }

  // ------------------------------------------
  // Ward change
  // ------------------------------------------

  const handleWardChange = (event) => {
    setFilters((previous) => ({
      ...previous,
      ward: event.target.value,
    }))
  }

  // ------------------------------------------
  // Status change
  // ------------------------------------------

  const handleStatusChange = (
    event
  ) => {
    setFilters((previous) => ({
      ...previous,
      status: event.target.value,
    }))
  }

  // ------------------------------------------
  // Apply filters
  // ------------------------------------------

  const handleApplyFilters = () => {
    const params = {
      ...filters,
    }

    // Convert province code to name
    // because complaints are stored
    // using province name.

    const selectedProvince =
      provinces.find(
        (province) =>
          province.code ===
          filters.province
      )

    const selectedDistrict =
      districts.find(
        (district) =>
          district.code ===
          filters.district
      )

    const apiFilters = {
      province:
        selectedProvince?.name_en || '',
      district:
        selectedDistrict?.name_en || '',
      municipality:
        filters.municipality,
      ward: filters.ward,
      status: filters.status,
    }

    loadComplaints(apiFilters)
  }

  // ------------------------------------------
  // Clear filters
  // ------------------------------------------

  const handleClearFilters = () => {
    const clearedFilters = {
      province: '',
      district: '',
      municipality: '',
      ward: '',
      status: '',
    }

    setFilters(clearedFilters)

    setAvailableDistricts([])
    setAvailableMunicipalities([])

    loadComplaints(clearedFilters)
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <div>
            <p className="text-sm font-medium text-blue-600">
              CITIZEN SERVICES
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Local Complaints
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

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Back */}

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

        {/* Heading */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-slate-900">
            Complaints in your area
          </h2>

          <p className="mt-2 text-slate-600">
            View complaints reported in your
            province and filter them by local
            level.
          </p>

        </div>

        {/* Filters */}

        <Card className="mb-8">
          <CardContent className="p-6">

            <div className="mb-5 flex items-center gap-2">

              <Filter
                size={19}
                className="text-slate-600"
              />

              <h3 className="font-semibold text-slate-900">
                Filter complaints
              </h3>

            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

              {/* Province */}

              <div>

                <label
                  htmlFor="province"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Province
                </label>

                <select
                  id="province"
                  value={filters.province}
                  onChange={
                    handleProvinceChange
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    All Provinces
                  </option>

                  {provinces.map(
                    (province) => (
                      <option
                        key={province.code}
                        value={province.code}
                      >
                        {province.name_en}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* District */}

              <div>

                <label
                  htmlFor="district"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  District
                </label>

                <select
                  id="district"
                  value={filters.district}
                  onChange={
                    handleDistrictChange
                  }
                  disabled={
                    !filters.province
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {!filters.province
                      ? 'Select province first'
                      : 'All Districts'}
                  </option>

                  {availableDistricts.map(
                    (district) => (
                      <option
                        key={`${district.province_code}-${district.code}`}
                        value={
                          district.code
                        }
                      >
                        {district.name_en}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* Municipality */}

              <div>

                <label
                  htmlFor="municipality"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Local Level
                </label>

                <select
                  id="municipality"
                  value={
                    filters.municipality
                  }
                  onChange={
                    handleMunicipalityChange
                  }
                  disabled={
                    !filters.district
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {!filters.district
                      ? 'Select district first'
                      : 'All Local Levels'}
                  </option>

                  {availableMunicipalities.map(
                    (
                      municipality,
                      index
                    ) => (
                      <option
                        key={`${municipality.district_code}-${municipality.name_en}-${index}`}
                        value={
                          municipality.name_en
                        }
                      >
                        {municipality.name_en}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* Ward */}

{/* Ward */}

<div>
  <label
    htmlFor="ward"
    className="mb-2 block text-sm font-medium text-slate-700"
  >
    Ward Number
  </label>

  <input
    id="ward"
    name="ward"
    type="number"
    min="1"
    max="35"
    value={filters.ward}
    onChange={handleWardChange}
    disabled={!filters.municipality}
    placeholder={
      !filters.municipality
        ? 'Select local level first'
        : 'Enter ward number'
    }
    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
  />
</div>

              {/* Status */}

              <div>

                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={filters.status}
                  onChange={
                    handleStatusChange
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    All Statuses
                  </option>

                  <option value="SUBMITTED">
                    Submitted
                  </option>

                  <option value="UNDER_REVIEW">
                    Under Review
                  </option>

                  <option value="ASSIGNED">
                    Assigned
                  </option>

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="RESOLVED">
                    Resolved
                  </option>

                  <option value="CLOSED">
                    Closed
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>

                  <option value="REOPENED">
                    Reopened
                  </option>
                </select>

              </div>

            </div>

            {/* Buttons */}

            <div className="mt-5 flex flex-wrap gap-3">

              <Button
                onClick={
                  handleApplyFilters
                }
                className="bg-[#123b63] hover:bg-[#0d2d4c]"
              >
                Apply Filters
              </Button>

              <Button
                variant="outline"
                onClick={
                  handleClearFilters
                }
              >
                Clear Filters
              </Button>

            </div>

          </CardContent>
        </Card>

        {/* Results */}

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h3 className="text-lg font-semibold text-slate-900">
              Complaint Reports
            </h3>

            <p className="text-sm text-slate-500">
              {complaints.length}{' '}
              complaint
              {complaints.length !== 1
                ? 's'
                : ''}{' '}
              found
            </p>

          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}

        {isLoading ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-slate-500">
              Loading complaints...
            </CardContent>
          </Card>
        ) : complaints.length ===
          0 ? (
          <Card>
            <CardContent className="p-10 text-center">

              <MapPin
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-900">
                No complaints found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your filters.
              </p>

            </CardContent>
          </Card>
        ) : (

          <div className="grid gap-5 md:grid-cols-2">

            {complaints.map(
              (complaint) => (

                <Card
                  key={complaint._id}
                  className="transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <CardContent className="p-6">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs font-semibold text-blue-600">
                          {
                            complaint.complaintNumber
                          }
                        </p>

                        <h4 className="mt-2 text-lg font-semibold text-slate-900">
                          {complaint.title}
                        </h4>

                      </div>

                      <Badge
                        variant="outline"
                        className={`shrink-0 rounded-full ${
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

                    <div className="mt-5 space-y-3">

                      <div className="flex items-center gap-2 text-sm text-slate-600">

                        <MapPin size={16} />

                        <span>
                          {complaint.location
                            ? [
                                complaint
                                  .location
                                  .province,

                                complaint
                                  .location
                                  .district,

                                complaint
                                  .location
                                  .municipality,

                                complaint
                                  .location
                                  .ward
                                  ? `Ward ${complaint.location.ward}`
                                  : '',
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  ', '
                                )
                            : 'Location unavailable'}
                        </span>

                      </div>

                      <div className="grid grid-cols-2 gap-4">

                        <div>

                          <p className="text-xs uppercase text-slate-400">
                            Category
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {
                              complaint.category
                            }
                          </p>

                        </div>

                        <div>

                          <p className="text-xs uppercase text-slate-400">
                            Reported
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {formatDate(
                              complaint.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mt-6 border-t pt-4">

                      <Button
                        variant="ghost"
                        className="w-full justify-between"
                        onClick={() =>
                          navigate(
                            `/complaints/${complaint._id}`
                          )
                        }
                      >
                        View Complaint

                        <ChevronRight
                          size={17}
                        />
                      </Button>

                    </div>

                  </CardContent>

                </Card>

              )
            )}

          </div>

        )}

      </main>
    </div>
  )
}

export default PublicComplaints