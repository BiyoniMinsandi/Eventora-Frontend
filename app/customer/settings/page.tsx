'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Save,
  ArrowLeft,
} from 'lucide-react'

export default function CustomerSettings() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('preferences')

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="customer" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences and privacy</p>
            </div
            <p className="text-muted-foreground">Manage your account preferences and privacy</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Account Preferences</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Preferred Language
                      </label>
                      <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>English</option>
                        <option>Sinhala</option>
                        <option>Tamil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Theme
                      </label>
                      <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Auto</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Currency Preference
                      </label>
                      <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>LKR (Rs.)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Timezone
                      </label>
                      <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Asia/Colombo (UTC+5:30)</option>
                        <option>Asia/Kolkata (UTC+5:30)</option>
                        <option>UTC</option>
                      </select>
                    </div>
                  </div>

                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-muted border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="bg-muted border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-muted border-border"
                    />
                  </div>

                  <Button className="gap-2">
                    <Lock className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
              </Card>

              <Card className="p-8 bg-primary/5 border-primary/20">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Two-Factor Authentication
                </h2>
                <p className="text-muted-foreground mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Enable Two-Factor Authentication
                </Button>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="p-8">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Booking Confirmations',
                      description: 'When your bookings are confirmed or cancelled',
                      enabled: true,
                    },
                    {
                      title: 'Vendor Messages',
                      description: 'Messages from vendors about your booking',
                      enabled: true,
                    },
                    {
                      title: 'Event Reminders',
                      description: 'Reminders about upcoming events',
                      enabled: true,
                    },
                    {
                      title: 'Reviews Request',
                      description: 'Requests to review vendors after events',
                      enabled: true,
                    },
                    {
                      title: 'Special Offers',
                      description: 'Promotions and special deals from vendors',
                      enabled: false,
                    },
                    {
                      title: 'Weekly Newsletter',
                      description: 'Weekly updates about new vendors and features',
                      enabled: false,
                    },
                  ].map((notification) => (
                    <div
                      key={notification.title}
                      className="flex items-start justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={notification.enabled}
                        className="mt-1 w-5 h-5 rounded border-border cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <Button className="mt-6 gap-2">
                  <Save className="w-4 h-4" />
                  Save Notification Settings
                </Button>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Privacy & Data</h2>
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Allow vendors to see your profile information
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1 w-5 h-5 rounded border-border cursor-pointer"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Share Activity</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Help improve the platform by sharing usage analytics
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1 w-5 h-5 rounded border-border cursor-pointer"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h2 className="text-lg font-bold text-foreground mb-6">Data Management</h2>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    Download My Data
                  </Button>
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    Export Bookings History
                  </Button>
                </div>
              </Card>

              <Card className="p-8 border-red-200 bg-red-50">
                <h2 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h2>
                <p className="text-sm text-red-800 mb-4">
                  Deleting your account is permanent and cannot be undone. All your data will be
                  deleted.
                </p>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
