import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const getDepartments = async () => {
  const response = await axios.get(
    `${API_URL}/departments`
  )

  return response.data
}

export const createDepartment = async (
  departmentData
) => {
  const response = await axios.post(
    `${API_URL}/departments`,
    departmentData
  )

  return response.data
}

export const updateDepartment = async (
  id,
  departmentData
) => {
  const response = await axios.patch(
    `${API_URL}/departments/${id}`,
    departmentData
  )

  return response.data
}