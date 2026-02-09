'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, MapPin, Phone, Mail, ArrowLeft, Calendar, AlertCircle } from 'lucide-react'
import { BookingDialog } from '@/components/booking-dialog'
import { getVendorReviews, getVendorAverageRating } from '@/lib/data'
import { useEffect, useState } from 'react'
import { getStoredUsers, type User } from '@/lib/auth'

interface VendorProfilePageProps {
  params: {
    id: string
  }
}

export default function VendorProfilePage({ params }: VendorProfilePageProps) {
  const [vendor, setVendor] = useState<User | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const normalizeSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const isApprovedVendor = (candidate: User) =>
    candidate.role === 'vendor' &&
    (candidate.approved === true || candidate.approved === 'true' || Boolean(candidate.approvedAt))

  useEffect(() => {
    const allUsers = getStoredUsers()
    const paramId = decodeURIComponent(params.id)
    const found =
      allUsers.find((u) => u.id === paramId && isApprovedVendor(u)) ||
      allUsers.find(
        (u) =>
          isApprovedVendor(u) &&
          normalizeSlug(u.businessName || u.fullName) === normalizeSlug(paramId)
      )
    setVendor(found || null)
    setIsLoading(false)
  }, [params.id])

  useEffect(() => {
    // Load real reviews from localStorage
    const vendorReviews = getVendorReviews(params.id)
    setReviews(vendorReviews)
    const rating = getVendorAverageRating(params.id)
    setAvgRating(rating)
  }, [params.id])

  if (!vendor && !isLoading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Vendor not found</h1>
            <p className="text-muted-foreground mb-4">This vendor is unavailable or not approved yet.</p>
            <Button asChild>
              <Link href="/vendors">Back to vendors</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!vendor) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <p className="text-muted-foreground">Loading vendor profile...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const services = (vendor.services || []).map((service, idx) => ({
    id: `${vendor.id}-${idx}`,
    name: service.split(':')[0] || service,
    price: service.split(':')[1] || '',
  }))

  const galleryPhotos = vendor.photos || []

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Back Button */}
        <div className="border-b border-border sticky top-16 z-40 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/vendors">
                <ArrowLeft className="w-4 h-4" />
                Back to Vendors
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative w-full h-48 md:h-64 overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-accent/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/80 px-4 py-2 rounded-full border border-border text-sm font-medium">
              Verified vendor
            </div>
          </div>
        </section>

        {/* Profile Header */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-2">{vendor.businessName || vendor.fullName}</h1>
                <p className="text-muted-foreground mb-3">{vendor.category || 'Vendor'}</p>

                {/* Rating & Location */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(avgRating || 0)
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}</span>
                    <span className="text-muted-foreground">({reviews.length} reviews)</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {vendor.location || 'Location not provided'}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                      {vendor.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {vendor.phone ? (
                      <a href={`tel:${vendor.phone}`} className="text-primary hover:underline">
                        {vendor.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Phone not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <BookingDialog
                vendorId={vendor.id}
                vendorName={vendor.businessName || vendor.fullName}
                vendorBusinessName={vendor.businessName || vendor.fullName}
              />
            </div>
          </div>
        </section>

        {/* Availability */}
        <section className="bg-green-50 border-b border-green-200 p-4 mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Available for bookings</p>
              <p className="text-sm text-green-800">The vendor will confirm availability after your request.</p>
            </div>
          </div>
        </section>

        {/* Tabs Content */}
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full md:w-max grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">About</h3>
                  <p className="text-foreground leading-relaxed mb-4">{vendor.description || 'No description provided yet.'}</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Experience</h4>
                      <p className="text-muted-foreground">{vendor.experience}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Location</h4>
                      <p className="text-muted-foreground">{vendor.location || 'Location not provided'}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-6">
                <div className="space-y-4">
                  {services.length === 0 && (
                    <Card className="p-6">
                      <p className="text-muted-foreground">No services listed yet.</p>
                    </Card>
                  )}
                  {services.map((service) => (
                    <Card key={service.id} className="p-6 flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                      </div>
                      {service.price && <p className="font-bold text-primary">{service.price}</p>}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="mt-6">
                {galleryPhotos.length === 0 ? (
                  <Card className="p-6">
                    <p className="text-muted-foreground">No gallery photos yet.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryPhotos.map((photo, index) => (
                      <div
                        key={`${vendor.id}-photo-${index}`}
                        className="relative bg-muted rounded-lg h-40 overflow-hidden border border-border hover:border-primary transition cursor-pointer group"
                      >
                        <img
                          src={photo}
                          alt={`Vendor photo ${index + 1}`}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <Card className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Star className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Be the first to leave a review after booking this vendor!
                      </p>
                    </Card>
                  ) : (
                    reviews.map((review) => (
                      <Card key={review.id} className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-foreground">{review.customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-accent text-accent'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground">{review.comment}</p>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
