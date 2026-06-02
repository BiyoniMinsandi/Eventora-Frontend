'use client'

/**
 * Route: /vendor/bookings
 * Purpose: View and manage vendor bookings.
 */

import Link from 'next/link'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CheckCircle2, Clock, MessageCircle, ArrowLeft } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/components/auth-provider'
import { useEffect, useState } from 'react'
import { getUserBookings, type Booking, getOrCreateConversation, updateBookingStatus, createNotification } from '@/lib/data'
import { useRouter } from 'next/navigation'

export default function VendorBookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (user) {
      const vendorBookings = getUserBookings(user.id, 'vendor')
      setBookings(vendorBookings)
    }
  }, [user])

  const filterBookings = (status: string) => {
    if (status === 'all') return bookings
    return bookings.filter((booking) => booking.status === status)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />
      case 'rejected':
        return <Clock className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const handleMessage = (booking: Booking) => {
    if (!user) return
    const conversationId = getOrCreateConversation(
      booking.customerId,
      booking.customerName || 'Customer',
      user.id,
      user.businessName || user.fullName
    )
    router.push(`/vendor/messages?conversationId=${conversationId}`)
  }

  const handleMarkCompleted = (booking: Booking) => {
    if (!user) return
    const updated = updateBookingStatus(booking.id, 'completed')
    if (!updated) return

    createNotification({
      userId: booking.customerId,
      type: 'booking_completed',
      title: 'Booking marked as completed',
      message: `${user.businessName || user.fullName} marked your booking as completed. Please leave a review.`,
      relatedBookingId: booking.id,
      read: false,
    })
    createNotification({
      userId: booking.customerId,
      type: 'review_prompt',
      title: 'Leave a review',
      message: `How was your experience with ${user.businessName || user.fullName}? Leave a review to help others.`,
      relatedBookingId: booking.id,
      read: false,
    })

    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: 'completed' } : b))
    )
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex h-screen bg-background">
        <Sidebar userRole="vendor" userName={user?.businessName || user?.fullName || 'Vendor'} />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
                <p className="text-muted-foreground">Manage your confirmed and upcoming events</p>
              </div>
            </div>

            {/* Booking Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full md:w-max grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              {['all', 'pending', 'accepted', 'completed'].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-6 space-y-4">
                  {filterBookings(tab).length > 0 ? (
                    filterBookings(tab).map((booking) => (
                      <Card key={booking.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-foreground">
                                {booking.customerName || 'Customer'}
                              </h3>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(booking.status)}
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    booking.status
                                  )}`}
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Event Type</p>
                                <p className="text-sm font-medium text-foreground">
                                  {booking.eventType}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Event Date</p>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <p className="text-sm font-medium text-foreground">
                                    {new Date(booking.eventDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Details</p>
                                <p className="text-sm text-foreground line-clamp-2">
                                  {booking.specialRequests || 'No additional details'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 mt-4 md:mt-0">
                            {(booking.status === 'accepted' || booking.status === 'completed') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-transparent gap-2"
                                onClick={() => handleMessage(booking)}
                              >
                                <MessageCircle className="w-4 h-4" />
                                Message
                              </Button>
                            )}
                            {booking.status === 'accepted' && (
                              <Button size="sm" onClick={() => handleMarkCompleted(booking)}>
                                Mark Completed
                              </Button>
                            )}
                            <Button size="sm" asChild>
                              <Link href={`/vendor/bookings/${booking.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No {tab !== 'all' ? tab : ''} bookings
                      </p>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
