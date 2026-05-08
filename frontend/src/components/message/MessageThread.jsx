import { useState, useEffect, useRef } from 'react'
import { Send, Image as ImageIcon, X } from 'lucide-react'
import { messageAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Avatar, Spinner } from '../common'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function MessageThread({ bookingId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [text,     setText]     = useState('')
  const [imgFile,  setImgFile]  = useState(null)
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef(null)
  const fileRef   = useRef(null)

  const fetchMessages = async () => {
    try {
      const { data } = await messageAPI.getByBooking(bookingId)
      setMessages(data.data.messages)
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMessages() }, [bookingId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!text.trim() && !imgFile) return
    setSending(true)
    try {
      const fd = new FormData()
      fd.append('bookingId', bookingId)
      if (imgFile) {
        fd.append('messageType', 'image')
        fd.append('image', imgFile)
      } else {
        fd.append('messageType', 'text')
        fd.append('content', text.trim())
      }
      const { data } = await messageAPI.send(fd)
      setMessages(p => [...p, data.data])
      setText(''); setImgFile(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div className="flex flex-col" style={{ height: '480px' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-dim)' }}>
            <span className="text-3xl mb-2">💬</span>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          const mine = msg.sender._id === user._id || msg.sender === user._id
          return (
            <div key={msg._id} className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
              {!mine && <Avatar src={msg.sender?.avatar} name={msg.sender?.fullName} size={30} />}
              <div className={`max-w-[72%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                  mine
                    ? 'rounded-tr-sm'
                    : 'rounded-tl-sm'
                }`}
                  style={{
                    background: mine ? 'var(--accent)' : 'var(--surface2)',
                    color: mine ? '#fff' : 'var(--text)',
                    border: mine ? 'none' : '1px solid var(--border)'
                  }}>
                  {msg.messageType === 'image'
                    ? <img src={msg.content} alt="sent" className="max-w-full rounded-xl max-h-48 object-cover" />
                    : <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  }
                </div>
                <span className="text-xs px-1" style={{ color: 'var(--text-dim)' }}>
                  {format(new Date(msg.createdAt), 'hh:mm a')}
                  {msg.isRead && mine && <span className="ml-1" style={{ color: 'var(--accent)' }}>✓✓</span>}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {imgFile && (
        <div className="mx-4 mb-2 flex items-center gap-2 p-2 rounded-lg text-sm"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <img src={URL.createObjectURL(imgFile)} alt="" className="w-10 h-10 rounded-lg object-cover" />
          <span className="flex-1 truncate text-xs" style={{ color: 'var(--text-mid)' }}>{imgFile.name}</span>
          <button onClick={() => setImgFile(null)} className="btn btn-ghost btn-sm p-1"><X size={14} /></button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 flex gap-2 items-end" style={{ borderTop: '1px solid var(--border)' }}>
        <input type="file" accept="image/*" ref={fileRef} className="hidden"
          onChange={e => { if (e.target.files[0]) setImgFile(e.target.files[0]) }} />
        <button onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm p-2 flex-shrink-0">
          <ImageIcon size={17} />
        </button>
        <textarea
          className="input flex-1 resize-none text-sm"
          rows={1}
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKey}
          style={{ minHeight: 42, maxHeight: 120 }}
        />
        <button
          onClick={send}
          disabled={sending || (!text.trim() && !imgFile)}
          className="btn btn-primary btn-sm flex-shrink-0 p-2.5">
          {sending ? <Spinner size="sm" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
