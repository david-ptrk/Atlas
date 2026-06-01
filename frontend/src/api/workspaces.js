import api from './axios'

export const getWorkspaces = async () => {
    const res = await api.get('/workspaces/')
    return res.data
}

export const createWorkspace = async (name, description) => {
    const res = await api.post('/workspaces/', { name, description })
    return res.data
}

export const getWorkspace = async (id) => {
    const res = await api.get(`/workspaces/${id}/`)
    return res.data
}

export const deleteWorkspace = async (id) => {
    await api.delete(`/workspaces/${id}/`)
}

export const joinWorkspace = async (invite_code) => {
    const res = await api.post('/workspaces/join/', { invite_code })
    return res.data
}

export const addDocumentToWorkspace = async (workspaceId, documentId) => {
    const res = await api.post(`/workspaces/${workspaceId}/documents/`, { document_id: documentId })
    return res.data
}

export const removeDocumentFromWorkspace = async (workspaceId, documentId) => {
    await api.delete(`/workspaces/${workspaceId}/documents/${documentId}/`)
}