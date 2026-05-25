import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { user, logout } = useAuth()
    
    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}</h1>
                <p className="text-gray-400 mb-6">Atlas dashboard coming soon.</p>
                <button
                    onClick={logout}
                    className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded-lg transition"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}