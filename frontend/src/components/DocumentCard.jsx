import { useNavigate } from "react-router-dom"

export default function DocumentCard({ doc, onDelete }) {
    const navigate = useNavigate()
    
    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        })
    }
    
    const statusColor = {
        ready:'text-green-400 bg-green-400/10',
        processing: 'text-yellow-400 bg-yellow-400/10',
        failed: 'text-red-400 bg-red-400/10',
    }
    
    return (
        <div
            onClick={() => navigate(`/documents/${doc.id}`)}
            className="bg-gray-900 rounded-xl p-5 hover:bg-gray-800 transition group"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-2xl mt-0.5">📄</div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{doc.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[doc.status]}`}>
                                {doc.status}
                            </span>
                            <span className="text-gray-600 text-xs">{formatSize(doc.file_size)}</span>
                            <span className="text-gray-600 text-xs">{formatDate(doc.created_at)}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(doc.id) }}
                    className="text-gray-700 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-lg"
                >
                    🗑
                </button>
            </div>
            
            {doc.summary && (
                <p className="text-gray-500 text-xs mt-3 line-clamp-2 leading-relaxed">
                    {doc.summary}
                </p>
            )}
        </div>
    )
}