import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is Eventora?',
        a: 'Eventora is an online marketplace connecting customers with verified event service vendors across Sri Lanka. You can find photographers, caterers, decorators, venues, musicians, and more all in one place.',
      },
      {
        q: 'Is it free to use Eventora as a customer?',
        a: 'Yes, browsing vendors and sending booking requests is completely free for customers.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Register" in the top navigation, choose "Customer" as your role, and fill in your details. You can log in immediately after registering.',
      },
    ],
  },
  {
    category: 'Bookings',
    items: [
      {
        q: 'How does booking a vendor work?',
        a: 'Browse vendors, open a vendor\'s profile, and click "Book Now". Fill in your event details and submit the request. The vendor will review and respond. Once accepted, you can message the vendor directly.',
      },
      {
        q: 'Can I cancel a booking?',
        a: 'Yes, customers can cancel accepted bookings more than 2 days before the event date. Cancellations within 2 days of the event must be negotiated directly with the vendor.',
      },
      {
        q: 'What happens if a vendor rejects my request?',
        a: 'You will receive a notification with the vendor\'s reason. You are free to send a request to another vendor.',
      },
      {
        q: 'Can I message a vendor before booking?',
        a: 'Messaging is available after a vendor accepts your booking request. This keeps conversations organised and linked to specific events.',
      },
    ],
  },
  {
    category: 'Vendors',
    items: [
      {
        q: 'How do I register as a vendor?',
        a: 'Click "Register" and select "Vendor". Complete your business profile. Your account will be reviewed by our admin team, usually within 1–2 business days.',
      },
      {
        q: 'Why is my vendor account pending?',
        a: 'All vendor accounts go through a verification process to ensure quality and safety. You will receive a notification once your account is approved or if more information is needed.',
      },
      {
        q: 'Can I set my availability?',
        a: 'Yes. In your vendor dashboard, go to "Availability" to set the dates and time slots you are available. Customers will only be able to book on your available dates.',
      },
    ],
  },
  {
    category: 'Reviews & Disputes',
    items: [
      {
        q: 'When can I leave a review?',
        a: 'Reviews can be submitted after a booking is marked as completed by the vendor.',
      },
      {
        q: 'What if I have a problem with a vendor?',
        a: 'You can raise a dispute through your bookings page. Our team will review the case and work towards a fair resolution.',
      },
      {
        q: 'Can a vendor see my personal information?',
        a: 'Vendors can see your name and the details of your booking request. Your email is visible on your profile but is only accessible to users you have an active booking with.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-10">
            Can&apos;t find an answer? Visit our{' '}
            <Link href="/contact" className="text-primary hover:underline">contact page</Link>.
          </p>

          <div className="space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">{section.category}</h2>
                <div className="space-y-6">
                  {section.items.map((item) => (
                    <div key={item.q}>
                      <h3 className="font-medium text-foreground mb-2">{item.q}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
