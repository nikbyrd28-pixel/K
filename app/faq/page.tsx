'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { WaitlistSection } from '@/components/waitlist-section'

const FAQS = [
  {
    question: 'Are your products safe for highly sensitive skin?',
    answer:
      'Absolutely. We build our products around premium, real oils and natural plant butters like shea and mango. We avoid harsh synthetic chemicals, fillers, and parabens that typically cause flare-ups or irritation.',
  },
  {
    question: 'How long does the hydration last?',
    answer:
      'Our body butters and oils are formulated for all-day hydration — most customers notice lasting moisture 8–12 hours after application.',
  },
  {
    question: 'Is this line unisex?',
    answer:
      'Absolutely. Our scents and formulas are designed to be enjoyed by everyone. Many of our customers buy for their husbands, partners, and fathers too.',
  },
  {
    question: 'How are orders shipped?',
    answer:
      "We are currently selling in person at local vending events. Follow us on Instagram to find out where we'll be next, or join our email list to be notified when we launch online ordering.",
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
