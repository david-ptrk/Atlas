import { useState } from "react";
import { searchDocuments } from '../api/documents'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const navigate = useNavigate()
    
    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true)
        setSearched(true)
        try {
            const data = await searchDocuments(query)
            setResults(data)
        }
        catch (err) {
            console.error(err)
        }
        finally {
            setLoading(false)
        }
    }
    
    const formatSize = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    
    return (
        <div className="w-full">
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        if (!e.target.value) { setResults([]); setSearched(false) }
                    }}
                    placeholder="Search documents..."
                    className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? '...' : 'Search'}
                </button>
            </form>
            
            {/* Results */}
            {searched && (
                <div className="mt-4">
                    {results.length === 0 ? (
                        <p className="text-gray-600 text-sm text-center py-4">
                            No documents found for "{query}"
                        </p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-gray-600 text-xs mb-3">
                                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                            </p>
                            {results.map(doc => (
                                <div
                                    key={doc.id}
                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                    className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">📄</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">{formatSize(doc.file_size)}</p>
                                        </div>
                                    </div>
                                    {doc.summary && (
                                        <p className="text-gray-500 text-xs mt-2 line-clamp-2">
                                            {doc.summary}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}