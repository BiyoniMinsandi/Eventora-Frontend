'use client'

/**
 * Route: /vendor/portfolio
 * Purpose: Manage portfolio images and service listings.
 * Services are stored as "Title:Description" strings and rendered as cards.
 * Photos are stored as URL strings via PUT /api/users/me — no file upload server needed.
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Upload, Eye, EyeOff, Star, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { updateMeApi } from '@/lib/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface PortfolioItem {
  id: string
  title: string
  description: string
  image?: string
  featured: boolean
  views: number
}

interface PhotoItem {
  url: string
}

export default function VendorPortfolio() {
  const { user, logout, login } = useAuth()
  const router = useRouter()
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', description: '' })
  const [photos, setPhotos] = useState<string[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [savingPhotos, setSavingPhotos] = useState(false)

  const handleLogout = () => {
    // Centralize logout behavior so Sidebar can just call one handler.
    logout()
    router.push('/login')
  }

  useEffect(() => {
    if (user?.services) {
      const items: PortfolioItem[] = user.services.map((service, idx) => ({
        id: `service_${idx}`,
        title: service.split(':')[0] || service,
        description: service.split(':')[1] || 'Service description',
        featured: idx === 0,
        views: 0,
      }))
      setPortfolioItems(items)
    }
    if (user?.photos) {
      setPhotos(user.photos)
    }
  }, [user])

  const handleAddPhoto = async () => {
    if (!newPhotoUrl.trim()) return
    const updated = [...photos, newPhotoUrl.trim()]
    setSavingPhotos(true)
    const result = await updateMeApi({ photos: updated })
    if (result.success) {
      if (result.user) login(result.user)
      setPhotos(updated)
      setNewPhotoUrl('')
    }
    setSavingPhotos(false)
  }

  const handleRemovePhoto = async (idx: number) => {
    const updated = photos.filter((_, i) => i !== idx)
    setSavingPhotos(true)
    const result = await updateMeApi({ photos: updated })
    if (result.success) {
      if (result.user) login(result.user)
      setPhotos(updated)
    }
    setSavingPhotos(false)
  }

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description) return

    const updatedServices = [...(user?.services || []), `${newItem.title}:${newItem.description}`]
    const result = await updateMeApi({ services: updatedServices })

    if (result.success) {
      if (result.user) login(result.user)
      setNewItem({ title: '', description: '' })
      setShowAddDialog(false)
      // Update local state
      const newPortfolioItem: PortfolioItem = {
        id: `service_${Date.now()}`,
        title: newItem.title,
        description: newItem.description,
        featured: false,
        views: 0,
      }
      setPortfolioItems([...portfolioItems, newPortfolioItem])
    }
  }

  const handleDelete = async (id: string) => {
    const index = parseInt(id.split('_')[1])
    const updatedServices = user?.services?.filter((_, idx) => idx !== index) || []
    const result = await updateMeApi({ services: updatedServices })

    if (result.success) {
      if (result.user) login(result.user)
      setPortfolioItems(portfolioItems.filter(item => item.id !== id))
    }
  }

  const handleToggleFeatured = (id: string) => {
    setPortfolioItems(
      portfolioItems.map(item =>
        item.id === id ? { ...item, featured: !item.featured } : item
      )
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="vendor" userName={user?.businessName || user?.fullName || 'Vendor'} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio</h1>
                <p className="text-muted-foreground">Showcase your best work to attract customers</p>
              </div>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Portfolio Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Add Portfolio Item</DialogTitle>
                <DialogDescription>
                  Add a new service or portfolio item to showcase your work
                </DialogDescription>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Service/Item Title
                    </label>
                    <Input
                      placeholder="e.g., Wedding Photography"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Description
                    </label>
                    <Textarea
                      placeholder="Describe what this service includes"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem}>
                      Add Item
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Items</p>
              <p className="text-3xl font-bold text-foreground">{portfolioItems.length}</p>
              <p className="text-xs text-muted-foreground mt-2">Your portfolio items</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Views</p>
              <p className="text-3xl font-bold text-foreground">
                {portfolioItems.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">All time views</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Featured Items</p>
              <p className="text-3xl font-bold text-foreground">
                {portfolioItems.filter(item => item.featured).length}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Highlighted in profile</p>
            </Card>
          </div>

          {/* Portfolio Grid */}
          {portfolioItems.length === 0 ? (
            <Card className="p-8 text-center mb-8">
              <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No portfolio items yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first service or portfolio item
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {portfolioItems.map(item => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg mb-1">{item.title}</h3>
                      {item.featured && (
                        <div className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-bold mb-3">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views.toLocaleString()} views
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1 bg-transparent"
                    onClick={() => handleToggleFeatured(item.id)}
                  >
                    {item.featured ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Unfeature
                      </>
                    ) : (
                      <>
                        <Star className="w-3 h-3" />
                        Feature
                      </>
                    )}
                  </Button>
                </Card>
              ))}

              {/* Quick Add Card */}
              <Card
                onClick={() => setShowAddDialog(true)}
                className="p-6 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center min-h-48"
              >
                <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Add New Item</p>
                <p className="text-xs text-muted-foreground mt-1">Add another service</p>
              </Card>
            </div>
          )}
          {/* Photo Gallery Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Photo Gallery</h2>
                <p className="text-sm text-muted-foreground">Add photo URLs to showcase on your vendor profile</p>
              </div>
            </div>

            {/* Add photo URL */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Paste a photo URL (e.g. https://...)"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPhoto() } }}
              />
              <Button onClick={handleAddPhoto} disabled={savingPhotos || !newPhotoUrl.trim()} className="gap-1 shrink-0">
                <Upload className="w-4 h-4" />
                Add
              </Button>
            </div>

            {photos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No photos yet. Paste a URL above to add your first photo.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden bg-muted aspect-square">
                    <Image
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
                    />
                    <button
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
