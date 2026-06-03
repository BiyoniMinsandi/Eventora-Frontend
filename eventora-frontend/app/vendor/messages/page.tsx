'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Search, Bell } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/components/auth-provider'
import { Suspense } from 'react'
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  type Conversation,
  type Message,
} from '@/lib/data'
import { getChatConnection, startChatConnection } from '@/lib/signalr'

// ── Helpers (same as customer page) ──────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = [
  'bg-violet-500','bg-blue-500','bg-green-500','bg-orange-500',
  'bg-pink-500','bg-teal-500','bg-indigo-500','bg-rose-500',
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function fmtMsgTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function fmtListTime(ts: string) {
  const d = new Date(ts), now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86_400_000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604_800_000) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function dateSeparator(ts: string) {
  const d = new Date(ts), now = new Date()
  const yest = new Date(now); yest.setDate(yest.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === yest.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────

function VendorMessagesContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState<{ name: string; preview: string; convId: string } | null>(null)
  const [showList, setShowList] = useState(true)

  const endRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<Conversation | null>(null)
  const convsRef = useRef<Conversation[]>([])
  selectedRef.current = selected
  convsRef.current = conversations

  const scrollToBottom = () => setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)

  // Load conversations
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const convs = await getUserConversations(user.id, 'vendor')
      if (cancelled) return
      setConversations(convs)
      const fromQuery = searchParams.get('conversationId')
      const target = fromQuery ? convs.find(c => c.id === fromQuery) : convs[0]
      setSelected(target || null)
    })()
    return () => { cancelled = true }
  }, [user, searchParams])

  // Load messages for selected conversation
  useEffect(() => {
    if (!selected || !user) return
    let cancelled = false
    ;(async () => {
      const msgs = await getConversationMessages(selected.id)
      if (cancelled) return
      setMessages(msgs)
      scrollToBottom()
      await markConversationAsRead(selected.id, user.id)
      if (!cancelled) setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, unreadCount: 0 } : c))
    })()
    return () => { cancelled = true }
  }, [selected, user])

  // SignalR real-time
  useEffect(() => {
    if (!user) return
    let mounted = true
    const conn = getChatConnection()

    const handleReceive = (msg: Message) => {
      if (!mounted) return
      const conv = selectedRef.current
      if (conv && msg.conversationId === conv.id) {
        setMessages(prev => [...prev, msg])
        scrollToBottom()
      } else {
        const senderConv = convsRef.current.find(c => c.id === msg.conversationId)
        const senderName = senderConv?.customerName || 'New message'
        setNotification({ name: senderName, preview: msg.content.slice(0, 60), convId: msg.conversationId })
        setTimeout(() => setNotification(null), 5000)
      }
      setConversations(prev =>
        prev.map(c => c.id === msg.conversationId
          ? { ...c, lastMessage: msg.content, unreadCount: c.id === selectedRef.current?.id ? 0 : c.unreadCount + 1 }
          : c
        )
      )
    }

    conn.on('ReceiveMessage', handleReceive)
    startChatConnection().catch(() => {})
    return () => { mounted = false; conn.off('ReceiveMessage', handleReceive) }
  }, [user])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selected || !user || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    try {
      const sent = await sendMessage({
        conversationId: selected.id,
        senderId: user.id,
        senderName: user.businessName || user.fullName,
        receiverId: selected.customerId,
        content,
      })
      setMessages(prev => [...prev, sent])
      setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, lastMessage: content } : c))
      scrollToBottom()
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any) }
  }

  const selectConv = (conv: Conversation) => {
    setSelected(conv)
    setShowList(false)
  }

  const filteredConvs = conversations.filter(c =>
    c.customerName.toLowerCase().includes(search.toLowerCase())
  )

  // Group messages by date for separators
  const groupedMessages: Array<{ dateSep: string | null; msg: Message }> = []
  let lastDate = ''
  for (const msg of messages) {
    const sep = dateSeparator(msg.timestamp)
    groupedMessages.push({ dateSep: sep !== lastDate ? sep : null, msg })
    lastDate = sep
  }

  const contactName = selected?.customerName || ''

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar userRole="vendor" userName={user?.businessName || user?.fullName || 'Vendor'} />

        <div className="flex-1 flex overflow-hidden">

          {/* ── Conversation list ───────────────────────────────────────── */}
          <div className={`${showList ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-col border-r border-border bg-card flex-shrink-0`}>
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-base font-semibold text-foreground mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations…"
                  className="pl-9 h-9 text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-sm text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                filteredConvs.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => selectConv(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition text-left border-b border-border/40 ${selected?.id === conv.id ? 'bg-primary/8' : ''}`}
                  >
                    <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold ${avatarColor(conv.customerName)}`}>
                      {initials(conv.customerName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-semibold text-foreground truncate">{conv.customerName}</p>
                        <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                          {fmtListTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1 flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Chat panel ─────────────────────────────────────────────── */}
          <div className={`${!showList || selected ? 'flex' : 'hidden'} md:flex flex-1 flex-col overflow-hidden relative`}>

            {/* Incoming message notification */}
            {notification && (
              <div className="absolute top-16 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
                <div
                  className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 cursor-pointer max-w-xs"
                  onClick={() => {
                    const conv = conversations.find(c => c.id === notification.convId)
                    if (conv) { setSelected(conv); setShowList(false) }
                    setNotification(null)
                  }}
                >
                  <div className="p-1.5 bg-primary/10 rounded-full flex-shrink-0">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{notification.name} sent a message</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{notification.preview}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setNotification(null) }} className="text-muted-foreground hover:text-foreground ml-1 flex-shrink-0">✕</button>
                </div>
              </div>
            )}

            {selected ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                  <button className="md:hidden text-muted-foreground mr-1" onClick={() => setShowList(true)}>←</button>
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold ${avatarColor(contactName)}`}>
                    {initials(contactName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{contactName}</p>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </div>

                {/* Messages area */}
                <div
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)', backgroundSize: '24px 24px', backgroundColor: 'hsl(var(--background))' }}
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-16">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    groupedMessages.map(({ dateSep, msg }) => (
                      <div key={msg.id}>
                        {dateSep && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-[11px] text-muted-foreground bg-background border border-border rounded-full px-3 py-0.5">{dateSep}</span>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        )}
                        {msg.senderId === user?.id ? (
                          <div className="flex justify-end mb-1">
                            <div className="max-w-[72%] bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2 shadow-sm">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              <p className="text-[10px] opacity-70 text-right mt-1">{fmtMsgTime(msg.timestamp)}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-end gap-2 mb-1">
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${avatarColor(msg.senderName)}`}>
                              {initials(msg.senderName)}
                            </div>
                            <div className="max-w-[72%] bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                              <p className="text-[11px] font-semibold text-primary mb-1">{msg.senderName}</p>
                              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{fmtMsgTime(msg.timestamp)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={endRef} />
                </div>

                {/* Input bar */}
                <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card">
                  <Input
                    placeholder="Type a message…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    className="flex-1 rounded-full border-border bg-muted/40 focus:bg-background"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || sending}
                    size="icon"
                    className="rounded-full w-10 h-10 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <MessageCircle className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Customer Messages</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Conversations appear here after a customer booking is accepted.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function VendorMessagesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>}>
      <VendorMessagesContent />
    </Suspense>
  )
}
