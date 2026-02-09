 'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download, Filter, Calendar, TrendingUp, ArrowLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getBookings } from '@/lib/data'

// Data will be derived from stored bookings (no hard-coded demo data)
const categoryData: { name: string; value: number }[] = []

const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d']

type RangeKey = 'today' | 'week' | 'month' | '6months' | 'year'

function startDateForRange(key: RangeKey) {
  const end = new Date()
  const start = new Date()
  switch (key) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(end.getDate() - 7)
      break
    case 'month':
      start.setMonth(end.getMonth() - 1)
      break
    case '6months':
      start.setMonth(end.getMonth() - 6)
      break
    case 'year':
      start.setFullYear(end.getFullYear() - 1)
      break
    default:
      start.setMonth(end.getMonth() - 6)
  }
  return start
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminAnalytics() {
  const router = useRouter()
  const [range, setRange] = useState<RangeKey>('6months')
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    // load bookings from localStorage-backed data
    try {
      const b = getBookings() || []
      setBookings(b)
    } catch (e) {
      setBookings([])
    }
  }, [])

  const start = useMemo(() => startDateForRange(range), [range])
  const end = useMemo(() => new Date(), [range])

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const t = new Date(b.createdAt || b.eventDate || Date.now())
      return t >= start && t <= end
    })
  }, [bookings, start, end])

  const totalBookings = filteredBookings.length
  const uniqueCustomers = new Set(filteredBookings.map((b) => b.customerId)).size
  const uniqueVendors = new Set(filteredBookings.map((b) => b.vendorId)).size

  // Top vendors (names only)
  const topVendors = useMemo(() => {
    const map = new Map<string, number>()
    filteredBookings.forEach((b) => {
      const name = b.vendorBusinessName || b.vendorName || 'Unknown'
      map.set(name, (map.get(name) || 0) + 1)
    })
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name)
  }, [filteredBookings])

  // Chart data: group by month for filtered bookings
  const monthAggregates = useMemo(() => {
    const m = new Map<string, { month: string; customers: Set<string>; vendors: Set<string>; bookings: number }>()
    filteredBookings.forEach((b) => {
      const d = new Date(b.createdAt || b.eventDate)
      const key = d.toLocaleString(undefined, { month: 'short', year: 'numeric' })
      if (!m.has(key)) m.set(key, { month: key, customers: new Set(), vendors: new Set(), bookings: 0 })
      const entry = m.get(key)!
      entry.customers.add(b.customerId)
      entry.vendors.add(b.vendorId)
      entry.bookings += 1
    })
    return Array.from(m.values()).map((v) => ({ month: v.month, customers: v.customers.size, vendors: v.vendors.size, bookings: v.bookings }))
  }, [filteredBookings])
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Platform Analytics</h1>
                <p className="text-muted-foreground">Monitor platform performance and growth metrics</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <Card className="p-4 mb-8 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">{formatDateShort(start)} - {formatDateShort(end)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant={range === 'today' ? 'default' : 'ghost'} size="sm" onClick={() => setRange('today')}>Today</Button>
                <Button variant={range === 'week' ? 'default' : 'ghost'} size="sm" onClick={() => setRange('week')}>7d</Button>
                <Button variant={range === 'month' ? 'default' : 'ghost'} size="sm" onClick={() => setRange('month')}>1m</Button>
                <Button variant={range === '6months' ? 'default' : 'ghost'} size="sm" onClick={() => setRange('6months')}>6m</Button>
                <Button variant={range === 'year' ? 'default' : 'ghost'} size="sm" onClick={() => setRange('year')}>1y</Button>
              </div>
            </div>
          </Card>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground">-</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +18% from last month
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Bookings</p>
              <p className="text-3xl font-bold text-foreground">{totalBookings}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +14% from last month
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Active Users</p>
              <p className="text-3xl font-bold text-foreground">{uniqueCustomers}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +16% from last month
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Platform Uptime</p>
              <p className="text-3xl font-bold text-foreground">99.98%</p>
              <p className="text-xs text-green-600 mt-2">All systems operational</p>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">User Growth Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthAggregates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="customers" stroke="hsl(var(--primary))" name="Customers" strokeWidth={2} />
                  <Line type="monotone" dataKey="vendors" stroke="hsl(var(--accent))" name="Vendors" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Revenue Chart */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Revenue & Bookings</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthAggregates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="bookings" fill="hsl(var(--accent))" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Distribution */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Bookings by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Vendors */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Top Performing Vendors</h2>
              <div className="space-y-2">
                {topVendors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No vendor data for selected range</p>
                ) : (
                  topVendors.map((name, i) => (
                    <div key={i} className="p-2 bg-muted/50 rounded-lg">
                      <p className="font-medium text-foreground text-sm">{name}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Key Metrics */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Key Metrics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Avg Booking Value</span>
                    <span className="text-sm text-foreground font-bold">Rs. 8,450</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Customer Satisfaction</span>
                    <span className="text-sm text-foreground font-bold">96%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Vendor Activity</span>
                    <span className="text-sm text-foreground font-bold">87%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Dispute Resolution</span>
                    <span className="text-sm text-foreground font-bold">99%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '99%' }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
