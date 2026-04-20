'use client'

/**
 * Route: /admin/bookings
 * Purpose: Admin booking monitoring dashboard — view all bookings across the platform.
 * Only accessible to admins. Data comes from GET /api/admin/bookings which returns
 * every booking regardless of customer or vendor.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/components/auth-provider'
import { logoutUser } from '@/lib/auth'
import { getBookings, type Booking } from '@/lib/data'
import { ArrowLeft, Search, Calendar, User, Briefcase } from 'lucide-react'

const STATUS_COLORS: Record<Booking['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default function AdminBookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filtered, setFiltered] = useState<Booking[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    logoutUser()
    router.push('/login')
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const data = await getBookings()
      if (cancelled) return
      setBookings(data)
      setFiltered(data)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let result = bookings
    if (statusFilter !== 'all') result = result.filter((b) => b.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.vendorBusinessName.toLowerCase().includes(q) ||
          b.service.toLowerCase().includes(q) ||
          b.eventType.toLowerCase().includes(q),
      )
    }
    setFiltered(result)
  }, [bookings, search, statusFilter])

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    accepted: bookings.filter((b) => b.status === 'accepted').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex h-screen bg-background">
        <Sidebar userRole="admin" userName={user?.fullName || 'Admin'} onLogout={handleLogout} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-1">Booking Monitoring</h1>
                <p className="text-muted-foreground">All bookings across the platform</p>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {(Object.keys(counts) as Array<keyof typeof counts>).map((key) => (
                <Card
                  key={key}
                  className={`p-4 text-center cursor-pointer transition-colors ${statusFilter === key ? 'border-primary' : ''}`}
                  onClick={() => setStatusFilter(key)}
                >
                  <p className="text-2xl font-bold">{counts[key]}</p>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                </Card>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by customer, vendor, service, or event type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Bookings list */}
            {loading ? (
              <p className="text-muted-foreground text-center py-12">Loading bookings...</p>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No bookings found.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((booking) => (
                  <Card key={booking.id} className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[booking.status]}`}>
                            {booking.status}
                          </span>
                          <span className="text-xs text-muted-foreground">#{booking.id.slice(-8)}</span>
                        </div>
                        <p className="font-semibold">{booking.service}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {booking.customerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            {booking.vendorBusinessName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {booking.eventDate}
                          </span>
                        </div>
                        {booking.vendorResponseNote && (
                          <p className="text-xs text-muted-foreground italic">
                            Vendor note: {booking.vendorResponseNote}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                        {booking.budget && (
                          <p className="text-sm font-medium">{booking.budget}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
