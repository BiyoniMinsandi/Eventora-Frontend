'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getVendorsForApproval, approveVendor, rejectVendor, type User } from '@/lib/auth'
import { CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Calendar, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ProtectedRoute } from '@/components/protected-route'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'

export default function AdminApprovalsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [vendors, setVendors] = useState<{
    pending: User[]
    approved: User[]
    rejected: User[]
  }>({
    pending: [],
    approved: [],
    rejected: [],
  })
  
  const [selectedVendor, setSelectedVendor] = useState<User | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = () => {
    const data = getVendorsForApproval()
    setVendors(data)
  }

  const handleApprove = (vendorId: string) => {
    const result = approveVendor(vendorId)
    
    if (result.success) {
      toast({
        title: 'Vendor Approved',
        description: 'The vendor has been approved and can now login',
      })
      loadVendors()
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      })
    }
  }

  const handleRejectClick = (vendor: User) => {
    setSelectedVendor(vendor)
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = () => {
    if (!selectedVendor || !rejectionReason.trim()) return

    const result = rejectVendor(selectedVendor.id, rejectionReason)
    
    if (result.success) {
      toast({
        title: 'Vendor Rejected',
        description: 'The vendor application has been rejected',
      })
      loadVendors()
      setRejectDialogOpen(false)
      setRejectionReason('')
      setSelectedVendor(null)
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      })
    }
  }

  const VendorCard = ({ vendor, status }: { vendor: User; status: 'pending' | 'approved' | 'rejected' }) => {
    const initials = vendor.fullName.split(' ').map(n => n[0]).join('').toUpperCase()

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{vendor.businessName || vendor.fullName}</CardTitle>
                <CardDescription>{vendor.category}</CardDescription>
              </div>
            </div>
            <Badge
              variant={
                status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'
              }
            >
              {status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
              {status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
              {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{vendor.email}</span>
            </div>
            {vendor.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{vendor.phone}</span>
              </div>
            )}
            {vendor.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{vendor.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Applied {new Date(vendor.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {vendor.description && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">{vendor.description}</p>
            </div>
          )}

          {vendor.rejectionReason && (
            <div className="pt-2 border-t">
              <Label className="text-xs text-muted-foreground">Rejection Reason:</Label>
              <p className="text-sm mt-1">{vendor.rejectionReason}</p>
            </div>
          )}

          {status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleApprove(vendor.id)}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleRejectClick(vendor)}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}

          {status === 'rejected' && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleApprove(vendor.id)}
                variant="outline"
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Re-approve
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const dummyVendors = []

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex h-screen bg-background">
        <Sidebar userRole="admin" />
        <main className="flex-1 overflow-auto">
          <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Vendor Approvals</h1>
                  <p className="text-muted-foreground">Review and manage vendor applications</p>
                </div>
              </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{vendors.pending.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{vendors.approved.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{vendors.rejected.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({vendors.pending.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({vendors.approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({vendors.rejected.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {vendors.pending.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Applications</h3>
                  <p className="text-muted-foreground text-center">
                    All vendor applications have been reviewed
                  </p>
                </CardContent>
              </Card>
            ) : (
              vendors.pending.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} status="pending" />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {vendors.approved.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Approved Vendors</h3>
                  <p className="text-muted-foreground text-center">
                    Approved vendors will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              vendors.approved.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} status="approved" />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {vendors.rejected.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <XCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Rejected Applications</h3>
                  <p className="text-muted-foreground text-center">
                    Rejected applications will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              vendors.rejected.map(vendor => (
                <VendorCard key={vendor.id} vendor={vendor} status="rejected" />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedVendor?.businessName || selectedVendor?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim()}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
