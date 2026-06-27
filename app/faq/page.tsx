'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { WaitlistSection } from '@/components/waitlist-section'

const FAQS = [
  {
    question: 'What makes Hubs & Babydoll different?',
    answer:
      'Every product is made in small batches with rich plant-based oils and butters, then curated into routines that feel intentional — not generic, watered down, or rushed off a factory line.',
  },
  {
    question: 'Are your products safe for sensitive skin?',
    answer:
      'Our formulas are built around nourishing ingredients like shea butter, mango butter, jojoba oil, essential oils, and Vitamin E. If you have allergies or highly reactive skin, review the ingredients first and patch test before full use.',
  },
  {
    question: 'How long does the hydration last?',
    answer:
      'Our body butters and oils are made for lasting moisture. Most customers notice soft, hydrated skin for hours after applying, especially when used after a shower or bath.',
  },
  {
    question: 'Is this line only for women?',
    answer:
      'No. The SEEN and HEARD collections were created so everyone can feel cared for. Some scents lean soft and floral, some lean warm and grounding, and many customers buy them as gifts for partners, parents, and friends.',
  },
  {
    question: 'Do you sell gift boxes?',
    answer:
      'Yes. Our body boxes are designed as complete care moments — thoughtful gifts for birthdays, holidays, thank-yous, and the people who are always taking care of everyone else.',
  },
  {
    question: 'How should I use the body oils and butters?',
    answer:
      'Apply to clean skin, ideally while skin is slightly damp. Use body oil for a silky glow, body butter for richer moisture, or layer both for a more indulgent routine.',
  },
  {
    question: 'How do I hear about restocks and new products?',
    answer:
      'Join the email list to get updates on new products, restocks, local vending dates, and exclusive offers. Your email is saved in Shopify for customer updates and marketing opt-in.'
  },
]

export default function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  return (
    <>
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="h-px w-8 bg-primary/50" />
              <span className="text-xs uppercase tracking-[0.3em] text-primary">Questions</span>
              <span className="h-px w-8 bg-primary/50" />
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl text-balance">Good to know</h1>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {FAQS.map((faq, index) => {
              const isOpen = expandedIndex === index
              return (
                <button
                  key={index}
                  onClick={() => setExpandedIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full text-left py-6 group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-muted-foreground leading-relaxed text-pretty">{faq.answer}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <WaitlistSection />
    </>
  )
}
