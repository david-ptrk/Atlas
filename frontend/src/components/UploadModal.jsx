import { useState } from "react";
import { uploadDocument } from "../api/document";

export default function UploadModal({ onClose, onUploaded }) {
    const [file, setFile] = useState(null)
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [drag, setDrag] = useState(false)
    
    const handleFile = (f) => {
        if (f && f.type === 'application/pdf') {
            setFile(f)
            setTitle(f.name.replace('.pdf', ''))
            setError('')
        }
        else {
            setError('Only PDF files are supported.')
        }
    }
    
    const handleDrop = (e) => {
        e.preventDefault()
        setDrag(false)
        const f = e.dataTransfer.files[0]
        handleFile(f)
    }
    
    const handleSubmit = async () => {
        if (!file) return
        setLoading(true)
        setError('')
        try {
            const doc = await uploadDocument(file, title)
            onUploaded(doc)
            onClose()
        }
        catch (err) {
            setError('Upload failed. Please try again.')
        }
        finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-semibold text-lg">Upload Document</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">X</button>
                </div>
                
                {/* Drop zone */}
                <div
                    onDragOver={(e) => {e.preventDefault(); setDrag(true)}}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput').click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition mb-4
                        ${drag ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500'}`}
                >
                    <div className="text-4xl mb-3">📄</div>
                    {file ? (
                        <p className="text-green-400 text-sm font-medium">{file.name}</p>
                    ): (
                        <>
                            <p className="text-gray-300 text-sm">Drag & drop your PDF here</p>
                            <p className="text-gray-600 text-xs mt-1">or click to browse</p>
                        </>
                    )}
                    <input
                        id="fileInput"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files[0])}
                    />
                </div>
                
                {/* Title input */}
                {file && (
                    <div className="mb-4">
                        <label className="text-gray-400 text-sm mb-1 block">Document Title</label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter a title..."
                        />
                    </div>
                )}
                
                {error && (
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                )}
                
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg py-2.5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg py-2.5 transition disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
                
            </div>
        </div>
    )
}