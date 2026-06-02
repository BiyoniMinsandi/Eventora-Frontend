import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, MessageCircle, Shield, HelpCircle } from 'lucide-react'

const topics = [
  {
    icon: Users,
    title: 'Account & Registration',
    description: 'Creating your account, updating your profile, and managing your settings.',
    href: '/faq#getting-started',
  },
  {
    icon: BookOpen,
    title: 'Bookings',
    description: 'How to request, accept, reject, and cancel bookings.',
    href: '/faq#bookings',
  },
  {
    icon: MessageCircle,
    title: 'Messaging',
    description: 'Communicating with vendors and customers after a booking is confirmed.',
    href: '/faq#bookings',
  },
  {
    icon: Shield,
    title: 'Disputes & Safety',
    description: 'Raising a dispute, our resolution process, and keeping your account safe.',
    href: '/faq#reviews-disputes',
  },
]

export default function HelpPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-muted/30 py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-3">Help Center</h1>
            <p className="text-muted-foreground text-lg">
              Find answers, guides, and support for everything on Eventora.
            </p>
          </div>
        </section>

        {/* Topic cards */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold mb-8">Browse by topic</h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {topics.map((topic) => {
                const Icon = topic.icon
                return (
                  <Link key={topic.title} href={topic.href}>
                    <Card className="p-6 hover:border-primary transition-colors cursor-pointer h-full">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground">{topic.description}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {/* Quick links */}
            <div className="border-t border-border pt-10 text-center">
              <h2 className="text-xl font-semibold mb-3">Still need help?</h2>
              <p className="text-muted-foreground mb-6">
                Check our detailed FAQ or reach out to our support team directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/faq">Read FAQ</Link>
                </Button>
                <Button asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
