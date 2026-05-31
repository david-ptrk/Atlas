import { useState, useEffect } from "react";
import { getCitation, updateCitationMetadata } from "../api/documents";

export default function CitationPanel({ documentId, documentTitle }) {
    const [citations, setCitations] = useState(null)
    const [metadata, setMetadata] = useState({ author: '', publication_date: '', publisher: '', url: '' })
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState('')
    
    useEffect(() => {
        getCitation(documentId)
            .then(data => {
                setCitations(data.citations)
                setMetadata(data.metadata)
            })
            .finally(() => setLoading(false))
    }, [documentId])
    
    const handleSave = async () => {
        setSaving(true)
        try {
            const data = await updateCitationMetadata(documentId, metadata)
            setCitations(data.citations)
            setEditing(false)
        }
        catch (err) {
            console.error(err)
        }
        finally {
            setSaving(false)
        }
    }
    
    const handleCopy = (format, text) => {
        navigator.clipboard.writeText(text)
        setCopied(format)
        setTimeout(() => setCopied(''), 2000)
    }
    
    if (loading) return <p className="text-gray-600 text-sm">Loading citations...</p>
    
    return (
        <div>
            {/* Metadata section */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-medium">Document Metadata</p>
                    <button
                        onClick={() => setEditing(!editing)}
                        className="text-blue-400 hover:text-blue-300 text-xs transition"
                    >
                        {editing ? 'Cancel' : 'Edit'}
                    </button>
                </div>
                
                {editing ? (
                    <div className="space-y-3">
                        <div>
                            <label className="text-gray-500 text-xs mb-1 block">Author</label>
                            <input
                                value={metadata.author}
                                onChange={e => setMetadata({ ...metadata, author: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Author name"
                            />
                        </div>
                        <div>
                            <label className="text-gray-500 text-xs mb-1 block">Publication Date</label>
                            <input
                                value={metadata.publication_date}
                                onChange={e => setMetadata({ ...metadata, publication_date: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="2026"
                            />
                        </div>
                        <div>
                            <label className="text-gray-500 text-xs mb-1 block">Publisher / Journal</label>
                            <input 
                                value={metadata.publisher}
                                onChange={e => setMetadata({ ...metadata, publisher: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Publisher name"
                            />
                        </div>
                        <div>
                            <label className="text-gray-500 text-xs mb-1 block">URL (optional)</label>
                            <input
                                value={metadata.url}
                                onChange={e => setMetadata({ ...metadata, url: e.target.value })}
                                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://..."
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save & Regenerate'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-1.5 text-sm">
                        <p className="text-gray-400"><span className="text-gray-600">Author:</span> {metadata.author || <span className="text-gray-700 italic">Not detected</span>}</p>
                        <p className="text-gray-400"><span className="text-gray-600">Date:</span> {metadata.publication_date || <span className="text-gray-700 italic">Not detected</span>}</p>
                        <p className="text-gray-400"><span className="text-gray-600">Publisher:</span> {metadata.publisher || <span className="text-gray-700 italic">Not detected</span>}</p>
                        <p className="text-gray-400"><span className="text-gray-600">URL:</span> {metadata.url || <span className="text-gray-700 italic">None</span>}</p>
                    </div>
                )}
            </div>
            
            {/* Citations */}
            {citations && (
                <div className="space-y-4">
                    {[
                        { key: 'apa', label: 'APA' },
                        { key: 'mla', label: 'MLA' },
                        { key: 'chicago', label: 'Chicago' },
                    ].map(({ key, label }) => (
                        <div key={key} className="bg-gray-800 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-400 text-xs font-semibold">{label}</span>
                                <button
                                    onClick={() => handleCopy(key, citations[key])}
                                    className="text-gray-500 hover:text-white text-xs transition"
                                >
                                    {copied === key ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{citations[key]}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}