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
  assignedToMe = false
) => {
  const response = await api.get('/complaints', {
    params: assignedToMe
      ? { assignedToMe: 'true' }
      : {},
  })

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