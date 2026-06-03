import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { getWorkspaces, createWorkspace, joinWorkspace } from "../api/workspaces";
import { useAuth } from '../context/AuthContext'

export default function Workspaces() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [workspaces, setWorkspaces] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [showJoin, setShowJoin] = useState(false)
    const [createForm, setCreateForm] = useState({ name: '', description: '' })
    const [inviteCode, setInviteCode] = useState('')
    const [error, setError] = useState('')
    
    useEffect(() => {
        getWorkspaces()
            .then(setWorkspaces)
            .finally(() => setLoading(false))
    }, [])
    
    const handleCreate = async () => {
        if (!createForm.name.trim()) return
        setError('')
        try {
            const ws = await createWorkspace(createForm.name, createForm.description)
            setWorkspaces(prev => [ws, ...prev])
            setShowCreate(false)
            setCreateForm({ name: '', description: '' })
        }
        catch (err) {
            setError('Failed to create workspace.')
        }
    }
    
    const handleJoin = async () => {
        if (!inviteCode.trim()) return
        setError('')
        try {
            const ws = await joinWorkspace(inviteCode)
            setWorkspaces(prev => [ws, ...prev])
            setShowJoin(false)
            setInviteCode('')
        }
        catch (err) {
            setError(err.response?.data?.error || 'Invalid invite code.')
        }
    }
    
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            
            {/* Navbar */}
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>Atlas</h1>
                    <nav className="flex gap-4 text-sm">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-white transition">Documents</button>
                        <button className="text-white font-medium">Workspaces</button>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{user?.email}</span>
                    <button onClick={() => navigate('/profile')} className="text-gray-500 hover:text-white text-sm transition">Profile</button>
                    <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition">Logout</button>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-6 py-10">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Workspaces</h2>
                        <p className="text-gray-500 text-sm mt-1">Collaborate with your team</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setShowJoin(true); setShowCreate(false); setError('') }}
                            className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2.5 rounded-lg transition"
                        >
                            Join
                        </button>
                        <button
                            onClick={() => { setShowCreate(true); setShowJoin(false); setError('') }}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-lg transition"
                        >
                            + New Workspace
                        </button>
                    </div>
                </div>
                
                {/* Create form */}
                {showCreate && (
                    <div className="bg-gray-900 rounded-xl p-6 mb-6">
                        <h3 className="text-white font-medium mb-4">Create Workspace</h3>
                        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                        <input
                            type="text"
                            placeholder="Workspace name"
                            value={createForm.name}
                            onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={createForm.description}
                            onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                            rows={2}
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition">
                                Create
                            </button>
                            <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white text-sm px-4 py-2 rounded-lg transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Join form */}
                {showJoin && (
                    <div className="bg-gray-900 rounded-xl p-6 mb-6">
                        <h3 className="text-white font-medium mb-4">Join Workspace</h3>
                        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                        <input
                            type="text"
                            placeholder="Paste invite code here"
                            value={inviteCode}
                            onChange={e => setInviteCode(e.target.value)}
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        />
                        <div className="flex gap-3">
                            <button onClick={handleJoin} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition">
                                Join
                            </button>
                            <button onClick={() => setShowJoin(false)} className="text-gray-500 hover:text-white text-sm px-4 py-2 rounded-lg transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Workspace list */}
                {loading ? (
                    <div className="text-center text-gray-600 py-20">Loading...</div>
                ) : workspaces.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">👥</div>
                        <p className="text-gray-500">No workspaces yet.</p>
                        <p className="text-gray-700 text-sm mt-1">Create one or join with an invite code.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {workspaces.map(ws => (
                            <div
                                key={ws.id}
                                onClick={() => navigate(`/workspaces/${ws.id}`)}
                                className="bg-gray-900 rounded-xl p-5 hover:bg-gray-800 transition cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-white font-medium">{ws.name}</h3>
                                        {ws.description && <p className="text-gray-500 text-sm mt-1">{ws.description}</p>}
                                        <div className="flex gap-4 mt-3 text-xs text-gray-600">
                                            <span>👥 {ws.member_count} members</span>
                                            <span>📄 {ws.document_count} documents</span>
                                            <span className="text-blue-500 capitalize">{ws.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
            </div>
            
        </div>
    )
}