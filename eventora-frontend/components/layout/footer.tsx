'use client'

import Link from 'next/link'

// ── Update these with real social media URLs ───────────────────────────────
const SOCIAL = {
  facebook: 'https://facebook.com/eventora',
  instagram: 'https://instagram.com/eventora',
  twitter: 'https://x.com/eventora',
}
const SUPPORT_EMAIL = 'support@eventora.lk'
// ───────────────────────────────────────────────────────────────────────────

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg text-primary mb-4">Eventora</h3>
            <p className="text-sm text-muted-foreground">
              Connect with trusted event vendors in Sri Lanka
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/vendors" className="text-muted-foreground hover:text-primary">
                  Browse Vendors
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-muted-foreground hover:text-primary">
                  Email Support
                </a>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Eventora. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary text-sm">
              Facebook
            </a>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary text-sm">
              Instagram
            </a>
            <a href={SOCIAL.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary text-sm">
              Twitter / X
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
