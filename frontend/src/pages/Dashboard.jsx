import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getDocuments, deleteDocument } from "../api/documents";
import UploadModal from "../components/UploadModal";
import DocumentCard from "../components/DocumentCard";
import SearchBar from "../components/SearchBar";

export default function Dashboard() {
    const { user, logout } = useAuth()
    const [documents, setDocuments] = useState([])
    const [showUpload, setShowUpload] = useState(false)
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        getDocuments()
            .then(setDocuments)
            .finally(() => setLoading(false))
    }, [])
    
    const handleUploaded = (doc) => {
        setDocuments(prev => [doc, ...prev])
    }
    
    const handleDelete = async (id) => {
        await deleteDocument(id)
        setDocuments(prev => prev.filter(d => d.id !== id))
    }
    
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            
            {/* Navbar */}
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Atlas</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{user?.email}</span>
                    <button
                        onClick={logout}
                        className="text-gray-500 hover:text-white text-sm transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
            
            {/* Main content */}
            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">My Documents</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {documents.length} document{documents.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                    >
                        + Upload PDF
                    </button>
                </div>
                
                {/* Search */}
                <div className="mb-8">
                    <SearchBar />
                </div>
                
                {/* Documents grid */}
                {loading ? (
                    <div className="text-center text-gray-600 py-20">Loading...</div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-gray-500">No documents yet.</p>
                        <p className="text-gray-700 text-sm mt-1">Upload a PDF to get started.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {documents.map(doc => (
                            <DocumentCard
                                key={doc.id}
                                doc={doc}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Upload modal */}
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onUploaded={handleUploaded}
                />
            )}
            
        </div>
    )
}