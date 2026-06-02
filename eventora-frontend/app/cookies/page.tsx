import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold text-foreground mb-2">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: June 2026</p>

          <div className="space-y-8 text-foreground">

            <section>
              <h2 className="text-xl font-semibold mb-3">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you use the site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">How Eventora Uses Cookies</h2>
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Essential Cookies</h3>
                  <p className="text-sm text-muted-foreground">Required for the Platform to function. These include authentication tokens stored in localStorage to keep you logged in. You cannot opt out of these.</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Functional Cookies</h3>
                  <p className="text-sm text-muted-foreground">Remember your preferences such as language and theme settings to improve your experience.</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-1">Analytics Cookies</h3>
                  <p className="text-sm text-muted-foreground">Help us understand how visitors interact with the Platform so we can improve it. No personally identifiable information is collected for this purpose.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Managing Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Most browsers allow you to control cookies through their settings. You can delete existing cookies, block new ones, or receive a warning before cookies are stored. Note that disabling cookies may affect the functionality of certain features on the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Eventora does not currently use third-party advertising cookies. If this changes, this policy will be updated accordingly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Questions</h2>
              <p className="text-muted-foreground">
                If you have any questions about our use of cookies, please visit our{' '}
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
