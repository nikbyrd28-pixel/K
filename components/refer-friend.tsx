'use client'

import { useState } from 'react'
import { Loader2, Check, Copy, Gift } from 'lucide-react'

const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'

export function ReferFriend({ defaultEmail = '' }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setState('error')
    setState('loading')
    try {
      const res = await fetch(`${SUPA_URL}/functions/v1/hb-discount`, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refer', email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.code) throw new Error()
      setCode(data.code)
      setState('done')
    } catch {
      setState('error')
    }
  }

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="mx-auto max-w-sm border border-primary/30 bg-card rounded-sm p-6 text-left mt-8">
      <div className="flex items-center gap-2 text-primary mb-2">
        <Gift className="w-4 h-4" />
        <span className="text-xs uppercase tracking-[0.2em]">Give 10%, get a treat</span>
      </div>
      {state === 'done' ? (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Share this code — your friend gets 10% off their first order, and you&apos;ll get a
            thank-you treat on your next one.
          </p>
          <button
            onClick={copy}
            className="w-full flex items-center justify-between border border-primary/40 px-4 h-12 hover:bg-primary/10 transition-colors"
          >
            <span className="font-serif text-xl tracking-wider text-primary">{code}</span>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              {copied ? <><Check className="w-4 h-4 text-primary" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
            </span>
          </button>
        </div>
      ) : (
        <form onSubmit={generate}>
          <p className="text-sm text-muted-foreground mb-3">
            Love it? Share it. Get your personal code and give friends 10% off.
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
              {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get code'}
            </button>
          </div>
          {state === 'error' && <p className="text-xs text-destructive mt-2">Please enter a valid email.</p>}
        </form>
      )}
    </div>
  )
}
