import { useState, useRef } from "react";
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { updateProfile, changePassword } from "../api/users";

export default function Profile() {
    const { user, logout, refreshUser } = useAuth()
    const navigate = useNavigate()
    const fileRef = useRef(null)
    
    const [username, setUsername] = useState(user?.username || '')
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null)
    const [profileMsg, setProfileMsg] = useState('')
    const [profileError, setProfileError] = useState('')
    const [profileLoading, setProfileLoading] = useState(false)
    
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
    const [passMsg, setPassMsg] = useState('')
    const [passError, setPassError] = useState('')
    const [passLoading, setPassLoading] = useState(false)
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
    
    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatar(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }
    
    const handleProfileSave = async () => {
        setProfileLoading(true)
        setProfileMsg('')
        setProfileError('')
        try {
            await updateProfile(username, avatar)
            await refreshUser()
            setProfileMsg('Profile updated successfully.')
            setAvatar(null)
        }
        catch (err) {
            setProfileError(err.response?.data?.error || 'Failed to update profile.')
        }
        finally {
            setProfileLoading(false)
        }
    }
    
    const handlePasswordChange = async () => {
        setPassMsg('')
        setPassError('')
        if (passwords.new !== passwords.confirm) {
            setPassError('New passwords do not match.')
            return
        }
        setPassLoading(true)
        try {
            await changePassword(passwords.current, passwords.new)
            setPassMsg('Password changed. Please log in again.')
            setTimeout(() => logout(), 2000)
        }
        catch (err) {
            setPassError(err.response?.data?.error || 'Failed to change password.')
        }
        finally {
            setPassLoading(false)
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
                        <button onClick={() => navigate('/workspaces')} className="text-gray-500 hover:text-white transition">Workspaces</button>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{user?.email}</span>
                    <button onClick={logout} className="text-gray-500 hover:text-white text-sm transition">Logout</button>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-6 py-10">
                <h2 className="text-2xl font-bold mb-8">Profile Settings</h2>
                
                {/* Avatar + username */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                    <h3 className="text-white font-medium mb-6">Account Info</h3>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-5 mb-6">
                        <div
                            onClick={() => fileRef.current.click()}
                            className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden hover:opacity-80 transition relative group"
                        >
                            {avatarPreview? (
                                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl">👤</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full">
                                <span className="text-white text-xs">Change</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-medium">{user?.username}</p>
                            <p className="text-gray-500 text-sm">{user?.email}</p>
                            <p className="text-gray-700 text-xs mt-1">Click avatar to change photo</p>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    
                    {/* Username */}
                    <div className="mb-4">
                        <label className="text-gray-400 text-sm mb-1 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    {/* Email (readonly) */}
                    <div className="mb-6">
                        <label className="text-gray-400 text-sm mb-1 block">Email</label>
                        <input
                            type="text"
                            value={user?.email}
                            disabled
                            className="w-full bg-gray-800/50 text-gray-500 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
                        />
                    </div>
                    
                    {profileMsg && <p className="text-green-400 text-sm mb-3">{profileMsg}</p>}
                    {profileError && <p className="text-red-400 text-sm mb-3">{profileError}</p>}
                    
                    <button
                        onClick={handleProfileSave}
                        disabled={profileLoading}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                
                {/* Change password */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                    <h3 className="text-white font-medium mb-6">Change Password</h3>
                    
                    <div className="space-y-3 mb-4">
                        <div>
                            <label className="text-gray-400 text-sm mb-1 block">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwords.current}
                                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition text-xs"
                                >
                                    {showPasswords.current ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm mb-1 block">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition text-xs"
                                >
                                    {showPasswords.new ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm mb-1 block">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition text-xs"
                                >
                                    {showPasswords.confirm ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {passMsg && <p className="text-green-400 text-sm mb-3">{passMsg}</p>}
                    {passError && <p className="text-red-400 text-sm mb-3">{passError}</p>}
                    
                    <button
                        onClick={handlePasswordChange}
                        disabled={passLoading}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                        {passLoading ? 'Changing...' : 'Change Password'}
                    </button>
                </div>
                
                {/* Danger Zone */}
                <div className="bg-gray-900 rounded-xl p-6 border border-red-500/20">
                    <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                    <p className="text-gray-500 text-sm mb-4">Once you log out all sessions, you will need to log in again on all devices.</p>
                    <button
                        onClick={logout}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm px-4 py-2.5 rounded-lg transition border border-red-500/30"
                    >
                        Logout All Sessions
                    </button>
                </div>
                
            </div>
        </div>
    )
}