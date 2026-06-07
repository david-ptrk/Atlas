import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { researchChat } from '../api/documents'

export default function ResearchChat() {
    const navigate = useNavigate()
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm Atlas, your research assistant. Ask me anything about your uploaded documents and I'll answer based on your research.",
            sources: []
        }
    ])
    const [question, setQuestion] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)
    
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])
    
    const handleSend = async () => {
        if (!question.trim() || loading) return
        
        const userMessage = { role: 'user', content: question }
        setMessages(prev => [...prev, userMessage])
        setQuestion('')
        setLoading(true)
        
        try {
            const res = await researchChat(question)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.answer,
                sources: res.sources || []
            }])
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
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }
    
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <Navbar />
            
            {/* Chat messages */}
            <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 overflow-y-auto">
                <div className="space-y-6">
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
                                
                                {/* Sources */}
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
                    
                    {/* Loading indicator */}
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
            <div className="border-t border-gray-800 px-6 py-4">
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
    )
}