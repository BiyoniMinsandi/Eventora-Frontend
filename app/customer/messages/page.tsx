'use client'

/**
 * Route: /customer/messages
 * Purpose: Customer inbox + conversation view.
 * Note: Uses Suspense because it reads URL params with useSearchParams().
 */

import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Send, ArrowLeft } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/components/auth-provider'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  type Conversation,
  type Message,
} from '@/lib/data'

function CustomerMessagesContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    ;(async () => {
      const convs = await getUserConversations(user.id, 'customer')
      if (cancelled) return

      setConversations(convs)

      const fromQuery = searchParams.get('conversationId')
      if (fromQuery) {
        const match = convs.find((c) => c.id === fromQuery)
        setSelectedConversation(match || convs[0] || null)
      } else if (convs.length > 0) {
        setSelectedConversation(convs[0])
      } else {
        setSelectedConversation(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, searchParams])

  useEffect(() => {
    if (!selectedConversation || !user) return

    let cancelled = false

    ;(async () => {
      const convMessages = await getConversationMessages(selectedConversation.id)
      if (cancelled) return

      setMessages(convMessages)

      await markConversationAsRead(selectedConversation.id, user.id)

      if (cancelled) return
      setConversations((prev) => prev.map((c) => (c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c)))
    })()

    return () => {
      cancelled = true
    }
  }, [selectedConversation, user])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageInput.trim() || !selectedConversation || !user) return

    setLoading(true)

    try {
      await sendMessage({
        conversationId: selectedConversation.id,
        senderId: user.id,
        senderName: user.fullName,
        receiverId: selectedConversation.vendorId,
        content: messageInput,
      })

      setMessageInput('')
      const convMessages = await getConversationMessages(selectedConversation.id)
      setMessages(convMessages)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="flex h-screen bg-background">
        <Sidebar userRole="customer" userName={user?.fullName || 'Customer'} />

        <main className="flex-1 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="border-b border-border p-4 bg-card flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedConversation.vendorName}
                  </h2>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Start a conversation with {selectedConversation.vendorName}!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-card space-y-3">
                <Textarea
                  placeholder="Type your message..."
                  rows={3}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={loading}
                  className="resize-none"
                />
                <Button type="submit" disabled={!messageInput.trim() || loading} className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <MessageCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No Conversations</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                You don't have any conversations yet. Start by booking a vendor and messaging them!
              </p>
              <Button asChild>
                <Link href="/vendors">Browse Vendors</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default function CustomerMessagesPage() {
  // Next.js requires `useSearchParams()` to be used under a Suspense boundary.
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <CustomerMessagesContent />
    </Suspense>
  )
}
