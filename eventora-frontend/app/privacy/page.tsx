import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: June 2026</p>

          <div className="space-y-8 text-foreground">

            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Eventora (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data when you use our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <h3 className="font-medium mb-2">Information you provide directly:</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-4">
                <li>Account registration details (name, email, phone number)</li>
                <li>Business information for vendor accounts</li>
                <li>Booking details and event information</li>
                <li>Messages exchanged on the Platform</li>
                <li>Reviews and ratings you submit</li>
              </ul>
              <h3 className="font-medium mb-2">Information collected automatically:</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information</li>
                <li>Cookies and similar tracking technologies (see our Cookie Policy)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To provide, maintain, and improve the Platform</li>
                <li>To process bookings and facilitate communication between customers and vendors</li>
                <li>To send transactional emails (booking confirmations, status updates)</li>
                <li>To verify vendor accounts and ensure Platform safety</li>
                <li>To resolve disputes and enforce our Terms of Service</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Sharing of Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
                <li><strong>Vendors / Customers:</strong> necessary booking details are shared between the parties involved in a booking.</li>
                <li><strong>Service providers:</strong> third-party services that help us operate the Platform (e.g. email delivery), bound by confidentiality agreements.</li>
                <li><strong>Legal authorities:</strong> when required by law or to protect our rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us. We may retain certain data to comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> request a copy of your personal data.</li>
                <li><strong>Correction:</strong> update inaccurate information through your account settings.</li>
                <li><strong>Deletion:</strong> request deletion of your account and data.</li>
                <li><strong>Objection:</strong> object to certain processing activities.</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                To exercise any of these rights, please contact us via our{' '}
                <Link href="/contact" className="text-primary hover:underline">contact page</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use industry-standard measures to protect your data, including bcrypt password hashing and JWT-based authentication. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. Continued use of the Platform after changes are posted constitutes acceptance of the revised policy.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
