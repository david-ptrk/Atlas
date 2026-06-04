import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getWorkspace, deleteWorkspace, addDocumentToWorkspace, removeDocumentFromWorkspace } from '../api/workspaces'
import { getDocuments } from '../api/documents'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function WorkspaceDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [workspace, setWorkspace] = useState(null)
    const [loading, setLoading] = useState(true)
    const [myDocs, setMyDocs] = useState([])
    const [showAddDoc, setShowAddDoc] = useState(false)
    const [showInvite, setShowInvite] = useState(false)
    const [copied, setCopied] = useState(false)
    
    useEffect(() => {
        Promise.all([getWorkspace(id), getDocuments()])
            .then(([ws, docs]) => {
                setWorkspace(ws)
                setMyDocs(docs)
            })
            .finally(() => setLoading(false))
    }, [id])
    
    const handleAddDocument = async (docId) => {
        try {
            await addDocumentToWorkspace(id, docId)
            const ws = await getWorkspace(id)
            setWorkspace(ws)
            setShowAddDoc(false)
        }
        catch (err) {
            alert(err.response?.data?.error || 'Failed to add document.')
        }
    }
    
    const handleRemoveDocument = async (docId) => {
        await removeDocumentFromWorkspace(id, docId)
        const ws = await getWorkspace(id)
        setWorkspace(ws)
    }
    
    const handleDelete = async () => {
        if (!confirm('Delete this workspace?')) return
        await deleteWorkspace(id)
        navigate('/workspaces')
    }
    
    const handleCopyInvite = () => {
        navigator.clipboard.writeText(workspace.invite_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    
    const isOwner = workspace?.owner_email === user?.email
    const sharedDocIds = workspace?.documents?.map(d => d.document.id) || []
    const unsharedDocs = myDocs.filter(d => !sharedDocIds.includes(d.id))
    
    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <p className="text-gray-500">Loading workspace...</p>
        </div>
    )
    
    if (!workspace) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <p className="text-gray-500">Workspace not found.</p>
        </div>
    )
    
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            
            <Navbar />
            <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between">
                <button onClick={() => navigate('/workspaces')} className="text-gray-500 hover:text-white transition text-sm">
                    ← Back to Workspaces
                </button>
                {isOwner && (
                    <button onClick={handleDelete} className="text-gray-600 hover:text-red-400 transition text-sm">
                        Delete Workspace
                    </button>
                )}
            </div>
            
            <div className="max-w-4xl mx-auto px-6 py-8">
                
                {/* Workspace header */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{workspace.name}</h2>
                            {workspace.description && <p className="text-gray-400 text-sm mt-1">{workspace.description}</p>}
                            <div className="flex gap-4 mt-3 text-xs text-gray-600">
                                <span>👥 {workspace.member_count} members</span>
                                <span>📄 {workspace.document_count} documents</span>
                                <span className="text-blue-500 capitalize">{workspace.role}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowInvite(!showInvite)}
                            className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
                        >
                            Invite
                        </button>
                    </div>
                    
                    {/* Invite code */}
                    {showInvite && (
                        <div className="mt-4 bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-400 text-xs mb-2">Share this invite code with your team:</p>
                            <div className="flex items-center gap-3">
                                <code className="text-blue-400 text-sm flex-1 break-all">{workspace.invite_code}</code>
                                <button
                                    onClick={handleCopyInvite}
                                    className="text-gray-500 hover:text-white text-xs transition whitespace-nowrap"
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                </div>
                
                {/* Members */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                    <h3 className="text-white font-medium mb-4">Members</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-white text-sm">{workspace.owner_email}</p>
                            </div>
                            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">owner</span>
                        </div>
                        {workspace.members?.map(member => (
                            <div key={member.id} className="flex items-center justify-between py-2 border-t border-gray-800">
                                <div>
                                    <p className="text-white text-sm">{member.email}</p>
                                    <p className="text-gray-600 text-xs">{member.username}</p>
                                </div>
                                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">{member.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Documents */}
                <div className="bg-gray-900 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-medium">Documents</h3>
                        <button
                            onClick={() => setShowAddDoc(!showAddDoc)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition"
                        >
                            + Add Document
                        </button>
                    </div>
                    
                    {/* Add document dropdown */}
                    {showAddDoc && (
                        <div className="bg-gray-800 rounded-xl p-4 mb-4">
                            <p className="text-gray-400 text-xs mb-3">Select a document to share:</p>
                            {unsharedDocs.length === 0 ? (
                                <p className="text-gray-600 text-sm">All your documents are already shared.</p>
                            ) : (
                                <div className="space-y-2">
                                    {unsharedDocs.map(doc => (
                                        <div
                                            key={doc.id}
                                            onClick={() => handleAddDocument(doc.id)}
                                            className="flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition"
                                        >
                                            <span>📄</span>
                                            <p className="text-white text-sm">{doc.title}</p>
                                        </div>
                                    ))}
                                </div>
                            )} 
                        </div>
                    )}
                    
                    {/* Shared documents list */}
                    {workspace.documents?.length === 0 ? (
                        <p className="text-gray-600 text-sm text-center py-6">No documents shared yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {workspace.documents?.map(wd => (
                                <div key={wd.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg group">
                                    <div
                                        className="flex items-center gap-3 flex-1 cursor-pointer"
                                        onClick={() => navigate(`/documents/${wd.document.id}`)}
                                    >
                                        <span>📄</span>
                                        <p className="text-white text-sm">{wd.document.title}</p>
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={() => handleRemoveDocument(wd.document.id)}
                                            className="text-gray-700 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}