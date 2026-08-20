'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Check, Copy, Megaphone, DollarSign, Share2 } from 'lucide-react'

const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'
const CLIENT = 'hubsandbabydoll'

/** Commission the affiliate earns on every order placed with their code. */
const COMMISSION_PERCENT = 15
/** Discount the affiliate's audience gets — this is what makes the code worth sharing. */
const AUDIENCE_DISCOUNT = 10

export default function AffiliatesPage() {
  const [form, setForm] = useState({ name: '', email: '', social: '', audience: '' })
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const apply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name.trim().length < 2) {
      setErrMsg('Please enter your name.')
      return setState('error')
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setErrMsg('Please enter a valid email.')
      return setState('error')
    }
    setState('loading')
    setErrMsg('')

    try {
      // Issue the rep's code and register them in one call. The code comes from
      // the same discount engine checkout validates against, so it works the
      // moment it's issued, and it carries no use cap the way a customer
      // referral code does.
      const res = await fetch(`${SUPA_URL}/functions/v1/hb-discount`, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'affiliate_apply',
          email: form.email.trim(),
          name: form.name.trim(),
          social: form.social.trim(),
          audience: form.audience.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.code) throw new Error('no code')
      setCode(data.code)

      // Send the application through to the owner's dashboard as a lead so she
      // can vet the partner and reach out. Fire-and-forget: a failure here must
      // never cost the applicant their code.
      fetch(`${SUPA_URL}/rest/v1/client_leads`, {
        method: 'POST',
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          client: CLIENT,
          kind: 'affiliate',
          name: form.name.trim(),
          email: form.email.trim(),
          service: `Affiliate · code ${data.code}`,
          message:
            `NEW AFFILIATE — hubsandbabydoll.com\n\n` +
            `Name: ${form.name.trim()}\n` +
            `Email: ${form.email.trim()}\n` +
            (form.social ? `Social: ${form.social.trim()}\n` : '') +
            (form.audience ? `Audience: ${form.audience.trim()}\n` : '') +
            `Code issued: ${data.code}\n` +
            `Commission: ${COMMISSION_PERCENT}% per order`,
        }),
      }).catch(() => {})

      setState('done')
    } catch {
      setErrMsg('Something went wrong — please try again, or email hubsbabydoll@gmail.com.')
      setState('error')
    }
  }

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  if (state === 'done') {
    return (
      <section className="bg-background max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 border border-primary flex items-center justify-center mb-8">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl mb-5 text-balance">You&apos;re in</h1>
        <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
          Welcome{form.name ? `, ${form.name.split(' ')[0]}` : ''}. This is your code. Every order placed
          with it gives your people {AUDIENCE_DISCOUNT}% off and earns you {COMMISSION_PERCENT}%.
        </p>

        <button
          onClick={copy}
          className="mx-auto w-full max-w-sm flex items-center justify-between border border-primary/40 px-5 h-14 hover:bg-primary/10 transition-colors"
        >
          <span className="font-serif text-2xl tracking-wider text-primary">{code}</span>
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {copied ? (
              <>
                <Check className="w-4 h-4 text-primary" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy
              </>
            )}
          </span>
        </button>

        <div className="mt-10 text-left mx-auto max-w-sm border border-border bg-card rounded-sm p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">What happens next</p>
          <ul className="text-sm text-muted-foreground leading-relaxed flex flex-col gap-2">
            <li>Share your code anywhere you talk to your people.</li>
            <li>We track every order placed with it — no links to manage.</li>
            <li>We reach out monthly to settle up what you&apos;ve earned.</li>
          </ul>
        </div>

        <div className="mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-9 h-12 text-xs uppercase tracking-[0.2em] font-medium transition-colors"
          >
            Shop the collection
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="bg-background max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-28 text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="h-px w-8 bg-primary/50" />
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Affiliates</span>
          <span className="h-px w-8 bg-primary/50" />
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6 text-balance">
          Get paid to share what you already love
        </h1>
        <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto text-pretty">
          If your people trust your taste, put it to work. Share your code, give them{' '}
          {AUDIENCE_DISCOUNT}% off, and keep {COMMISSION_PERCENT}% of every order it brings in.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Terms
            icon={<Share2 className="w-5 h-5" />}
            title="Share your code"
            body="One code, yours alone. Post it, text it, say it out loud at a table. No links to chase."
          />
          <Terms
            icon={<DollarSign className="w-5 h-5" />}
            title={`Earn ${COMMISSION_PERCENT}%`}
            body="Every order placed with your code pays you, on the full order total, every time."
          />
          <Terms
            icon={<Megaphone className="w-5 h-5" />}
            title="They save too"
            body={`Your people get ${AUDIENCE_DISCOUNT}% off their order — so the code is worth using, not just worth posting.`}
          />
        </div>
      </section>

      <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-32">
        <form onSubmit={apply} className="border border-primary/30 bg-card rounded-sm p-6 flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Get your code</p>

          <AffField label="Your name" value={form.name} onChange={set('name')} autoComplete="name" />
          <AffField label="Email" value={form.email} onChange={set('email')} type="email" autoComplete="email" />
          <AffField label="Instagram or TikTok" value={form.social} onChange={set('social')} optional />
          <AffField label="Who follows you" value={form.audience} onChange={set('audience')} optional />

          <button
            type="submit"
            disabled={state === 'loading'}
            className="mt-2 inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 text-xs uppercase tracking-[0.2em] font-medium disabled:opacity-60 transition-colors"
          >
            {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get my code'}
          </button>

          {state === 'error' && <p className="text-xs text-destructive">{errMsg}</p>}

          <p className="text-xs text-muted-foreground leading-relaxed">
            We&apos;ll email you when your first order comes through. Commission is settled monthly.
          </p>
        </form>
      </section>
    </>
  )
}

function Terms({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border border-border bg-card rounded-sm p-6 text-left">
      <div className="text-primary mb-3">{icon}</div>
      <h2 className="font-serif text-xl mb-2 text-balance">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{body}</p>
    </div>
  )
}

function AffField({
  label, value, onChange, type = 'text', autoComplete, optional,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  autoComplete?: string
  optional?: boolean
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label}
        {optional && <span className="text-muted-foreground/60"> · optional</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="bg-input border border-border rounded-none px-3 h-11 text-sm text-foreground focus:outline-none focus:border-primary"
      />
    </label>
  )
}
