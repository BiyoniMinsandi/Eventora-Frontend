'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Send, ArrowLeft } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/components/auth-provider'
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  type Conversation,
  type Message,
} from '@/lib/data'

export default function VendorMessagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const convs = getUserConversations(user.id, 'vendor')
      setConversations(convs)
      const fromQuery = searchParams.get('conversationId')
      if (fromQuery) {
        const match = convs.find((c) => c.id === fromQuery)
        setSelectedConversation(match || convs[0] || null)
      } else if (convs.length > 0) {
        setSelectedConversation(convs[0])
      }
    }
  }, [user, searchParams])

  useEffect(() => {
    if (selectedConversation) {
      const convMessages = getConversationMessages(selectedConversation.id)
      setMessages(convMessages)

      if (user) {
        markConversationAsRead(selectedConversation.id, user.id)
        const updated = conversations.map((c) =>
          c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c
        )
        setConversations(updated)
      }
    }
  }, [selectedConversation, user])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim() || !selectedConversation || !user) return

    setLoading(true)

    sendMessage({
      conversationId: selectedConversation.id,
      senderId: user.id,
      senderName: user.businessName || user.fullName,
      receiverId: selectedConversation.customerId,
      content: messageInput,
    })

    setMessageInput('')
    const convMessages = getConversationMessages(selectedConversation.id)
    setMessages(convMessages)
    setLoading(false)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex h-screen bg-background">
        <Sidebar userRole="vendor" userName={user?.businessName || user?.fullName || 'Vendor'} />

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
                    {selectedConversation.customerName}
                  </h2>
                  <p className="text-sm text-muted-foreground">Customer</p>
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
                      Start a conversation with {selectedConversation.customerName}!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 text-sm shadow ${
                          message.senderId === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-[10px] opacity-70 mt-1 flex items-center gap-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-card flex gap-3">
                <Textarea
                  placeholder="Type a message"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                  rows={1}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !messageInput.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Conversations will appear here after customers send you booking requests or messages.
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
