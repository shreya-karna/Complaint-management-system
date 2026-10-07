import api from './api'


export const getComplaintFeedback = async (
  complaintId
) => {
  const response = await api.get(
    `/feedback/complaints/${complaintId}`
  )

  return response.data
}


export const createFeedback = async (
  complaintId,
  feedbackData
) => {
  const response = await api.post(
    `/feedback/complaints/${complaintId}`,
    feedbackData
  )

  return response.data
}


// Admin: get feedback from all complaints
export const getAllFeedback = async () => {
  const response = await api.get(
    '/feedback/admin'
  )

  return response.data
}


// Staff: get feedback for assigned complaints
export const getStaffFeedback = async () => {
  const response = await api.get(
    '/feedback/staff'
  )

  return response.data
}

