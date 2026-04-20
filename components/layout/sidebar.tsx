'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Briefcase,
  ShoppingCart,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  FileCheck,
  AlertTriangle,
  ImageIcon,
  BarChart3,
  Zap,
  FileText,
  Bell,
  Star,
} from 'lucide-react'

interface SidebarProps {
  userRole: 'customer' | 'vendor' | 'admin'
  userName?: string
  onLogout?: () => void
}

const getNavItems = (role: 'customer' | 'vendor' | 'admin') => {
  const baseItems = [
    {
      label: 'Dashboard',
      href: `/${role}/dashboard`,
      icon: LayoutDashboard,
    },
  ]

  const customerItems = [
    ...baseItems,
    {
      label: 'Browse Vendors',
      href: '/vendors',
      icon: Briefcase,
    },
    {
      label: 'My Bookings',
      href: '/customer/bookings',
      icon: ShoppingCart,
    },
    {
      label: 'Disputes',
      href: '/customer/disputes',
      icon: AlertTriangle,
    },
    {
      label: 'Messages',
      href: '/customer/messages',
      icon: MessageSquare,
    },
    {
      label: 'Notifications',
      href: '/customer/notifications',
      icon: Bell,
    },
    {
      label: 'My Profile',
      href: '/customer/profile',
      icon: Users,
    },
    {
      label: 'Settings',
      href: '/customer/settings',
      icon: Settings,
    },
  ]

  const vendorItems = [
    ...baseItems,
    {
      label: 'Booking Requests',
      href: '/vendor/requests',
      icon: FileCheck,
    },
    {
      label: 'My Bookings',
      href: '/vendor/bookings',
      icon: ShoppingCart,
    },
    {
      label: 'Availability',
      href: '/vendor/availability',
      icon: Zap,
    },
    {
      label: 'Portfolio',
      href: '/vendor/portfolio',
      icon: ImageIcon,
    },
    {
      label: 'Analytics',
      href: '/vendor/analytics',
      icon: BarChart3,
    },
    {
      label: 'Messages',
      href: '/vendor/messages',
      icon: MessageSquare,
    },
    {
      label: 'Notifications',
      href: '/vendor/notifications',
      icon: Bell,
    },
    {
      label: 'Settings',
      href: '/vendor/settings',
      icon: Settings,
    },
  ]

  const adminItems = [
    ...baseItems,
    {
      label: 'Users',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'Approvals',
      href: '/admin/approvals',
      icon: FileCheck,
    },
    {
      label: 'Bookings',
      href: '/admin/bookings',
      icon: ShoppingCart,
    },
    {
      label: 'Disputes',
      href: '/admin/disputes',
      icon: AlertTriangle,
    },
    {
      label: 'Reviews',
      href: '/admin/reviews',
      icon: Star,
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      label: 'Content',
      href: '/admin/content',
      icon: FileText,
    },
    {
      label: 'System Settings',
      href: '/admin/settings',
      icon: Zap,
    },
    {
      label: 'Profile',
      href: '/admin/profile',
      icon: Settings,
    },
  ]

  const itemsMap = {
    customer: customerItems,
    vendor: vendorItems,
    admin: adminItems,
  }

  return itemsMap[role]
}

export function Sidebar({ userRole, userName, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItems(userRole)

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 border-r border-border bg-sidebar min-h-screen flex flex-col">
      {/* User Info */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold mb-3">
          {userName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <p className="text-sm font-medium text-sidebar-foreground truncate">{userName || 'User'}</p>
        <p className="text-xs text-sidebar-foreground/60 capitalize">{userRole}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/20 bg-transparent"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}
