import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import provinces from '../../data/provinces.json'
import districts from '../../data/districts.json'
import localLevels from '../../data/localLevels.json'

import { createUser } from '../../services/userService'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    citizenshipNumber: '',
    citizenshipIssueDate: '',
    citizenshipIssueDistrict: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    address: {
      province: '',
      district: '',
      municipality: '',
      ward: '',
      tole: '',
      houseNumber: '',
    },

    currentAddress: {
      province: '',
      district: '',
      municipality: '',
      ward: '',
      tole: '',
      houseNumber: '',
    },
  })

  const [sameAsPermanent, setSameAsPermanent] = useState(false)

  const [districtOptions, setDistrictOptions] = useState([])
  const [municipalityOptions, setMunicipalityOptions] = useState([])

  const [currentDistrictOptions, setCurrentDistrictOptions] = useState([])
  const [currentMunicipalityOptions, setCurrentMunicipalityOptions] =
    useState([])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Permanent address - district options
  useEffect(() => {
    if (!formData.address.province) {
      setDistrictOptions([])
      return
    }

    const filtered = districts.filter(
      (district) =>
        district.province_code === formData.address.province
    )

    setDistrictOptions(filtered)
  }, [formData.address.province])

  // Permanent address - municipality options
  useEffect(() => {
    if (!formData.address.district) {
      setMunicipalityOptions([])
      return
    }

    const filtered = localLevels.filter(
      (localLevel) =>
        localLevel.district_code === formData.address.district
    )

    setMunicipalityOptions(filtered)
  }, [formData.address.district])

  // Current address - district options
  useEffect(() => {
    if (!formData.currentAddress.province) {
      setCurrentDistrictOptions([])
      return
    }

    const filtered = districts.filter(
      (district) =>
        district.province_code === formData.currentAddress.province
    )

    setCurrentDistrictOptions(filtered)
  }, [formData.currentAddress.province])

  // Current address - municipality options
  useEffect(() => {
    if (!formData.currentAddress.district) {
      setCurrentMunicipalityOptions([])
      return
    }

    const filtered = localLevels.filter(
      (localLevel) =>
        localLevel.district_code === formData.currentAddress.district
    )

    setCurrentMunicipalityOptions(filtered)
  }, [formData.currentAddress.district])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError('')
  }

  const handleAddressChange = (type, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }))

    setError('')
  }

  const handlePermanentProvinceChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        province: value,
        district: '',
        municipality: '',
        ward: '',
      },
    }))

    setError('')
  }

  const handlePermanentDistrictChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        district: value,
        municipality: '',
        ward: '',
      },
    }))

    setError('')
  }

  const handleCurrentProvinceChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        province: value,
        district: '',
        municipality: '',
        ward: '',
      },
    }))

    setError('')
  }

  const handleCurrentDistrictChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        district: value,
        municipality: '',
        ward: '',
      },
    }))

    setError('')
  }

  const handleSameAddressChange = (checked) => {
    setSameAsPermanent(checked)

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        currentAddress: {
          ...prev.address,
        },
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!formData.phone.trim()) {
      setError('Please enter your phone number.')
      return
    }

    if (!formData.password) {
      setError('Please enter a password.')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!formData.address.province) {
      setError('Please select your permanent province.')
      return
    }

    if (!formData.address.district) {
      setError('Please select your permanent district.')
      return
    }

    if (!formData.address.municipality) {
      setError('Please select your permanent municipality.')
      return
    }

    if (!formData.address.ward) {
      setError('Please enter your permanent ward number.')
      return
    }

    setLoading(true)

    try {
      const selectedProvince = provinces.find(
        (province) => province.code === formData.address.province
      )

      const selectedDistrict = districts.find(
        (district) => district.code === formData.address.district
      )

      const selectedMunicipality = municipalityOptions.find(
        (municipality) => municipality.code === formData.address.municipality
      )

      let currentAddressData = formData.currentAddress

      if (sameAsPermanent) {
        currentAddressData = formData.address
      }

      const selectedCurrentProvince = provinces.find(
        (province) =>
          province.code === currentAddressData.province
      )

      const selectedCurrentDistrict = districts.find(
        (district) =>
          district.code === currentAddressData.district
      )

      const selectedCurrentMunicipality = currentMunicipalityOptions.find(
        (municipality) =>
          municipality.code === currentAddressData.municipality
      )

      const issueDistrict = districts.find(
        (district) =>
          district.code === formData.citizenshipIssueDistrict
      )

      const userData = {
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,

        citizenshipNumber:
          formData.citizenshipNumber.trim(),

        citizenshipIssueDate:
          formData.citizenshipIssueDate,

        citizenshipIssueDistrict:
          issueDistrict?.name_en || '',

        email: formData.email.trim(),
        phone: formData.phone.trim(),

        password: formData.password,

        role: 'CITIZEN',

        address: {
          province: selectedProvince?.name_en || '',
          district: selectedDistrict?.name_en || '',
          municipality:
            selectedMunicipality?.name_en || '',
          ward: formData.address.ward.trim(),
          tole: formData.address.tole.trim(),
          houseNumber:
            formData.address.houseNumber.trim(),
        },

        currentAddress: {
          province:
            selectedCurrentProvince?.name_en || '',
          district:
            selectedCurrentDistrict?.name_en || '',
          municipality:
            selectedCurrentMunicipality?.name_en || '',
          ward: currentAddressData.ward.trim(),
          tole: currentAddressData.tole.trim(),
          houseNumber:
            currentAddressData.houseNumber.trim(),
        },
      }

      await createUser(userData)

      setSuccess(
        'Registration successful. You can now log in to your account.'
      )

      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration failed. Please try again.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  const selectClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Citizen Account
          </h1>

          <p className="mt-2 text-gray-600">
            Register to submit and track your complaints.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-md md:p-8"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Personal Information */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Personal Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Gender
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">
                    Prefer not to say
                  </option>
                </select>
              </div>
            </div>
          </section>

          <hr className="my-8" />

          {/* Citizenship Information */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Citizenship Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Citizenship Number
                </label>

                <input
                  type="text"
                  name="citizenshipNumber"
                  value={formData.citizenshipNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter citizenship number"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Citizenship Issue Date
                </label>

                <input
                  type="date"
                  name="citizenshipIssueDate"
                  value={formData.citizenshipIssueDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Citizenship Issue District
                </label>

                <select
                  value={formData.citizenshipIssueDistrict}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      citizenshipIssueDistrict:
                        e.target.value,
                    }))
                  }
                  className={selectClass}
                >
                  <option value="">
                    Select district
                  </option>

                  {districts.map((district) => (
                    <option
                      key={district.code}
                      value={district.code}
                    >
                      {district.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <hr className="my-8" />

          {/* Contact Information */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Contact Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email Address *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>
          </section>

          <hr className="my-8" />

          {/* Permanent Address */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Permanent Address
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Province *
                </label>

                <select
                  value={formData.address.province}
                  onChange={(e) =>
                    handlePermanentProvinceChange(
                      e.target.value
                    )
                  }
                  className={selectClass}
                >
                  <option value="">
                    Select province
                  </option>

                  {provinces.map((province) => (
                    <option
                      key={province.code}
                      value={province.code}
                    >
                      {province.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  District *
                </label>

                <select
                  value={formData.address.district}
                  onChange={(e) =>
                    handlePermanentDistrictChange(
                      e.target.value
                    )
                  }
                  className={selectClass}
                  disabled={!formData.address.province}
                >
                  <option value="">
                    Select district
                  </option>

                  {districtOptions.map((district) => (
                    <option
                      key={district.code}
                      value={district.code}
                    >
                      {district.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Municipality / Rural Municipality *
                </label>

                <select
                  value={formData.address.municipality}
                  onChange={(e) =>
                    handleAddressChange(
                      'address',
                      'municipality',
                      e.target.value
                    )
                  }
                  className={selectClass}
                  disabled={!formData.address.district}
                >
                  <option value="">
                    Select municipality
                  </option>

                  {municipalityOptions.map((municipality) => (
                    <option
                      key={municipality.code}
                      value={municipality.code}
                    >
                      {municipality.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Ward Number *
                </label>

                <input
                  type="text"
                  value={formData.address.ward}
                  onChange={(e) =>
                    handleAddressChange(
                      'address',
                      'ward',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Ward number"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tole / Street
                </label>

                <input
                  type="text"
                  value={formData.address.tole}
                  onChange={(e) =>
                    handleAddressChange(
                      'address',
                      'tole',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Tole / street"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  House Number
                </label>

                <input
                  type="text"
                  value={formData.address.houseNumber}
                  onChange={(e) =>
                    handleAddressChange(
                      'address',
                      'houseNumber',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="House number"
                />
              </div>
            </div>
          </section>

          <hr className="my-8" />

          {/* Current Address */}
          <section>
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Current Address
              </h2>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={sameAsPermanent}
                  onChange={(e) =>
                    handleSameAddressChange(
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                Same as permanent address
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Province
                </label>

                <select
                  value={
                    formData.currentAddress.province
                  }
                  onChange={(e) =>
                    handleCurrentProvinceChange(
                      e.target.value
                    )
                  }
                  className={selectClass}
                  disabled={sameAsPermanent}
                >
                  <option value="">
                    Select province
                  </option>

                  {provinces.map((province) => (
                    <option
                      key={province.code}
                      value={province.code}
                    >
                      {province.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  District
                </label>

                <select
                  value={
                    formData.currentAddress.district
                  }
                  onChange={(e) =>
                    handleCurrentDistrictChange(
                      e.target.value
                    )
                  }
                  className={selectClass}
                  disabled={
                    sameAsPermanent ||
                    !formData.currentAddress.province
                  }
                >
                  <option value="">
                    Select district
                  </option>

                  {currentDistrictOptions.map(
                    (district) => (
                      <option
                        key={district.code}
                        value={district.code}
                      >
                        {district.name_en}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Municipality / Rural Municipality
                </label>

                <select
                  value={
                    formData.currentAddress
                      .municipality
                  }
                  onChange={(e) =>
                    handleAddressChange(
                      'currentAddress',
                      'municipality',
                      e.target.value
                    )
                  }
                  className={selectClass}
                  disabled={
                    sameAsPermanent ||
                    !formData.currentAddress.district
                  }
                >
                  <option value="">
                    Select municipality
                  </option>

                  {currentMunicipalityOptions.map(
                    (municipality) => (
                      <option
                        key={municipality.code}
                        value={municipality.code}
                      >
                        {municipality.name_en}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Ward Number
                </label>

                <input
                  type="text"
                  value={
                    formData.currentAddress.ward
                  }
                  onChange={(e) =>
                    handleAddressChange(
                      'currentAddress',
                      'ward',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Ward number"
                  disabled={sameAsPermanent}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tole / Street
                </label>

                <input
                  type="text"
                  value={
                    formData.currentAddress.tole
                  }
                  onChange={(e) =>
                    handleAddressChange(
                      'currentAddress',
                      'tole',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Tole / street"
                  disabled={sameAsPermanent}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  House Number
                </label>

                <input
                  type="text"
                  value={
                    formData.currentAddress.houseNumber
                  }
                  onChange={(e) =>
                    handleAddressChange(
                      'currentAddress',
                      'houseNumber',
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="House number"
                  disabled={sameAsPermanent}
                />
              </div>
            </div>
          </section>

          <hr className="my-8" />

          {/* Password */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Account Security
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Password *
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-12`}
                    placeholder="Minimum 6 characters"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    name="confirmPassword"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    className={`${inputClass} pr-12`}
                    placeholder="Re-enter your password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Creating Account...'
                : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register