'use client'

/**
 * Route: /admin/dashboard
 * Purpose: Admin overview (user/vendor counts + navigation to admin tasks).
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Briefcase,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Activity,
  ArrowLeft,
} from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/components/auth-provider'
import { logoutUser } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { getAdminUsers, getPendingVendors, getVendors, getBookings, getDisputes } from '@/lib/data'

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  // Clears auth and returns to login.
  const handleLogout = () => {
    logoutUser()
    router.push('/login')
  }
  const [vendorStats, setVendorStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [allUsers, setAllUsers] = useState({ customers: 0, vendors: 0, admins: 0 })
  const [bookingCount, setBookingCount] = useState(0)
  const [activeDisputeCount, setActiveDisputeCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const [users, pendingVendors, approvedVendors, bookings, disputes] = await Promise.all([
        getAdminUsers(),
        getPendingVendors(),
        getVendors(),
        getBookings(),
        getDisputes(),
      ])

      if (cancelled) return

      setVendorStats({
        pending: pendingVendors.length,
        approved: approvedVendors.length,
        rejected: 0,
      })

      setAllUsers({
        customers: users.filter((u) => u.role === 'customer').length,
        vendors: users.filter((u) => u.role === 'vendor').length,
        admins: users.filter((u) => u.role === 'admin').length,
      })

      setBookingCount(bookings.length)
      setActiveDisputeCount(disputes.filter((d) => d.status === 'open' || d.status === 'in-review').length)
    })()

    return () => {
      cancelled = true
    }
  }, [])
  
  const stats = [
    {
      label: 'Total Users',
      value: String(allUsers.customers + allUsers.vendors + allUsers.admins),
      icon: Users,
      color: 'text-primary',
      trend: `${allUsers.customers} customers, ${allUsers.vendors} vendors`,
    },
    {
      label: 'Pending Vendors',
      value: String(vendorStats.pending),
      icon: Clock,
      color: 'text-yellow-600',
      trend: 'Require approval',
      link: '/admin/approvals',
    },
    {
      label: 'Approved Vendors',
      value: String(vendorStats.approved),
      icon: CheckCircle2,
      color: 'text-green-600',
      trend: 'Active on platform',
    },
    {
      label: 'Total Bookings',
      value: String(bookingCount),
      icon: ShoppingCart,
      color: 'text-blue-600',
      trend: 'From all customers',
    },
    {
      label: 'Platform Health',
      value: '100%',
      icon: Activity,
      color: 'text-emerald-600',
      trend: 'System operational',
    },
    {
      label: 'Active Disputes',
      value: String(activeDisputeCount),
      icon: AlertTriangle,
      color: 'text-red-600',
      trend: `${activeDisputeCount} requiring attention`,
    },
  ]

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
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage platform, vendors, and users</p>
              </div>
            </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              const isClickable = stat.link ? true : false
              
              const content = (
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-muted rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              )

              return (
                <Card key={stat.label} className={`p-6 ${isClickable ? 'hover:border-primary cursor-pointer transition-colors' : ''}`}>
                  {isClickable ? (
                    <Link href={stat.link || '#'}>
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Actions */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Key Actions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button asChild className="w-full">
                    <Link href="/admin/approvals">
                      <Clock className="w-4 h-4 mr-2" />
                      Review Vendor Applications
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/admin/disputes">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Handle Disputes
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/admin/settings">
                      <Users className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* System Status */}
              <Card className="p-6 border-green-200 bg-green-50">
                <h3 className="font-bold text-green-900 mb-2">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">Uptime</span>
                    <span className="font-bold text-green-900">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">Response Time</span>
                    <span className="font-bold text-green-900">&lt;100ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">Active Users</span>
                    <span className="font-bold text-green-900">{allUsers.customers + allUsers.vendors}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-bold mb-4">Platform Overview</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Customers</p>
                    <p className="text-2xl font-bold">{allUsers.customers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vendors (Approved)</p>
                    <p className="text-2xl font-bold">{vendorStats.approved}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Approvals</p>
                    <p className="text-2xl font-bold text-yellow-600">{vendorStats.pending}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{vendorStats.rejected}</p>
                  </div>
                </div>
              </Card>

              {vendorStats.pending > 0 && (
                <Card className="p-6 border-yellow-200 bg-yellow-50">
                  <h3 className="font-bold text-yellow-900 mb-2">Pending Action</h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    {vendorStats.pending} vendor application{vendorStats.pending !== 1 ? 's' : ''} waiting for approval
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/admin/approvals">Review Now</Link>
                  </Button>
                </Card>
              )}
            </div>
          </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
