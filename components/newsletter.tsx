'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'
const CLIENT = 'hubsandbabydoll'
const OPTIN_FN = `${SUPA_URL}/functions/v1/hb-optin`

// A2P-required disclosure — exact wording stored in DB for carrier audit trail
const SMS_DISCLOSURE =
  'By providing your phone number and checking this box, you agree to receive recurring ' +
  'automated marketing text messages from Hubs & Babydoll at the number provided. ' +
  'Msg & data rates may apply. Consent is not a condition of purchase. ' +
  'Text STOP to cancel, HELP for help. Message frequency varies.'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const phoneReady = phone.replace(/\D/g, '').length >= 10

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState('error')
      return
    }
    setState('loading')
    try {
      // Record lead in TB Command (existing CRM flow)
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
          phone: phone.trim() || null,
          service: 'Newsletter signup',
          message: 'Joined the list from the website',
        }),
      })
      if (!res.ok) throw new Error()

      // Record marketing consent — fire-and-forget, never blocks the user
      fetch(OPTIN_FN, {
        method: 'POST',
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim() || null,
          email_opt_in: true,
          sms_opt_in: smsOptIn && phoneReady,
          sms_consent_disclosure: smsOptIn && phoneReady ? SMS_DISCLOSURE : null,
          source: 'newsletter_form',
        }),
      }).catch(() => {})

      setState('done')
      setEmail('')
      setPhone('')
      setSmsOptIn(false)
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
          <form onSubmit={submit} className="flex flex-col gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (state === 'error') setState('idle')
              }}
              placeholder="Your email"
              required
              aria-label="Your email address"
              className="bg-input border border-border rounded-none px-4 h-12 text-foreground focus:outline-none focus:border-primary"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (!e.target.value.replace(/\D/g, '').length || !phoneReady) setSmsOptIn(false)
              }}
              placeholder="Phone (optional — for text alerts)"
              aria-label="Phone number (optional)"
              className="bg-input border border-border rounded-none px-4 h-12 text-foreground focus:outline-none focus:border-primary"
            />

            {/* SMS opt-in — only shown once a valid phone is entered */}
            {phoneReady && (
              <label className="flex items-start gap-3 text-left cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[var(--color-primary)] shrink-0"
                  aria-label="Opt in to SMS marketing"
                />
                <span className="text-[11px] text-muted-foreground leading-relaxed text-pretty">
                  Yes, text me drop alerts &amp; restocks from Hubs &amp; Babydoll. By checking this
                  box I agree to receive recurring automated marketing texts at the number above.
                  Msg &amp; data rates may apply. Consent is not a condition of purchase. Text{' '}
                  <strong>STOP</strong> to cancel, <strong>HELP</strong> for help. Message frequency
                  varies.
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={state === 'loading'}
              className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 px-7 disabled:opacity-60 transition-colors"
            >
              {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Join the list'}
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
