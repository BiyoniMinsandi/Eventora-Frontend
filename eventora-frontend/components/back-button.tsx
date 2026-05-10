'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'

export function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button variant="outline" size="sm" className="gap-2" onClick={handleBack}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
    </div>
  )
}
