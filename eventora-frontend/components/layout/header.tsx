'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CalendarDays, Menu, X, LogOut, User, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { logoutUser, getRoleRedirectUrl } from '@/lib/auth'
import { getUnreadNotificationCount } from '@/lib/data'

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout: authLogout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0)
      return
    }

    const fetchCount = async () => {
      try {
        const count = await getUnreadNotificationCount(user.id)
        setUnreadCount(count)
      } catch {}
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  const handleLogout = () => {
    logoutUser()
    authLogout()
    router.push('/login')
  }

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <CalendarDays className="w-6 h-6" />
            <span>Eventora</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition">
              Home
            </Link>
            <Link href="/vendors" className="text-sm font-medium text-foreground hover:text-primary transition">
              Browse Vendors
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition">
              About
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={`/${user.role === 'admin' ? 'admin' : user.role === 'vendor' ? 'vendor' : 'customer'}/notifications`}
                  className="relative p-2 rounded-md hover:bg-muted transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Button variant="ghost" asChild>
                  <Link href={getRoleRedirectUrl(user.role)}>
                    <User className="w-4 h-4 mr-2" />
                    {user.fullName}
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
            >
              Home
            </Link>
            <Link
              href="/vendors"
              className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
            >
              Browse Vendors
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
            >
              About
            </Link>
            <div className="flex gap-2 px-4 pt-2">
              {isAuthenticated && user ? (
                <>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={getRoleRedirectUrl(user.role)}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="flex-1">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
