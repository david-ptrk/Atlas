import axios from "axios"

const getBaseURL = () => {
    return import.meta.env.VITE_API_BASE_URL ||
        `http://${window.location.hostname}:8000/api`
}

const api = axios.create({
    baseURL: getBaseURL(),
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api