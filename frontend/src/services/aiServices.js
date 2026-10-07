import api from './api'

export const suggestCategory = async ({ departmentId, text }) => {
    const response = await api.post('/ai/suggest-category', { departmentId, text })
    return response.data
}

export const suggestCategoryFromImage = async ({ departmentId, image, text = '' }) => {
    const form = new FormData()
    form.append('departmentId', departmentId)
    form.append('text', text)
    form.append('image', image)

    const response = await api.post('/ai/suggest-category-from-image', form)
    return response.data
}