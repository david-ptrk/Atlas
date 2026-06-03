import api from './axios'

export const updateProfile = async (username, avatar) => {
    const formData = new FormData()
    if (username) formData.append('username', username)
    if (avatar) formData.append('avatar', avatar)
    const res = await api.put('/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
}

export const changePassword = async (current_password, new_password) => {
    const res = await api.post('/users/password/', { current_password, new_password })
    return res.data
}