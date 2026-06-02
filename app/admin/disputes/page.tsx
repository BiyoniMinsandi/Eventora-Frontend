'use client'

/**
 * Route: /admin/disputes
 * Purpose: View disputes and take admin actions.
 */

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, MessageCircle, CheckCircle2, Clock, User, Briefcase, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getDisputes } from '@/lib/data'

export default function AdminDisputesPage() {
  const router = useRouter()
  const [disputes, setDisputes] = useState<any[]>([])

  useEffect(() => {
    // Load disputes from client-side storage. This will show only actual disputes created
    // via the app (no hard-coded demo entries).
    const stored = getDisputes()
    if (Array.isArray(stored)) setDisputes(stored)
  }, [])

  const filterDisputes = (status: string) => {
    if (status === 'all') return disputes
    return disputes.filter((dispute) => dispute.status === status)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50'
      case 'medium':
        return 'border-yellow-300 bg-yellow-50'
      case 'low':
        return 'border-green-300 bg-green-50'
      default:
        return 'border-border'
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" userName="Admin User" />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Dispute Management</h1>
              <p className="text-muted-foreground">Review and resolve customer-vendor disputes</p>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full md:w-max grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            {['all', 'open', 'pending', 'resolved'].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6 space-y-4">
                {filterDisputes(tab).length > 0 ? (
                  filterDisputes(tab).map((dispute) => (
                    <Card
                      key={dispute.id}
                      className={`p-6 border-l-4 ${getPriorityColor(dispute.priority)}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <h3 className="font-bold text-lg text-foreground">
                              {dispute.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                dispute.status
                              )}`}
                            >
                              {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {dispute.createdAt}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 text-right">
                          <p className="text-sm font-bold text-primary">
                            Amount: {dispute.amount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Priority:{' '}
                            <span className="font-medium">
                              {dispute.priority.charAt(0).toUpperCase() +
                                dispute.priority.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Parties */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
                        <div className="flex items-start gap-3">
                          <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Vendor</p>
                            <p className="text-sm font-medium text-foreground">
                              {dispute.vendor}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Rating: {dispute.vendorRating}/5
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <User className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Customer</p>
                            <p className="text-sm font-medium text-foreground">
                              {dispute.customer}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Dispute Description</p>
                        <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                          {dispute.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {dispute.status === 'open' && (
                          <>
                            <Button className="gap-2 flex-1 sm:flex-none">
                              <CheckCircle2 className="w-4 h-4" />
                              Mark as Resolved
                            </Button>
                            <Button variant="outline" className="gap-2 flex-1 sm:flex-none bg-transparent">
                              <Clock className="w-4 h-4" />
                              Request Info
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          className="gap-2 flex-1 sm:flex-none bg-transparent"
                          asChild
                        >
                          <Link href={`/admin/disputes/${dispute.id}`}>
                            <MessageCircle className="w-4 h-4" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No {tab !== 'all' ? tab : ''} disputes
                    </p>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
