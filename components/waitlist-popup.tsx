'use client'

import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-popup-title"
    >
      {/* Backdrop — click to close */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-foreground/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md bg-secondary border border-border shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 sm:px-10 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary">
              Care List
            </span>
            <span className="h-px w-8 bg-primary/50" />
          </div>
          <h2
            id="waitlist-popup-title"
            className="font-serif text-3xl lg:text-4xl mb-4 text-balance leading-tight"
          >
            Get Restock &amp; Ritual Notes.
          </h2>
          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mb-8 text-pretty">
            Join the care list for restocks, product drops, local vending dates, and simple self-care notes from Hubs &amp; Babydoll.
          </p>

          {status === 'success' ? (
            <p className="font-serif text-lg text-primary" role="status">
              {message}
            </p>
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
                  className="h-12 px-4 bg-background border border-border text-foreground placeholder:text-muted-foreground rounded-none focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === 'loading'}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 text-xs uppercase tracking-[0.2em] disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Join the Care List'
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
                No thanks
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
