'use client'

/**
 * Route: /admin/disputes
 * Purpose: Admin dispute management (SRS §4.7).
 * Admins can update dispute status (Open → In-Review → Resolved), set a resolution note,
 * and exchange messages with both the customer and vendor via the dispute message thread.
 */

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
  Clock,
  User,
  Briefcase,
  ArrowLeft,
  X,
  Send,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { logoutUser } from '@/lib/auth'
import { ProtectedRoute } from '@/components/protected-route'
import { useToast } from '@/hooks/use-toast'
import {
  getDisputes,
  updateDisputeStatus,
  getDisputeMessages,
  sendDisputeMessage,
  type Dispute,
  type DisputeMessage,
} from '@/lib/data'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  'in-review': 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const PRIORITY_BORDER: Record<string, string> = {
  high: 'border-l-red-400',
  medium: 'border-l-yellow-400',
  low: 'border-l-green-400',
}

export default function AdminDisputesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [messages, setMessages] = useState<DisputeMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')
  const [updatingDispute, setUpdatingDispute] = useState(false)

  const handleLogout = () => {
    logoutUser()
    router.push('/login')
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const data = await getDisputes()
      if (cancelled) return
      setDisputes(data)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const openMessages = async (dispute: Dispute) => {
    setSelectedDispute(dispute)
    setResolutionNote(dispute.resolution ?? '')
    const msgs = await getDisputeMessages(dispute.id)
    setMessages(msgs)
  }

  const handleSendMessage = async () => {
    if (!selectedDispute || !newMessage.trim()) return
    setSendingMessage(true)
    try {
      const msg = await sendDisputeMessage(selectedDispute.id, newMessage.trim())
      setMessages((prev) => [...prev, msg])
      setNewMessage('')
    } catch {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleUpdateStatus = async (disputeId: string, status: Dispute['status'], resolution?: string) => {
    setUpdatingDispute(true)
    try {
      await updateDisputeStatus(disputeId, status, resolution)
      setDisputes((prev) =>
        prev.map((d) => (d.id === disputeId ? { ...d, status, resolution: resolution ?? d.resolution } : d)),
      )
      if (selectedDispute?.id === disputeId) {
        setSelectedDispute((prev) => prev ? { ...prev, status, resolution: resolution ?? prev.resolution } : prev)
      }
      toast({ title: 'Updated', description: 'Dispute status updated.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to update dispute', variant: 'destructive' })
    } finally {
      setUpdatingDispute(false)
    }
  }

  const filterDisputes = (tab: string) =>
    tab === 'all' ? disputes : disputes.filter((d) => d.status === tab)

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex h-screen bg-background">
        <Sidebar userRole="admin" userName={user?.fullName || 'Admin'} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-1">Dispute Management</h1>
                <p className="text-muted-foreground">Review and resolve customer-vendor disputes</p>
              </div>
            </div>

            {loading ? (
              <p className="text-muted-foreground text-center py-12">Loading disputes...</p>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full md:w-max grid-cols-5">
                  <TabsTrigger value="all">All ({disputes.length})</TabsTrigger>
                  <TabsTrigger value="open">Open ({disputes.filter((d) => d.status === 'open').length})</TabsTrigger>
                  <TabsTrigger value="in-review">In Review ({disputes.filter((d) => d.status === 'in-review').length})</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved ({disputes.filter((d) => d.status === 'resolved').length})</TabsTrigger>
                  <TabsTrigger value="closed">Closed ({disputes.filter((d) => d.status === 'closed').length})</TabsTrigger>
                </TabsList>

                {['all', 'open', 'in-review', 'resolved', 'closed'].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-6 space-y-4">
                    {filterDisputes(tab).length === 0 ? (
                      <Card className="p-8 text-center">
                        <p className="text-muted-foreground">No {tab !== 'all' ? tab : ''} disputes</p>
                      </Card>
                    ) : (
                      filterDisputes(tab).map((dispute) => (
                        <Card key={dispute.id} className={`p-6 border-l-4 ${PRIORITY_BORDER[dispute.priority] ?? ''}`}>
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                <h3 className="font-bold text-lg">{dispute.title}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[dispute.status]}`}>
                                  {dispute.status}
                                </span>
                                <Badge variant="outline" className="text-xs capitalize">{dispute.priority} priority</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b">
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Customer</p>
                                <p className="text-sm font-medium">{dispute.customerName}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Briefcase className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Vendor</p>
                                <p className="text-sm font-medium">{dispute.vendorName}</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm bg-muted/40 rounded-lg p-3 mb-4">{dispute.description}</p>

                          {dispute.resolution && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-xs font-semibold text-green-800 mb-1">Resolution Note</p>
                              <p className="text-sm text-green-900">{dispute.resolution}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {dispute.status === 'open' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 bg-transparent"
                                disabled={updatingDispute}
                                onClick={() => handleUpdateStatus(dispute.id, 'in-review')}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Mark In-Review
                              </Button>
                            )}
                            {(dispute.status === 'open' || dispute.status === 'in-review') && (
                              <Button
                                size="sm"
                                className="gap-1"
                                disabled={updatingDispute}
                                onClick={() => handleUpdateStatus(dispute.id, 'resolved', resolutionNote || undefined)}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Resolve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 bg-transparent"
                              onClick={() => openMessages(dispute)}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Messages
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </main>

        {/* Dispute message + resolution panel */}
        {selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg flex flex-col h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b shrink-0">
                <div>
                  <p className="font-semibold">{selectedDispute.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDispute.customerName} vs {selectedDispute.vendorName}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDispute(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Message thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No messages yet.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col gap-0.5 ${msg.senderRole === 'admin' ? 'items-end' : 'items-start'}`}>
                      <p className="text-xs text-muted-foreground">{msg.senderName} ({msg.senderRole})</p>
                      <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.senderRole === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {msg.content}
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Resolution note */}
              {(selectedDispute.status === 'open' || selectedDispute.status === 'in-review') && (
                <div className="px-4 pt-3 border-t shrink-0">
                  <p className="text-xs font-medium mb-1">Resolution Note (optional, saved when you click Resolve)</p>
                  <Textarea
                    placeholder="Enter a resolution note..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows={2}
                    className="text-sm mb-2"
                  />
                  <Button
                    size="sm"
                    className="w-full gap-1 mb-2"
                    disabled={updatingDispute}
                    onClick={() => handleUpdateStatus(selectedDispute.id, 'resolved', resolutionNote || undefined)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve Dispute
                  </Button>
                </div>
              )}

              {/* Send message */}
              {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
                <div className="p-4 border-t flex gap-2 shrink-0">
                  <Input
                    placeholder="Send a message to both parties..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
