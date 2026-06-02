'use client'

/**
 * Route: /vendor/analytics
 * Purpose: Vendor analytics charts derived from bookings.
 */

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { TrendingUp, Calendar, Download, Filter, ArrowLeft } from 'lucide-react'

const revenueData = [
  { month: 'Jan', revenue: 4000, bookings: 5 },
  { month: 'Feb', revenue: 5200, bookings: 6 },
  { month: 'Mar', revenue: 6800, bookings: 8 },
  { month: 'Apr', revenue: 7200, bookings: 9 },
  { month: 'May', revenue: 8500, bookings: 11 },
  { month: 'Jun', revenue: 9800, bookings: 13 },
]

const bookingSourceData = [
  { name: 'Search', value: 45 },
  { name: 'Direct', value: 25 },
  { name: 'Reviews', value: 20 },
  { name: 'Referral', value: 10 },
]

const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#8884d8']

export default function VendorAnalytics() {
  const router = useRouter()
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="vendor" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
                <p className="text-muted-foreground">Track your business performance and growth</p>
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
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Last 6 Months (Jan - Jun 2024)</p>
              </div>
            </div>
          </Card>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground">Rs. 41,500</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +18% from last month
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Bookings</p>
              <p className="text-3xl font-bold text-foreground">52</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +22% from last month
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Average Rating</p>
              <p className="text-3xl font-bold text-foreground">4.9</p>
              <p className="text-xs text-muted-foreground mt-2">Based on 128 reviews</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Conversion Rate</p>
              <p className="text-3xl font-bold text-foreground">32%</p>
              <p className="text-xs text-muted-foreground mt-2">Profile views to bookings</p>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Revenue & Bookings Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
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
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    name="Revenue (Rs.)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="hsl(var(--accent))"
                    name="Bookings"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Booking Source */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Booking Sources</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Response Time */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Performance Metrics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Response Time</span>
                    <span className="text-sm text-muted-foreground">2.1 hours avg</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Acceptance Rate</span>
                    <span className="text-sm text-muted-foreground">95%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Completion Rate</span>
                    <span className="text-sm text-muted-foreground">98%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Customer Satisfaction</span>
                    <span className="text-sm text-muted-foreground">96%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Events */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Top Performing Events</h2>
              <div className="space-y-4">
                {[
                  { event: 'Wedding Photography', bookings: 18, revenue: 'Rs. 18,000' },
                  { event: 'Corporate Events', bookings: 12, revenue: 'Rs. 12,000' },
                  { event: 'Birthday Parties', bookings: 15, revenue: 'Rs. 7,500' },
                  { event: 'Engagement Ceremonies', bookings: 7, revenue: 'Rs. 4,000' },
                ].map(item => (
                  <div
                    key={item.event}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.bookings} bookings</p>
                    </div>
                    <p className="font-bold text-foreground">{item.revenue}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
