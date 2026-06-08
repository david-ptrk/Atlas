import api from './axios'

export const getChatSessions = async () => {
    const res = await api.get('/chat/')
    return res.data
}

export const createChatSession = async (title = 'New Chat') => {
    const res = await api.post('/chat/', { title })
    return res.data
}

export const getChatSession = async (id) => {
    const res = await api.get(`/chat/${id}/`)
    return res.data
}

export const deleteChatSession = async (id) => {
    await api.delete(`/chat/${id}/`)
}

export const renameChatSession = async (id, title) => {
    const res = await api.put(`/chat/${id}/`, { title })
    return res.data
}

export const sendMessage = async (sessionId, question) => {
    const res = await api.post(`/chat/${sessionId}/message/`, { question })
    return res.data
}