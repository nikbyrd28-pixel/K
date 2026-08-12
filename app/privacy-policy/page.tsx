import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Hubs & Babydoll collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy-policy' },
}

const sections = [
  {
    heading: 'Information We Collect',
    body: [
      'When you place an order, we collect the information needed to fulfill it: your name, email address, phone number, and shipping address.',
      'When you sign up for our email list, we collect your name and email address.',
      'We do not store your payment card details. All payment processing is handled by our payment partners (Square or Stripe), who have their own privacy and security practices.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    body: [
      'We use your information to process and fulfill your orders, send you order confirmations and shipping updates, and answer any questions you contact us about.',
      'If you opted in to our email list, we may occasionally send you updates about new products, promotions, and events. You can unsubscribe at any time by replying to any email with "unsubscribe."',
      'We do not sell, rent, or share your personal information with third parties for their own marketing purposes.',
    ],
  },
  {
    heading: 'Third-Party Services',
    body: [
      'We use Supabase to securely store order and subscriber data. We use Square and Stripe to process payments. These services have their own privacy policies that govern how they handle your data.',
      'Our website uses basic analytics (page views and session data stored in our own database) to help us understand how visitors use the site. We do not use third-party tracking pixels or sell browsing data.',
    ],
  },
  {
    heading: 'Cookies',
    body: [
      'Our website uses minimal cookies and browser storage to keep your shopping cart between visits and to identify your session for analytics purposes. We do not use advertising cookies or cross-site tracking.',
    ],
  },
  {
    heading: 'Data Retention',
    body: [
      'We retain your order information as long as necessary to fulfill our legal and business obligations (such as tax records). You may contact us at any time to request that your data be deleted, and we will honor that request unless we are required by law to retain it.',
    ],
  },
  {
    heading: 'Your Rights',
    body: [
      'You have the right to access, correct, or request deletion of your personal information. To exercise any of these rights, please reach out to us at hubsbabydoll@gmail.com and we will respond promptly.',
    ],
  },
  {
    heading: 'Contact',
    body: [
      'Hubs & Babydoll is a home-based small business. If you have any questions about this policy or how your data is handled, please email us at hubsbabydoll@gmail.com.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 lg:mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Legal</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mt-6 text-balance">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mt-4">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-serif text-2xl lg:text-3xl mb-4">{section.heading}</h2>
              <div className="space-y-4">
                {section.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
