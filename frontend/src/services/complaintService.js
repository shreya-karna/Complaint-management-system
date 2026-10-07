import api from './api'

export const createComplaint = async ({
  department,
  title,
  category,
  description,
  province,
  district,
  municipality,
  ward,
  tole,
  lat,
  lng,
  address,
  files,
}) => {
  const formData = new FormData()

  formData.append(
    'department',
    JSON.stringify(department)
  )

  formData.append('title', title)
  formData.append('category', category)
  formData.append('description', description)

  formData.append('province', province)
  formData.append('district', district)
  formData.append('municipality', municipality)
  formData.append('ward', ward)
  formData.append('tole', tole || '')

  if (lat != null && lng != null) {
    formData.append('lat', lat)
    formData.append('lng', lng)
  }

  formData.append('address', address || '')

  files.forEach((file) => {
    formData.append('attachments', file)
  })

  const response = await api.post(
    '/complaints',
    formData
  )

  return response.data
}

export const getComplaints = async (
  assignedToMe = false,
  filters = {}
) => {
  const params = {
    ...filters,
  }

  if (assignedToMe) {
    params.assignedToMe = 'true'
  }

  const response = await api.get(
    '/complaints',
    {
      params,
    }
  )

  return response.data
}

export const getComplaintById = async (id) => {
  const response = await api.get(
    `/complaints/${id}`
  )

  return response.data
}

export const updateComplaint = async (
  id,
  complaintData
) => {
  const response = await api.patch(
    `/complaints/${id}`,
    complaintData
  )

  return response.data
}

/*
 * Admin-only priority override
 */
export const updateComplaintPriority = async (
  id,
  priority
) => {
  const response = await api.patch(
    `/complaints/${id}/priority`,
    {
      priority,
    }
  )

  return response.data
}

export const assignComplaint = async (
  id,
  staffId
) => {
  const response = await api.patch(
    `/complaints/${id}/assign`,
    {
      staffId,
    }
  )

  return response.data
}

export const markComplaintAsDuplicate = async (
  id,
  originalComplaintId,
  note = ''
) => {
  const response = await api.patch(
    `/complaints/${id}/duplicate`,
    {
      originalComplaintId,
      note,
    }
  )

  return response.data
}

export const getDuplicateComplaints = async () => {
  const response = await api.get(
    '/complaints/duplicates'
  )

  return response.data
}

export const reopenComplaint = async (
  id,
  reason
) => {
  const response = await api.patch(
    `/complaints/${id}/reopen`,
    {
      reason,
    }
  )

  return response.data
}

export const trackComplaint =
  async (complaintNumber) => {
    const response = await api.get(
      '/complaints/track',
      {
        params: {
          complaintNumber,
        },
      }
    )

    return response.data
  }

export const getPublicComplaints =
  async (filters = {}) => {
    const response = await api.get(
      '/complaints/public',
      {
        params: filters,
      }
    )

    return response.data
  }