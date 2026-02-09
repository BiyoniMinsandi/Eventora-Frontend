'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Users,
  Search,
  MoreVertical,
  Ban,
  CheckCircle2,
  Mail,
  Calendar,
  UserCheck,
} from 'lucide-react'
import { getStoredUsers, type User } from '@/lib/auth'

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    const users = getStoredUsers()
    setAllUsers(users)
    setFilteredUsers(users)
  }, [])

  useEffect(() => {
    let filtered = allUsers

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(user => user.role !== 'vendor' || user.approved === true)
      } else if (selectedStatus === 'pending') {
        filtered = filtered.filter(user => user.role === 'vendor' && user.approved === false)
      }
    }

    setFilteredUsers(filtered)
  }, [allUsers, searchQuery, selectedRole, selectedStatus])

  const getUserStatus = (user: User): string => {
    if (user.role === 'vendor') {
      if (user.rejectedAt) return 'rejected'
      if (user.approved === false) return 'pending'
      return 'active'
    }
    return 'active'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'vendor':
        return 'bg-primary/10 text-primary'
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-secondary/10 text-secondary'
    }
  }

  const stats = [
    { 
      label: 'Total Users', 
      value: String(allUsers.length), 
      icon: Users 
    },
    { 
      label: 'Active Vendors', 
      value: String(allUsers.filter(u => u.role === 'vendor' && u.approved).length), 
      icon: CheckCircle2 
    },
    { 
      label: 'Pending Vendors', 
      value: String(allUsers.filter(u => u.role === 'vendor' && u.approved === false).length), 
      icon: Ban 
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" userName="Admin User" />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage all customers and vendors on the platform</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Search and Filter */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="vendor">Vendors</option>
                <option value="admin">Admins</option>
              </select>
              <select 
                className="px-4 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No users found matching the filters
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const status = getUserStatus(user)
                      return (
                        <tr
                          key={user.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {(user.businessName || user.fullName).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {user.businessName || user.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {allUsers.length} users
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
