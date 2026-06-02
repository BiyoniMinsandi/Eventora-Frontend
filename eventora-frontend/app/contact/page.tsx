'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react'

// ── Replace these with real details once provided ──────────────────────────
const CONTACT_EMAIL = 'support@eventora.lk'
const CONTACT_PHONE = '+94 77 000 0000'
const CONTACT_ADDRESS = 'Colombo, Sri Lanka'
const BUSINESS_HOURS = 'Monday – Friday, 9 AM – 6 PM (Sri Lanka Time)'
// ───────────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Opens the user's mail client with pre-filled fields as a simple contact mechanism.
    const mailto =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(`[Eventora Contact] ${form.subject}`)}` +
      `&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`
    window.location.href = mailto
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 500)
  }

  const contactDetails = [
    { icon: Mail, label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { icon: Phone, label: 'Phone', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, '')}` },
    { icon: MapPin, label: 'Location', value: CONTACT_ADDRESS, href: null },
    { icon: Clock, label: 'Business Hours', value: BUSINESS_HOURS, href: null },
  ]

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-muted/30 py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-3">Contact Us</h1>
            <p className="text-muted-foreground text-lg">
              Have a question or need help? We&apos;re happy to hear from you.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">

              {/* Contact details */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">Get in Touch</h2>
                <div className="space-y-5 mb-10">
                  {contactDetails.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                        {href ? (
                          <a href={href} className="font-medium text-foreground hover:text-primary transition">
                            {value}
                          </a>
                        ) : (
                          <p className="font-medium text-foreground">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 rounded-lg p-5">
                  <h3 className="font-semibold text-foreground mb-2">For Vendor Support</h3>
                  <p className="text-sm text-muted-foreground">
                    If you are a vendor with questions about account approval, listings, or payouts, please email us with your registered business name so we can assist you faster.
                  </p>
                </div>
              </div>

              {/* Contact form */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">Send a Message</h2>
                {submitted ? (
                  <Card className="p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground text-sm">
                      Your email client should have opened with the message pre-filled. We&apos;ll get back to you within 1–2 business days.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                      Send Another
                    </Button>
                  </Card>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="name">Full Name *</label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">Email Address *</label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="subject">Subject *</label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="message">Message *</label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your question or issue..."
                        rows={6}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Opening mail client…' : 'Send Message'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Clicking Send will open your default email app with the message pre-filled.
                    </p>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
