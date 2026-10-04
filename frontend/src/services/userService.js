import api from './api'

export const getUsers = async () => {
  const response = await api.get('/users')
  return response.data
}

export const createUser = async (userData) => {
  const response = await api.post('/users', userData)
  return response.data
}

export const updateUser = async (id, userData) => {
  const response = await api.patch(`/users/${id}`, userData)
  return response.data
}

export const loginUser = async (email, password) => {
  const response = await api.post('/users/login', {
    email,
    password,
  })

  return response.data
}

export const getStaffByDepartment = async (departmentId) => {
  const response = await api.get(
    `/users/department/${departmentId}/staff`
  )

  return response.data
}

export const resendVerificationEmail = async (email) => {
  const response = await api.post(
    '/users/resend-verification',
    {
      email,
    }
  )

  return response.data
}