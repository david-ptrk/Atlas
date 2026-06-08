import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getChatSessions, createChatSession, getChatSession, deleteChatSession, renameChatSession, sendMessage } from '../api/chat'

export default function ResearchChat() {
    const navigate = useNavigate()
    const { sessionId } = useParams()
    const [sessions, setSessions] = useState([])
    const [activeSession, setActiveSession] = useState(null)
    const [messages, setMessages] = useState([])
    const [question, setQuestion] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingSessions, setLoadingSessions] = useState(true)
    const [editingTitle, setEditingTitle] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const bottomRef = useRef(null)
    
    useEffect(() => {
        getChatSessions()
            .then(setSessions)
            .finally(() => setLoadingSessions(false))
    }, [])
    
    useEffect(() => {
        if (sessionId) {
            getChatSession(sessionId).then(session => {
                setActiveSession(session)
                setMessages([
                    {
                        role: 'assistant',
                        content: "Hi! I'm Atlas. Ask me anything about your research documents.",
                        sources: []
                    },
                    ...session.messages
                ])
            })
        }
        else {
            setActiveSession(null)
            setMessages([{
                role: 'assistant',
                content: "Hi! I'm Atlas. Ask me anything about your research documents.",
                sources: []
            }])
        }
    }, [sessionId])
    
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])
    
    const handleNewChat = async () => {
        const session = await createChatSession()
        setSessions(prev => [session, ...prev])
        navigate(`/chat/${session.id}`)
    }
    
    const handleSend = async () => {
        if (!question.trim() || loading) return
        
        let currentSessionId = sessionId
        if (!currentSessionId) {
            const session = await createChatSession(question.slice(0, 60))
            setSessions(prev => [session, ...prev])
            navigate(`/chat/${session.id}`)
            currentSessionId = session.id
        }
        
        const userMsg = { role: 'user', content: question, sources: [] }
        setMessages(prev => [...prev, userMsg])
        setQuestion('')
        setLoading(true)
        
        try {
            const res = await sendMessage(currentSessionId, question)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.answer,
                sources: res.sources || []
            }])
            
            setSessions(prev => prev.map(s =>
                s.id === parseInt(currentSessionId)
                    ? { ...s, title: question.slice(0, 60), last_message: res.answer.slice(0, 80) }
                    : s
            ))
        }
        catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.',
                sources: []
            }])
        }
        finally {
            setLoading(false)
        }
    }
    
    const handleDelete = async (id) => {
        await deleteChatSession(id)
        setSessions(prev => prev.filter(s => s.id !== id))
        if (parseInt(sessionId) === id) {
            navigate('/chat')
        }
    }
    
    const handleRename = async () => {
        if (!newTitle.trim()) return
        await renameChatSession(activeSession.id, newTitle)
        setActiveSession(prev => ({ ...prev, title: newTitle }))
        setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, title: newTitle } : s))
        setEditingTitle(false)
    }
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }
    
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <Navbar />
            
            <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
                
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-800 flex flex-col shrink-0 h-full">
                    <div className="p-4 border-b border-gray-800">
                        <button
                            onClick={handleNewChat}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-lg transition"
                        >
                            + New Chat
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2">
                        {loadingSessions ? (
                            <div className="space-y-2 p-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-900 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : sessions.length === 0 ? (
                            <p className="text-gray-600 text-xs text-center mt-8">No chats yet</p>
                        ) : (
                            sessions.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => navigate(`/chat/${session.id}`)}
                                    className={`group flex items-start justify-between p-3 rounded-lg cursor-pointer transition mb-1
                                        ${parseInt(sessionId) === session.id ? 'bg-gray-800' : 'hover:bg-gray-900'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs font-medium truncate">{session.title}</p>
                                        {session.last_message && (
                                            <p className="text-gray-600 text-xs truncate mt-0.5">{session.last_message}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDelete(session.id) }}
                                        className="text-gray-700 hover:text-red-400 transition opacity-0 group-hover:opacity-100 ml-2 shrink-0"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                {/* Chat area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    
                    {/* Chat header */}
                    {activeSession && (
                        <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-3">
                            {editingTitle ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleRename()}
                                        className="bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                        autoFocus
                                    />
                                    <button onClick={handleRename} className="text-blue-400 text-xs hover:text-blue-300">Save</button>
                                    <button onClick={() => setEditingTitle(false)} className="text-gray-500 text-xs hover:text-white">Cancel</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setEditingTitle(true); setNewTitle(activeSession.title) }}
                                    className="text-gray-400 text-sm hover:text-white transition truncate text-left"
                                >
                                    {activeSession.title}
                                </button>
                            )}
                        </div>
                    )}
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-xs font-bold">A</span>
                                        </div>
                                    )}
                                    <div className={`max-w-xl ${msg.role === 'user' ? 'order-first' : ''}`}>
                                        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                                : 'bg-gray-900 text-gray-300 rounded-tl-sm'
                                        }`}>
                                            {msg.content}
                                        </div>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {msg.sources.map(source => (
                                                    <button
                                                        key={source.id}
                                                        onClick={() => navigate(`/documents/${source.id}`)}
                                                        className="text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 px-2 py-1 rounded-full transition"
                                                    >
                                                        📄 {source.title}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-xs">👤</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold">A</span>
                                    </div>
                                    <div className="bg-gray-900 rounded-2xl rounded-tl-sm px-4 py-3">
                                        <div className="flex gap-1 items-center h-5">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    </div>
                    
                    {/* Input */}
                    <div className="border-t border-gray-800 px-6 py-4 shrink-0">
                        <div className="max-w-3xl mx-auto flex gap-3">
                            <textarea
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything about your research documents..."
                                rows={1}
                                className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !question.trim()}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl transition disabled:opacity-50"
                            >
                                ↑
                            </button>
                        </div>
                        <p className="text-gray-700 text-xs text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
                    </div>
                </div>
            </div>
        </div>
    )
}