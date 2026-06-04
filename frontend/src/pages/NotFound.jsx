import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
    const { user } = useAuth()
    const navigate = useNavigate()
    
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl font-medium text-white mb-2">Page not found</p>
                <p className="text-gray-500 text-sm mb-8">The page you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate(user ? '/dashboard' : '/login')}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2.5 rounded-lg transition"
                >
                    {user ? 'Back to Dashboard' : 'Back to Login'}
                </button>
            </div>
        </div>
    )
}