import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, href } from 'react-router-dom'
import { getDocument, deleteDocument, askQuestion, regenerateSummary } from "../api/documents";
import NotesPanel from "../components/NotesPanel";
import CitationPanel from "../components/CitationPanel";
import Navbar from "../components/Navbar";
import SkeletonDocument from '../components/SkeletonDocument'

export default function DocumentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [doc, setDoc] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('summary')
    const [highlight, setHighlight] = useState('')
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [asking, setAsking] = useState(false)
    const [showAskBox, setShowAskBox] = useState(false)
    const askBoxRef = useRef(null)
    const [regenerating, setRegenerating] = useState(false)
    
    useEffect(() => {
        getDocument(id)
            .then(setDoc)
            .finally(() => setLoading(false))
    }, [id])
    
    const handleTextSelection = () => {
        const selection = window.getSelection()
        const selected = selection?.toString().trim()
        if (selected && selected.length > 10) {
            setHighlight(selected)
            setShowAskBox(true)
            setAnswer('')
            setTimeout(() => askBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
        }
    }
    
    const handleAsk = async () => {
        if (!question.trim()) return
        setAsking(true)
        setAnswer('')
        try {
            const res = await askQuestion(id, question, highlight)
            setAnswer(res.answer)
        }
        catch (err) {
            setAnswer('Failed to get answer. Please try again.')
        }
        finally {
            setAsking(false)
        }
    }
    
    const handleDelete = async () => {
        if (!confirm('Delete this document?')) return
        await deleteDocument(id)
        navigate('/dashboard')
    }
    
    const handleRegenerate = async () => {
        setRegenerating(true)
        try {
            const res = await regenerateSummary(id)
            setDoc(prev => ({ ...prev, summary: res.summary }))
        }
        catch (err) {
            console.error(err)
        }
        finally {
            setRegenerating(false)
        }
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
    
    if (loading) return <SkeletonDocument />
    
    if (!doc) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-gray-500">Document not found.</p>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            
            <Navbar />
            <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between">
                <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-white transition text-sm">
                    ← Back to Documents
                </button>
                <button onClick={handleDelete} className="text-gray-600 hover:text-red-400 transition text-sm">
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
                    {['summary', 'text', 'notes', 'citations'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize
                                ${activeTab === tab
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {tab === 'summary' ? 'AI Summary' : tab === 'text' ? 'Extracted Text' : tab === 'notes' ? 'Notes' : 'Citations'}
                        </button>
                    ))}
                </div>
                
                {/* Tab content */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                    {activeTab === 'summary' ? (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                    className="text-gray-500 hover:text-blue-400 text-xs transition disabled:opacity-50 flex items-center gap-1"
                                >
                                    {regenerating ? 'Regenerating...' : '↻ Regenerate Summary'}
                                </button>
                            </div>
                            <div className="leading-relaxed">
                                {regenerating ? (
                                    <div className="space-y-3 animate-pulse">
                                        <div className="h-4 bg-gray-800 rounded w-1/4 mb-4" />
                                        <div className="h-3 bg-gray-800 rounded w-full" />
                                        <div className="h-3 bg-gray-800 rounded w-5/6" />
                                        <div className="h-3 bg-gray-800 rounded w-4/5" />
                                    </div>
                                ) : (
                                    renderSummary(doc.summary)
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'text' ? (
                        <div
                            onMouseUp={handleTextSelection}
                            className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap max-h-150 overflow-y-auto select-text cursor-text"
                        >
                            {doc.extracted_text || 'No text extracted.'}
                        </div>
                    ) : activeTab === 'notes' ? (
                        <NotesPanel documentId={doc.id} />
                    ) : (
                        <CitationPanel documentId={doc.id} documentTitle={doc.title} />
                    )}
                </div>
                
                {/* Highlight tip */}
                {activeTab === 'text' && !showAskBox && (
                    <p className="text-gray-600 text-xs text-center mb-6">
                        Select any text above to ask AI a question about it
                    </p>
                )}
                
                {/* Ask box */}
                {showAskBox && (
                    <div ref={askBoxRef} className="bg-gray-900 rounded-xl p-6">
                        
                        {/* Highlighted text */}
                        {highlight && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                                <p className="text-yellow-400 text-xs font-medium mb-1">Selected text</p>
                                <p className="text-gray-300 text-sm line-clamp-3">{highlight}</p>
                            </div>
                        )}
                        
                        {/* Question input */}
                        <div className="flex gap-3">
                            <input 
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                                placeholder="Ask a question about this text..."
                                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAsk}
                                disabled={asking || !question.trim()}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-50"
                            >
                                {asking ? '...' : 'Ask'}
                            </button>
                            <button
                                onClick={() => { setShowAskBox(false); setHighlight(''); setAnswer(''); setQuestion('') }}
                                className="text-gray-600 hover:text-white text-sm px-3 py-2.5 rounded-lg transition"
                            >
                                X
                            </button>
                        </div>
                        
                        {/* Asnwer */}
                        {answer && (
                            <div className="mt-4 bg-gray-800 rounded-lg p-4">
                                <p className="text-blue-400 text-xs font-medium mb-2">AI Answer</p>
                                <p className="text-gray-300 text-sm leading-relaxed">{answer}</p>
                            </div>
                        )}
                        
                    </div>
                )}
                
            </div>
            
        </div>
    )
}