import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    
    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
    
    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await register(form.email, form.username, form.password)
            navigate('/dashboard')
        }
        catch (err) {
            setError(err.response?.data?.email?.[0] || 'Registration failed.')
        }
        finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl">
                
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white">Atlas</h1>
                    <p className="text-gray-400 mt-1 text-sm">Your AI research workspace</p>
                </div>
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Username</label>
                        <input
                            name="username"
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="johndoe"
                        />
                    </div>
                    
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="min. 8 characters"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-2.5 text-sm transition disabled:opacity-50 mt-2"
                    >
                        {loading? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                
                <p className="text-gray-500 text-sm text-center mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
                </p>
                
            </div>
        </div>
    )
}