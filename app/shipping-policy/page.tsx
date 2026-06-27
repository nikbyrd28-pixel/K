import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description:
    'How Hubs & Babydoll handcrafts, processes, and ships your body care and wellness essentials.',
}

const sections = [
  {
    heading: 'Processing Time',
    body: [
      'Every order is handcrafted in small batches with care. Please allow 3–5 business days for your order to be made and prepared for shipment.',
      'During launches, holidays, and local vending events, processing may take a little longer. If there is a significant delay, we will reach out to you directly.',
    ],
  },
  {
    heading: 'Shipping Rates & Delivery',
    body: [
      'Shipping is calculated at checkout based on your location and the weight of your order. Once your order ships, domestic delivery typically takes 3–7 business days.',
      'You will receive a confirmation email with tracking information as soon as your order is on its way.',
    ],
  },
  {
    heading: 'Local Pickup & Events',
    body: [
      'If you are local, you may be able to pick up your order or meet us at an upcoming vending event. Select the pickup option at checkout when available, and we will coordinate the details with you.',
    ],
  },
  {
    heading: 'Lost or Delayed Packages',
    body: [
      'Once an order leaves our hands, it is in the care of the carrier. We are not responsible for carrier delays, but we will always help you track down a package and make things right wherever we can.',
      'If your tracking shows delivered but you cannot find your package, please contact your carrier first, then reach out to us so we can assist.',
    ],
  },
  {
    heading: 'Questions',
    body: [
      'We are a small, home-based brand and we read every message. If you have any questions about your shipment, please reach out and we will respond as soon as we can.',
    ],
  },
]

export default function ShippingPolicyPage() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 lg:mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Policies</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mt-6 text-balance">
            Shipping Policy
          </h1>
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
