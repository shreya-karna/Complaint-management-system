import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const getCategories = async (
  departmentId
) => {
  const url = departmentId
    ? `${API_URL}/categories?departmentId=${departmentId}`
    : `${API_URL}/categories`

  const response = await axios.get(url)

  return response.data
}

export const createCategory = async (
  categoryData
) => {
  const response = await axios.post(
    `${API_URL}/categories`,
    categoryData
  )

  return response.data
}

export const updateCategory = async (
  id,
  categoryData
) => {
  const response = await axios.patch(
    `${API_URL}/categories/${id}`,
    categoryData
  )

  return response.data
}