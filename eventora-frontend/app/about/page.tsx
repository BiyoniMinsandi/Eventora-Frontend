'use client'

/**
 * Route: /about
 * Purpose: Explain what Eventora is and the platform values.
 */

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Users, Zap, Shield, Award, Globe } from 'lucide-react'

export default function AboutPage() {
  // Content is modeled as arrays to keep the JSX clean.
  const teamMembers = [
    {
      name: 'Priya Kandasamy',
      role: 'Founder & CEO',
      bio: 'Event industry veteran with 12+ years of experience',
    },
    {
      name: 'Rajesh Perera',
      role: 'Head of Operations',
      bio: 'Operations expert focused on vendor relations',
    },
    {
      name: 'Anushka Silva',
      role: 'Head of Technology',
      bio: 'Tech innovator building scalable platforms',
    },
    {
      name: 'Kamil Rizwan',
      role: 'Head of Customer Success',
      bio: 'Dedicated to exceptional customer experiences',
    },
  ]

  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in empowering both customers and vendors through a trusted platform.',
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Security and transparency are at the core of everything we do.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We continuously innovate to make event planning simpler and smarter.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest standards in service quality and vendor curation.',
    },
  ]

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-transparent py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                About Eventora
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We're on a mission to revolutionize how people find and book trusted event vendors in Sri Lanka.
              </p>
              <p className="text-lg text-muted-foreground">
                Making celebrations more beautiful, one booking at a time.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Eventora was founded in 2023 with a simple vision: to make event planning stress-free and accessible to everyone. Our founders spent years frustrated with scattered vendor information and unreliable recommendations.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  We realized there had to be a better way. A single platform where customers could discover vetted vendors, compare services, and book with confidence. And where talented vendors could showcase their work to the right audience.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, Eventora connects thousands of customers with hundreds of trusted vendors across Sri Lanka. We're just getting started.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">5000+</div>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-accent mb-2">800+</div>
                  <p className="text-sm text-muted-foreground">Verified Vendors</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">15K+</div>
                  <p className="text-sm text-muted-foreground">Successful Bookings</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">98%</div>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground">
                These principles guide everything we do at Eventora.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value) => {
                const Icon = value.icon
                return (
                  <Card key={value.title} className="p-6">
                    <Icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
              <p className="text-lg text-muted-foreground">
                Passionate people dedicated to making events amazing.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.name} className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{member.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm text-accent font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Eventora</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">Vetted Vendors</h3>
                  <p className="text-muted-foreground">Every vendor is carefully screened and verified for quality and reliability.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">Best Prices</h3>
                  <p className="text-muted-foreground">Compare prices across vendors and get the best value for your event.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">24/7 Support</h3>
                  <p className="text-muted-foreground">Our support team is always available to help you with any questions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">Secure Payments</h3>
                  <p className="text-muted-foreground">Safe and secure payment processing with buyer protection.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">Easy Booking</h3>
                  <p className="text-muted-foreground">Book vendors in just a few clicks with our intuitive platform.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">Customer Reviews</h3>
                  <p className="text-muted-foreground">Real reviews from real customers help you make informed decisions.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Ready to Plan Your Event?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Browse thousands of vetted vendors and book with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/vendors">Browse Vendors</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="bg-transparent">
                <Link href="/register">Become a Vendor</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
