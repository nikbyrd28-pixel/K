'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Check, Sparkles } from 'lucide-react'
import { CATALOG, type CatalogItem } from '@/lib/catalog'
import { useShoppingCart } from '@/components/shopping-cart-provider'

type Choice = { label: string; value: string; hint?: string }
type Question = { id: string; prompt: string; choices: Choice[] }

const QUESTIONS: Question[] = [
  {
    id: 'who',
    prompt: 'Who are we treating?',
    choices: [
      { label: 'A little me-time', value: 'me' },
      { label: 'A gift for her', value: 'her' },
      { label: 'A gift for him', value: 'him' },
    ],
  },
  {
    id: 'mood',
    prompt: 'What feeling are you after?',
    choices: [
      { label: 'Calm & soothing', value: 'lavender', hint: 'Lavender & rose' },
      { label: 'Warm & cozy', value: 'chocolate', hint: 'Rich cocoa' },
      { label: 'Fresh & awake', value: 'peppermint', hint: 'Cool peppermint' },
      { label: 'Elegant & classic', value: 'jasmine-gardenia', hint: 'Jasmine & gardenia' },
    ],
  },
  {
    id: 'type',
    prompt: 'How do you love to moisturize?',
    choices: [
      { label: 'Lightweight oil', value: 'oil' },
      { label: 'Rich, whipped butter', value: 'butter' },
      { label: 'Treat me to the full set', value: 'box' },
    ],
  },
]

function recommend(a: Record<string, string>): CatalogItem {
  const has = (h: string, ...parts: string[]) => parts.every((p) => h.includes(p))

  // For him → beard set first, then the HEARD Bay Rum box.
  if (a.who === 'him') {
    return (
      CATALOG.find((i) => i.handle.includes('beard-set')) ||
      CATALOG.find((i) => i.handle.includes('heard')) ||
      CATALOG[0]
    )
  }

  let scent = a.mood || 'jasmine-gardenia'
  // The full-set path leans on the gift boxes we actually stock.
  if (a.type === 'box') {
    return (
      CATALOG.find((i) => has(i.handle, scent, 'box')) ||
      CATALOG.find((i) => i.handle.includes('box')) ||
      CATALOG.find((i) => i.handle.includes('signature')) ||
      CATALOG[0]
    )
  }

  const type = a.type === 'oil' ? 'oil' : 'butter'
  return (
    CATALOG.find((i) => has(i.handle, scent, type)) ||
    CATALOG.find((i) => i.handle.includes(scent)) ||
    CATALOG.find((i) => i.handle.includes(type)) ||
    CATALOG[0]
  )
}

export default function QuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  const { addToCart, openCart } = useShoppingCart()

  const pick = (qid: string, value: string) => {
    const next = { ...answers, [qid]: value }
    setAnswers(next)
    if (step < QUESTIONS.length - 1) setStep(step + 1)
    else setDone(true)
  }

  const back = () => {
    if (done) return setDone(false)
    if (step > 0) setStep(step - 1)
  }

  const result = useMemo(() => (done ? recommend(answers) : null), [done, answers])

  if (done && result) {
    const size = result.sizes[0]
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        <div className="flex items-center justify-center gap-2 text-primary mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs uppercase tracking-[0.3em]">Your match</span>
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl mb-8 text-balance">We found your scent.</h1>

        <div className="border border-border rounded-sm bg-card overflow-hidden">
          <div className="relative aspect-[4/3] bg-muted">
            {result.image && (
              <Image src={result.image} alt={result.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 640px" />
            )}
          </div>
          <div className="p-6 lg:p-8">
            <h2 className="font-serif text-2xl lg:text-3xl">{result.name}</h2>
            <p className="text-muted-foreground leading-relaxed mt-3 text-pretty">{result.description}</p>
            <p className="font-serif text-2xl text-primary mt-4">${size.price.toFixed(2)}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
              <button
                onClick={() => {
                  addToCart({
                    id: `hb-${result.handle}-${size.size}`,
                    variantId: `hb-${result.handle}-v`,
                    title: `${result.name} — ${size.size}`,
                    price: size.price,
                    quantity: 1,
                    image: result.image,
                  })
                  openCart()
                }}
                className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 px-8 transition-colors"
              >
                Add to cart
              </button>
              <Link
                href={`/shop/${result.handle}`}
                className="rounded-none border border-primary/40 text-foreground hover:bg-primary/10 text-xs uppercase tracking-[0.2em] h-12 px-8 inline-flex items-center justify-center transition-colors"
              >
                See details
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <button onClick={() => { setDone(false); setStep(0); setAnswers({}) }} className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary">
            Retake quiz
          </button>
          <Link href="/shop" className="text-xs uppercase tracking-[0.2em] text-primary border-b border-primary/40 pb-1 hover:border-primary">
            Browse everything
          </Link>
        </div>
      </section>
    )
  }

  const q = QUESTIONS[step]
  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-primary">Find Your Scent</span>
        <h1 className="font-serif text-3xl lg:text-5xl mt-4 text-balance">{q.prompt}</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {QUESTIONS.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/60' : 'w-2 bg-border'}`} />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {q.choices.map((c) => {
          const selected = answers[q.id] === c.value
          return (
            <button
              key={c.value}
              onClick={() => pick(q.id, c.value)}
              className={`group flex items-center justify-between text-left border px-6 h-16 transition-all ${
                selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <span>
                <span className="font-serif text-xl">{c.label}</span>
                {c.hint && <span className="block text-xs text-muted-foreground uppercase tracking-[0.14em] mt-0.5">{c.hint}</span>}
              </span>
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border group-hover:border-primary'}`}>
                {selected && <Check className="w-3.5 h-3.5" />}
              </span>
            </button>
          )
        })}
      </div>

      {step > 0 && (
        <button onClick={back} className="mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
    </section>
  )
}
