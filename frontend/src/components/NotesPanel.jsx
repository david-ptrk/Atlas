import { useState, useEffect } from "react";
import { getNotes, createNote, updateNote, deleteNote } from '../api/documents'

export default function NotesPanel({ documentId }) {
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [showNew, setShowNew] = useState(false)
    const [form, setForm] = useState({ title: '', content: '' })
    
    useEffect(() => {
        getNotes(documentId)
            .then(setNotes)
            .finally(() => setLoading(false))
    }, [documentId])
    
    const handleCreate = async () => {
        if (!form.content.trim()) return
        const note = await createNote(form.title, form.content, documentId)
        setNotes(prev => [note, ...prev])
        setForm({ title: '', content: '' })
        setShowNew(false)
    }
    
    const handleUpdate = async (id) => {
        const note = await updateNote(id, form.title, form.content)
        setNotes(prev => prev.map(n => n.id === id ? note : n))
        setEditingId(null)
        setForm({ title: '', content: '' })
    }
    
    const handleDelete = async (id) => {
        await deleteNote(id)
        setNotes(prev => prev.filter(n => n.id !== id))
    }
    
    const startEdit = (note) => {
        setEditingId(note.id)
        setForm({ title: note.title, content: note.content })
        setShowNew(false)
    }
    
    const cancelEdit = () => {
        setEditingId(null)
        setForm({ title: '', content: '' })
    }
    
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        })
    }
    
    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Notes</h3>
                <button
                    onClick={() => { setShowNew(true); setEditingId(null); setForm({ title: '', content: '' }) }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition"
                >
                    + New Note
                </button>
            </div>
            
            {/* New note form */}
            {showNew && (
                <div className="bg-gray-800 rounded-xl p-4 mb-4">
                    <input 
                        type="text"
                        placeholder="Title (optional)"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    <textarea
                        placeholder="Write your note..."
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        rows={4}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={!form.content.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                            Save Note
                        </button>
                        <button
                            onClick={() => { setShowNew(false); setForm({ title: '', content: '' }) }}
                            className="text-gray-500 hover:text-white text-xs px-3 py-1.5 rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            
            {/* Notes list */}
            {loading ? (
                <p className="text-gray-600 text-sm">Loading notes...</p>
            ) : notes.length === 0 && !showNew ? (
                <div className="text-center py-8">
                    <p className="text-gray-600 text-sm">No notes yet.</p>
                    <p className="text-gray-700 text-xs mt-1">Click + New Note to get started.</p>
                </div>
            ): (
                <div className="space-y-3">
                    {notes.map(note => (
                        <div key={note.id} className="bg-gray-800 rounded-xl p-4 group">
                            {editingId === note.id ? (
                                <>
                                    <input 
                                        type="text"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                    />
                                    <textarea
                                        value={form.content}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        rows={4}
                                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate(note.id)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="text-gray-500 hover:text-white text-xs px-3 py-1.5 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            {note.title && (
                                                <p className="text-white text-sm font-medium mb-1">{note.title}</p>
                                            )}
                                            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                            <p className="text-gray-600 text-xs mt-2">{formatDate(note.updated_at)}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <button
                                                onClick={() => startEdit(note)}
                                                className="text-gray-600 hover:text-blue-400 text-xs transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="text-gray-600 hover:text-red-400 text-xs transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}