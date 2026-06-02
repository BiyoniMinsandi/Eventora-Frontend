import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: June 2026</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">

            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Eventora (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the Platform. These terms apply to all visitors, users, and vendors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Eventora is an online marketplace connecting customers with event service vendors in Sri Lanka. We facilitate bookings for photography, catering, decoration, venue hire, music, and related services. Eventora acts as an intermediary and is not a party to any agreement between customers and vendors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You must be at least 18 years old to create an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must provide accurate, current, and complete information during registration.</li>
                <li>You may not create more than one account per person or entity.</li>
                <li>Eventora reserves the right to suspend or terminate accounts that violate these terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Vendor Obligations</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Vendors must submit accurate business information and obtain all required licences.</li>
                <li>Vendor accounts require admin approval before becoming publicly visible.</li>
                <li>Vendors must respond to booking requests within a reasonable time.</li>
                <li>Vendors are solely responsible for the services they provide and any disputes arising from them.</li>
                <li>Misrepresentation of services may result in immediate account suspension.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Bookings and Cancellations</h2>
              <p className="text-muted-foreground leading-relaxed">
                Bookings are confirmed only when a vendor explicitly accepts a request. Customers may cancel accepted bookings more than 2 days before the event date. Cancellations within 2 days of the event are not permitted through the Platform and must be negotiated directly with the vendor. Refund policies are set by individual vendors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Reviews and Ratings</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reviews may only be submitted for completed bookings. Reviews must be honest, accurate, and based on your personal experience. Eventora reserves the right to remove reviews that are false, abusive, or otherwise in violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Prohibited Conduct</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Posting false, misleading, or defamatory content.</li>
                <li>Circumventing the Platform to conduct off-platform transactions to avoid fees.</li>
                <li>Harassing, threatening, or abusing other users.</li>
                <li>Uploading viruses, malware, or other harmful code.</li>
                <li>Scraping, crawling, or copying Platform content without permission.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Eventora provides the Platform on an &ldquo;as is&rdquo; basis. We are not liable for the quality, safety, or legality of vendor services; the accuracy of vendor listings; or any disputes between customers and vendors. Our maximum liability in any circumstance is limited to the amount paid for the relevant booking through the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Eventora reserves the right to modify these terms at any time. Continued use of the Platform after changes are posted constitutes your acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by the laws of Sri Lanka. Any disputes shall be resolved in the courts of Sri Lanka.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions about these terms should be directed to our{' '}
                <Link href="/contact" className="text-primary hover:underline">contact page</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
