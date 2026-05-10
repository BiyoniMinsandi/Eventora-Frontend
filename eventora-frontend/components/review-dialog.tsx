'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Star, CheckCircle } from 'lucide-react'
import { createReview } from '@/lib/data'

interface ReviewDialogProps {
  bookingId: string
  vendorId: string
  vendorName: string
  customerId: string
  customerName: string
  onReviewSubmitted?: () => void
}

export function ReviewDialog({
  bookingId,
  vendorId,
  vendorName,
  customerId,
  customerName,
  onReviewSubmitted,
}: ReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setLoading(true)

    setTimeout(() => {
      createReview({
        bookingId,
        customerId,
        customerName,
        vendorId,
        rating,
        comment,
      })

      setSuccess(true)
      setLoading(false)

      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setRating(0)
        setComment('')
        onReviewSubmitted?.()
      }, 2000)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Star className="w-4 h-4" />
          Write Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {vendorName}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Review Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for sharing your feedback.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    disabled={loading}
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 5 && 'Excellent!'}
                  {rating === 4 && 'Very Good'}
                  {rating === 3 && 'Good'}
                  {rating === 2 && 'Fair'}
                  {rating === 1 && 'Poor'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Your Review (Optional)
              </label>
              <Textarea
                id="comment"
                placeholder="Tell others about your experience..."
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || rating === 0} className="flex-1">
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
