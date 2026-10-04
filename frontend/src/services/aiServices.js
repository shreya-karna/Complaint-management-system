import api from './api'

export const suggestCategory = async ({ departmentId, text }) => {
    const response = await api.post('/ai/suggest-category', { departmentId, text })
    return response.data
}