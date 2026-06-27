'use client'

import { useEffect, useState } from 'react'
import { Check, Gift, Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'hb_waitlist_popup_seen'

export function WaitlistPopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setOpen(true), 12000)
    return () => clearTimeout(timer)
  }, [])

  const close = () => {
    setOpen(false)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore storage errors
    }
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-popup-title"
    >
      {/* Backdrop — click to close */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      <div className="relative w-full max-w-[32rem] overflow-hidden rounded-t-[2rem] border border-primary/25 bg-[radial-gradient(circle_at_top_left,rgba(201,162,75,0.22),transparent_36%),linear-gradient(145deg,#211d1b,#0f0e0f_72%)] shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:rounded-[2rem]">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-background/35 text-muted-foreground backdrop-blur hover:border-primary/50 hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative px-6 py-8 text-center sm:px-10 sm:py-11">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-[0_0_35px_rgba(201,162,75,0.18)]">
            <Gift className="h-7 w-7" />
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Private Care List
          </div>
          <h2
            id="waitlist-popup-title"
            className="font-serif text-4xl leading-[0.98] text-balance sm:text-5xl"
          >
            Get first access to the next care drop.
          </h2>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
            Restocks move fast. Join for early product drops, local vending dates, and self-care notes that feel personal — not spammy.
          </p>

          <div className="my-7 grid grid-cols-3 gap-2 text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {['Early restocks', 'Gift drops', 'Ritual notes'].map((item) => (
              <div key={item} className="rounded-2xl border border-primary/10 bg-background/25 px-3 py-3">
                <Check className="mb-2 h-3.5 w-3.5 text-primary" />
                {item}
              </div>
            ))}
          </div>

          {status === 'success' ? (
            <div className="rounded-3xl border border-primary/25 bg-primary/10 px-5 py-6" role="status">
              <Check className="mx-auto mb-3 h-7 w-7 text-primary" />
              <p className="font-serif text-2xl text-primary">You&apos;re in.</p>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label htmlFor="waitlist-popup-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="waitlist-popup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  disabled={status === 'loading'}
                  className="h-14 rounded-full border border-primary/20 bg-background/65 px-5 text-center text-foreground placeholder:text-muted-foreground shadow-inner outline-none transition-colors focus:border-primary disabled:opacity-60"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === 'loading'}
                  className="h-14 rounded-full bg-primary text-primary-foreground shadow-[0_16px_40px_rgba(201,162,75,0.22)] hover:bg-primary/90 text-xs uppercase tracking-[0.22em] disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Join Free'
                  )}
                </Button>
              </form>
              {status === 'error' && (
                <p className="text-sm text-destructive mt-4" role="alert">
                  {message}
                </p>
              )}
              <button
                type="button"
                onClick={close}
                className="mt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
              >
                No thanks, I&apos;ll risk missing it
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
