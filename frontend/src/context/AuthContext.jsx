import { createContext, useContext, useState, useEffect } from "react"
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const token = localStorage.getItem('access')
        if (token) {
            api.get('/users/me/')
                .then(res => setUser(res.data))
                .catch(() => localStorage.clear())
                .finally(() => setLoading(false))
        }
        else {
            setLoading(false)
        }
    }, [])
    
    const login = async (email, password) => {
        const res = await api.post('/users/login/', { email, password })
        localStorage.setItem('access', res.data.access)
        localStorage.setItem('refresh', res.data.refresh)
        const me = await api.get('/users/me/')
        setUser(me.data)
    }
    
    const register = async (email, username, password) => {
        const res = await api.post('/users/register/', { email, username, password })
        localStorage.setItem('access', res.data.access)
        localStorage.setItem('refresh', res.data.refresh)
        setUser(res.data.user)
    }
    
    const logout = () => {
        localStorage.clear()
        setUser(null)
    }
    
    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)