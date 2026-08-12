import type { Metadata } from 'next'
import { Zap, Database, Mail, ShoppingCart, Smartphone, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Technology & Infrastructure',
  description: 'Learn about the technology powering Hubs & Babydoll — a modern, secure, and scalable e-commerce platform built for growth.',
  robots: {
    index: false,
  },
}

interface TechCard {
  icon: React.ReactNode
  title: string
  description: string
}

const techStack: TechCard[] = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Next.js Frontend',
    description:
      'Modern React-based web application with server-side rendering for fast performance and SEO optimization.',
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: 'Supabase Backend',
    description:
      'PostgreSQL database with real-time capabilities, secure API, and cloud storage for product images and assets.',
  },
  {
    icon: <ShoppingCart className="w-6 h-6" />,
    title: 'Square Payment Processing',
    description:
      'PCI-compliant card processing with support for both online payments and in-person transactions.',
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Resend Email Service',
    description:
      'Transactional and marketing email delivery with tracking and analytics for customer communications.',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Twilio SMS',
    description: 'SMS notifications for order confirmations, shipping updates, and customer engagement.',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Security & RLS',
    description:
      'Row-level security on database tables, encrypted environment variables, and secure API authentication.',
  },
]

const features = [
  {
    category: 'Product Management',
    items: [
      'Dynamic product catalog with built-in defaults and database overrides',
      'Multiple product images and lifestyle photography',
      'Size/variant management with pricing per size',
      'Sold-out status tracking and inventory management',
      'Featured product showcase on homepage',
    ],
  },
  {
    category: 'Sales & Commerce',
    items: [
      'Full e-commerce shopping cart and checkout flow',
      'Shipping calculation with flat-rate and free-shipping thresholds',
      'Discount coupon system with validation and application',
      'Referral code management and tracking',
      'Order management dashboard with status updates',
    ],
  },
  {
    category: 'Customer Communication',
    items: [
      'Transactional email notifications (orders, shipping updates)',
      'SMS alerts for time-sensitive order information',
      'Newsletter subscription management',
      'Abandoned cart recovery ready to implement',
      'Customer feedback and review collection',
    ],
  },
  {
    category: 'Analytics & Admin',
    items: [
      'Admin dashboard for orders, customers, and products',
      'Real-time order tracking and customer management',
      'Revenue and sales reporting',
      'Email campaign management interface',
      'Secure team member access with role-based permissions',
    ],
  },
]

export default function ITPage() {
  return (
    <>
      <section className="py-24 lg:py-36 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Technology & Infrastructure</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.12] mt-8 mb-14 text-balance">
            Built for scale, designed for you
          </h1>

          <div className="max-w-2xl mx-auto text-left">
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6 text-pretty">
              Hubs & Babydoll&rsquo;s website is built on modern, secure, and scalable infrastructure. This page outlines
              the technology stack and features you own and maintain with this platform.
            </p>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty">
              Everything below is cloud-based, requires minimal technical maintenance, and is designed to grow with your
              business — from your first order to thousands of customers.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-secondary border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Core Technology</span>
            <span className="h-px w-8 bg-primary/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech) => (
              <div key={tech.title} className="bg-background border border-border p-6 lg:p-7">
                <div className="text-primary mb-4">{tech.icon}</div>
                <h3 className="font-serif text-xl mb-2">{tech.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary">What&rsquo;s Included</span>
            <span className="h-px w-8 bg-primary/50" />
          </div>

          <div className="space-y-12">
            {features.map((section) => (
              <div key={section.category}>
                <h3 className="font-serif text-2xl lg:text-3xl mb-5">{section.category}</h3>
                <ul className="space-y-3 text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-base leading-relaxed">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-secondary border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Ownership & Support</span>
            <span className="h-px w-8 bg-primary/50" />
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl mb-6 text-balance">
            Fully yours to own and operate
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-8 text-pretty">
            When you acquire this platform, you own the entire infrastructure: the database, all customer data, order
            history, product catalog, email and SMS integrations, and the source code. You can maintain it yourself with
            our documentation, hire a developer to extend it, or bring it to a managed hosting partner. Everything is
            yours.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-10">
            <div className="text-left border-l-2 border-primary pl-4 py-2">
              <h4 className="font-serif text-lg mb-2">No Vendor Lock-in</h4>
              <p className="text-sm text-muted-foreground">
                All data and code are portable. Move to a new provider anytime without losing your business.
              </p>
            </div>
            <div className="text-left border-l-2 border-primary pl-4 py-2">
              <h4 className="font-serif text-lg mb-2">Zero Ongoing Fees</h4>
              <p className="text-sm text-muted-foreground">
                No monthly software subscriptions — you pay only for cloud services as you scale.
              </p>
            </div>
            <div className="text-left border-l-2 border-primary pl-4 py-2">
              <h4 className="font-serif text-lg mb-2">Customer Data</h4>
              <p className="text-sm text-muted-foreground">
                All customer information, order history, and email lists transfer to your accounts.
              </p>
            </div>
            <div className="text-left border-l-2 border-primary pl-4 py-2">
              <h4 className="font-serif text-lg mb-2">Lifetime Updates</h4>
              <p className="text-sm text-muted-foreground">
                The platform is built on current standards — it will run for years without major changes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
