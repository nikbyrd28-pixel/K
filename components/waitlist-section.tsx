'use client'

import { useState } from 'react'
import { Check, Loader2, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setStatus('success')
        setMessage(
          data.alreadySubscribed
            ? "You're already on the list — we'll be in touch soon."
            : "Thank you — you're on the list. We'll be in touch soon.",
        )
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section id="waitlist" className="relative overflow-hidden border-t border-primary/15 bg-background py-20 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,162,75,0.16),transparent_34%),linear-gradient(180deg,rgba(28,26,27,0.95),#0B0B0C)]" aria-hidden="true" />
      <div className="absolute left-1/2 top-8 h-px w-[min(42rem,80vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/60 to-transparent" aria-hidden="true" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-[2rem] border border-primary/20 bg-secondary/55 px-5 py-9 shadow-[0_26px_80px_rgba(0,0,0,0.38)] backdrop-blur sm:px-10 lg:px-16 lg:py-14">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Care List
          </div>
          <h2 className="font-serif text-4xl leading-[1.02] text-balance sm:text-5xl lg:text-6xl">
            Be first when the next ritual drops.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty">
            Join the private care list for restock alerts, gift-box drops, local vending dates, and simple self-care notes from Hubs &amp; Babydoll.
          </p>

          <div className="mx-auto my-8 grid max-w-2xl grid-cols-1 gap-3 text-left text-sm text-muted-foreground sm:grid-cols-3">
            {['Early restock alerts', 'Gift-ready drop notices', 'No spam — just care'].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-full border border-primary/10 bg-background/35 px-4 py-3">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>

        {status === 'success' ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-primary/25 bg-primary/10 px-6 py-7" role="status">
            <Check className="mx-auto mb-3 h-7 w-7 text-primary" />
            <p className="font-serif text-2xl text-primary">You&apos;re on the care list.</p>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-xl mx-auto sm:flex-row">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading'}
                className="flex-1 h-14 rounded-full border border-primary/20 bg-background/70 px-5 text-center text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary disabled:opacity-60 sm:text-left"
              />
              <Button
                type="submit"
                size="lg"
                disabled={status === 'loading'}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 h-14 text-xs uppercase tracking-[0.2em] shadow-[0_16px_40px_rgba(201,162,75,0.2)] disabled:opacity-60"
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Free'}
              </Button>
            </form>
            {status === 'error' && (
              <p className="text-sm text-destructive mt-4" role="alert">
                {message}
              </p>
            )}
          </>
        )}
        </div>
      </div>
    </section>
  )
}
