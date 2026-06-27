'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
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
    <section id="waitlist" className="py-20 lg:py-28 bg-secondary border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="h-px w-8 bg-primary/50" />
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Coming Online Soon</span>
          <span className="h-px w-8 bg-primary/50" />
        </div>
        <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-balance">
          Be First to Know When We Launch Online.
        </h2>
        <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-10 text-pretty">
          Join our list and get early access to new products and exclusive offers.
        </p>

        {status === 'success' ? (
          <p className="font-serif text-xl text-primary" role="status">
            {message}
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
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
                className="flex-1 h-12 px-4 bg-background border border-border text-foreground placeholder:text-muted-foreground rounded-none focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
              />
              <Button
                type="submit"
                size="lg"
                disabled={status === 'loading'}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 h-12 text-xs uppercase tracking-[0.2em] disabled:opacity-60"
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Notify Me'}
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
    </section>
  )
}
