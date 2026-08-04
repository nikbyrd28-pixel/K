'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

// Signups drop straight into TB Command (client_leads) as subscribers, so the
// owner's list grows in the same place she sees her orders. Insert-only anon key.
const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'
const CLIENT = 'hubsandbabydoll'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState('error')
      return
    }
    setState('loading')
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/client_leads`, {
        method: 'POST',
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          client: CLIENT,
          kind: 'subscriber',
          email: email.trim(),
          service: 'Newsletter signup',
          message: 'Joined the list from the website',
        }),
      })
      if (!res.ok) throw new Error()
      setState('done')
      setEmail('')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-primary">Stay in Touch</span>
        <h2 className="font-serif text-3xl lg:text-4xl mt-4 mb-4 text-balance">
          Be first for new scents &amp; restocks.
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
          Join the list for early access to small-batch drops, gift-ready sets, and the occasional
          treat — no spam, just care.
        </p>

        {state === 'done' ? (
          <p className="inline-flex items-center gap-2 text-primary font-medium">
            <Check className="w-5 h-5" /> You&apos;re on the list — thank you!
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (state === 'error') setState('idle')
              }}
              placeholder="Your email"
              aria-label="Your email address"
              className="flex-1 bg-input border border-border rounded-none px-4 h-12 text-foreground focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 px-7 disabled:opacity-60 transition-colors"
            >
              {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Join'}
            </button>
          </form>
        )}
        {state === 'error' && (
          <p className="text-sm text-destructive mt-3">Please enter a valid email and try again.</p>
        )}
      </div>
    </section>
  )
}
