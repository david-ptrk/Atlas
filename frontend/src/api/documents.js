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

export const getNotes = async (documentId = null) => {
    const url = documentId ? `/documents/notes/?document=${documentId}` : '/documents/notes'
    const res = await api.get(url)
    return res.data
}

export const createNote = async (title, noteContent, documentId = null) => {
    const res = await api.post('/documents/notes/', {
        title,
        content: noteContent,
        document: documentId
    })
    return res.data
}

export const updateNote = async (id, title, content) => {
    const res = await api.put(`/documents/notes/${id}/`, { title, content })
    return res.data
}

export const deleteNote = async (id) => {
    await api.delete(`/documents/notes/${id}/`)
}

export const searchDocuments = async (query) => {
    const res = await api.get(`/documents/search/?q=${encodeURIComponent(query)}`)
    return res.data
}

export const getCitation = async (id) => {
    const res = await api.get(`/documents/${id}/citation/`)
    return res.data
}

export const updateCitationMetadata = async (id, metadata) => {
    const res = await api.post(`/documents/${id}/citation/`, metadata)
    return res.data
}