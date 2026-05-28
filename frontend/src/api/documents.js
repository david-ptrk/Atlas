import api from './axios'

export const uploadDocument = async (file, title) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title || file.name)
    
    console.log('Token being sent:', localStorage.getItem('access'))
    
    const res = await api.post('/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
}

export const getDocuments = async () => {
    const res = await api.get('/documents/')
    return res.data
}

export const deleteDocument = async (id) => {
    await api.delete(`/documents/${id}/`)
}

export const getDocument = async (id) => {
    const res = await api.get(`/documents/${id}/`)
    return res.data
}

export const askQuestion = async (id, question, highlightedText = '') => {
    const res = await api.post(`/documents/${id}/ask/`, {
        question,
        highlighted_text: highlightedText
    })
    return res.data
}