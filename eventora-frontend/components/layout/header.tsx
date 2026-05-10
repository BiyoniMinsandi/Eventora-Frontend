'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CalendarDays, Menu, X, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { logoutUser, getRoleRedirectUrl } from '@/lib/auth'

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout: authLogout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
