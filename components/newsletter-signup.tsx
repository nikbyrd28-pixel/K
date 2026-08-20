'use client'

import { useState } from 'react'
import { Loader2, Check, Bell } from 'lucide-react'

const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'

export function NewsletterSignup({ defaultEmail = '' }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setState('error')
    setState('loading')
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/newsletter_subscribers`, {
        method: 'POST',
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error()
      setState('done')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="mx-auto max-w-sm border border-primary/30 bg-card rounded-sm p-6 text-left mt-8">
      <div className="flex items-center gap-2 text-primary mb-2">
        <Bell className="w-4 h-4" />
        <span className="text-xs uppercase tracking-[0.2em]">Stay Updated</span>
      </div>
      {state === 'done' ? (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              You&apos;re subscribed! We&apos;ll send exclusive offers and new product alerts.
            </span>
          </p>
        </div>
      ) : (
        <form onSubmit={subscribe}>
          <p className="text-sm text-muted-foreground mb-3">
            Get exclusive offers, new product alerts, and restocks straight to your inbox.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (state === 'error') setState('idle')
              }}
              placeholder="Your email"
              className="flex-1 bg-input border border-border rounded-none px-3 h-11 text-sm text-foreground focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.15em] px-4 h-11 disabled:opacity-60"
            >
              {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
            </button>
          </div>
          {state === 'error' && <p className="text-xs text-destructive mt-2">Please enter a valid email.</p>}
        </form>
      )}
    </div>
  )
}
