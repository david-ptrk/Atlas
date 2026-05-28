import { useState, useEffect } from "react";
import { useParams, useNavigate, href } from 'react-router-dom'
import { getDocument, deleteDocument } from "../api/documents";

export default function DocumentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [doc, setDoc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('summary')
    
    useEffect(() => {
        getDocument(id)
            .then(setDoc)
            .finally(() => setLoading(false))
    }, [id])
    
    const handleDelete = async () => {
        if (!confirm('Delete this document?')) return
        await deleteDocument(id)
        navigate('/dashboard')
    }
    
    const formatSize = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        })
    }
    
    const renderSummary = (summary) => {
        if (!summary) return <p className="text-gray-500">No summary available.</p>
        return summary.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="text-white font-semibold mt-4 mb-1">{line.replace(/\*\*/g, '')}</p>
            }
            if (line.startsWith('**') ** line.includes(':**')) {
                const parts = line.split(':**')
                return (
                    <p key={i} className="text-white font-semibold mt-4 mb-1">
                        {parts[0].replace(/\*\*/g, '')}
                        <span className="text-gray-300 font-normal"> {parts[1]}</span>
                    </p>
                )
            }
            if (line.startsWith('- ')) {
                return (
                    <div key={i} className="flex gap-2 ml-2 my-1">
                        <span className="text-blue-400 mt-1">•</span>
                        <p className="text-gray-300 text-sm">{line.slice(2)}</p>
                    </div>
                )
            }
            if (line.trim() === '') return <div key={i} className="h-1" />
            return <p key={i} className="text-gray-300 text-sm">{line}</p>
        })
    }
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-gray-500">Loading document...</p>
            </div>
        )
    }
    
    if (!doc) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-gray-500">Document not found.</p>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            
            {/* Navbar */}
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-500 hover:text-white transition text-sm"
                    >
                        ← Back
                    </button>
                    <span className="text-gray-700">|</span>
                    <h1 className="text-white font-medium text-sm truncate max-w-xs">{doc.title}</h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="text-gray-600 hover:text-red-400 transition text-sm"
                >
                    Delete
                </button>
            </div>
            
            <div className="max-w-4xl mx-auto px-6 py-8">
                
                {/* Document header */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">📄</div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white">{doc.title}</h2>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                <span>{formatSize(doc.file_size)}</span>
                                <span>{formatDate(doc.created_at)}</span>
                                <span className={`font-medium ${
                                    doc.status === 'ready' ? 'text-green-400' :
                                    doc.status === 'processing' ? 'text-yellow-400' : 'text-red-400'
                                }`}>{doc.status}</span>
                            </div>
                        </div>
                        {doc.file_url && (
                            <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded-lg transition"
                            >
                                View PDF
                            </a>
                        )}
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-6 w-fit">
                    {['summary', 'text'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize
                                ${activeTab === tab
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {tab === 'summary' ? 'AI Summary' : 'Extracted Test'}
                        </button>
                    ))}
                </div>
                
                {/* Tab content */}
                <div className="bg-gray-900 rounded-xl p-6">
                    {activeTab === 'summary' ? (
                        <div className="leading-relaxed">
                            {renderSummary(doc.summary)}
                        </div>
                    ): (
                        <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap max-h-150 overflow-y-auto">
                            {doc.extracted_text || 'No text extracted.'}
                        </div>
                    )}
                </div>
                
            </div>
            
        </div>
    )
}