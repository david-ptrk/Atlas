import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    
    const isActive = (path) => location.pathname === path
    
    return (
        <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <h1
                    onClick={() => navigate('/dashboard')}
                    className="text-xl font-bold cursor-pointer hover:text-blue-400 transition"
                >
                    Atlas
                </h1>
                <nav className="flex gap-4 text-sm">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`transition ${isActive('/dashboard') ? 'text-white font-medium' : 'text-gray-500 hover:text-white'}`}
                    >
                        Documents
                    </button>
                    <button
                        onClick={() => navigate('/workspaces')}
                        className={`transition ${isActive('/workspaces') ? 'text-white font-medium' : 'text-gray-500 hover:text-white'}`}
                    >
                        Workspaces
                    </button>
                    <button
                        onClick={() => navigate('/chat')}
                        className={`transition ${isActive('/chat') ? 'text-white font-medium' : 'text-gray-500 hover:text-white'}`}
                    >
                        Research Chat
                    </button>
                </nav>
            </div>
            
            <div className="flex items-center gap-4">
                {user?.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt="avatar"
                        onClick={() => navigate('/profile')}
                        className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                    />
                ) : (
                    <div
                        onClick={() => navigate('/profile')}
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition"
                    >
                        <span className="text-xs">👤</span>
                    </div>
                )}
                <span className="text-gray-400 text-sm hidden md:block">{user?.email}</span>
                <button
                    onClick={() => navigate('/profile')}
                    className="text-gray-500 hover:text-white text-sm transition"
                >
                    Profile
                </button>
                <button
                    onClick={logout}
                    className="text-gray-500 hover:text-white text-sm transition"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}