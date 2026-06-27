import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Hubs & Babydoll refund, return, and exchange policy for our handcrafted body care and wellness essentials.',
}

const sections = [
  {
    heading: 'Our Commitment',
    body: [
      'Your satisfaction means everything to us. Because our products are handcrafted body care items used directly on the skin, we are unable to accept returns of opened or used products for health and safety reasons.',
    ],
  },
  {
    heading: 'Damaged or Incorrect Orders',
    body: [
      'If your order arrives damaged, defective, or incorrect, please contact us within 7 days of delivery with your order number and a photo of the issue.',
      'We will gladly replace the item or issue a refund once we have reviewed the details.',
    ],
  },
  {
    heading: 'Eligible Returns',
    body: [
      'Unopened, unused items in their original condition may be eligible for a refund or exchange within 14 days of delivery. Customers are responsible for return shipping costs unless the return is due to our error.',
      'Once we receive and inspect the returned item, we will notify you about the status of your refund.',
    ],
  },
  {
    heading: 'Refund Processing',
    body: [
      'Approved refunds are issued to your original payment method. Please allow 5–10 business days for the refund to appear, depending on your bank or card provider.',
    ],
  },
  {
    heading: 'Non-Refundable Items',
    body: [
      'Gift cards, final sale items, and used products are not eligible for refunds or exchanges.',
    ],
  },
  {
    heading: 'Questions',
    body: [
      'We are a small, home-based brand and we genuinely want you to love your routine. If something is not right, please reach out and we will do our best to make it right.',
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 lg:mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Policies</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mt-6 text-balance">
            Refund Policy
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
