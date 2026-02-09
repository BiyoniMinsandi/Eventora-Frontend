'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Star, MapPin, Search, Filter, ChevronDown } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Loading from './loading'
import { getStoredUsers, type User } from '@/lib/auth'
import { getVendorAverageRating } from '@/lib/data'

export default function VendorBrowsePage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [vendors, setVendors] = useState<User[]>([])

  // Initialize from URL parameters and load vendors
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
    if (searchParam) {
      setSearchQuery(searchParam)
    }

    // Load approved vendors from localStorage
    const allUsers = getStoredUsers()
    const approvedVendors = allUsers.filter(u => u.role === 'vendor' && u.approved === true)
    setVendors(approvedVendors)
  }, [searchParams])

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'photography', label: 'Photography' },
    { value: 'catering', label: 'Catering' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'venues', label: 'Venues' },
    { value: 'music', label: 'Music & Entertainment' },
  ]

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = 
      vendor.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      vendor.category?.toLowerCase() === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <Suspense fallback={<Loading />}>
      <>
        <Header />
        <main className="flex-1">
          {/* Search & Filter Section */}
          <section className="border-b border-border bg-muted/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-foreground mb-6">Browse Vendors</h1>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Price Range
                    </label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                    >
                      <option value="all">All Prices</option>
                      <option value="budget">Budget Friendly</option>
                      <option value="mid">Mid Range</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Rating
                    </label>
                    <select className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm">
                      <option value="">All Ratings</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="4.0">4.0+ Stars</option>
                      <option value="3.5">3.5+ Stars</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Results Count */}
              <p className="text-sm text-muted-foreground">
                Showing {filteredVendors.length} vendors
              </p>
            </div>
          </section>

          {/* Vendors Grid */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredVendors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVendors.map((vendor) => {
                    const rating = getVendorAverageRating(vendor.id)
                    const firstPhoto = vendor.photos && vendor.photos.length > 0 ? vendor.photos[0] : null
                    
                    return (
                      <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Image */}
                        <div className="relative bg-muted h-48 w-full overflow-hidden">
                          {firstPhoto ? (
                            <img
                              src={firstPhoto}
                              alt={vendor.businessName || vendor.fullName}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                              <span className="text-4xl font-bold text-primary/20">
                                {(vendor.businessName || vendor.fullName).charAt(0)}
                              </span>
                            </div>
                          )}
                          {vendor.approved && (
                            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Verified
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="font-bold text-foreground mb-1">
                            {vendor.businessName || vendor.fullName}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-3 capitalize">
                            {vendor.category || 'Vendor'}
                          </p>

                          {/* Location */}
                          {vendor.location && (
                            <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{vendor.location}</span>
                            </div>
                          )}

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(rating.average)
                                      ? 'fill-accent text-accent'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {rating.average > 0 ? rating.average.toFixed(1) : 'No reviews'} ({rating.count} reviews)
                            </span>
                          </div>

                          {/* Price */}
                          {vendor.pricing && (
                            <p className="text-sm font-medium text-primary mb-4">{vendor.pricing}</p>
                          )}

                          {/* Description Preview */}
                          {vendor.description && (
                            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                              {vendor.description}
                            </p>
                          )}

                          {/* View Profile Button */}
                          <Button asChild className="w-full">
                            <Link href={`/vendors/${vendor.id}`}>View Profile</Link>
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {vendors.length === 0
                      ? 'No approved vendors yet. Ask an admin to approve vendor applications.'
                      : 'No vendors match your search. Try a different term or category.'}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </>
    </Suspense>
  )
}
