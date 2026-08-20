'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Check, ChevronLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShoppingCart } from '@/components/shopping-cart-provider'
import { ReferFriend } from '@/components/refer-friend'

// Orders are captured into TB Command (the shared Supabase backend) so they
// appear in the owner's dashboard. This anon key is a public, insert-only key.
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

// Payment handles — fill these in to turn on one-tap payment at checkout.
// (Leave blank and customers are told you'll send a payment request.)
const PAY = {
  cashApp: '', // your $Cashtag, without the $  e.g. 'HubsBabydoll'
  venmo: '', // your Venmo username, without the @
  paypal: '', // your PayPal.Me username
}

export default function CheckoutPage() {
  const { cart, subtotal, cartCount, clearCart } = useShoppingCart()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [paidTotal, setPaidTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', address2: '', city: '', state: '', zip: '',
    method: 'Ship to me', notes: '',
  })
  const [isGift, setIsGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(false)
  const [smsOptIn, setSmsOptIn] = useState(false)

  // Reward / referral code
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [codeLabel, setCodeLabel] = useState('')
  const [codeMsg, setCodeMsg] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const shipping = 12
  const total = Math.max(0, Math.round((subtotal - discount + shipping) * 100) / 100)
  const appliedCode = discount > 0 ? code.toUpperCase() : ''
  // Payment amounts are scaled so the charged total matches the discounted total.
  const payItems = () => {
    const factor = subtotal > 0 ? total / subtotal : 1
    return cart.map((i) => ({ name: i.title, amount: Math.round(i.price * factor * 100) / 100, quantity: i.quantity }))
  }

  const applyCode = async () => {
    const c = code.trim()
    if (!c) return
    setChecking(true)
    setCodeMsg(null)
    try {
      const res = await fetch(`${SUPA_URL}/functions/v1/hb-discount`, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', code: c, subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscount(data.discount)
        setCodeLabel(data.label || 'Discount')
        setCode(data.code || c.toUpperCase())
        setCodeMsg(null)
      } else {
        setDiscount(0)
        setCodeLabel('')
        setCodeMsg(data.message || 'That code isn’t valid.')
      }
    } catch {
      setCodeMsg('Could not check that code — please try again.')
    } finally {
      setChecking(false)
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  // Returning from Stripe hosted checkout (success_url = /checkout?paid=1).
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('paid') === '1') {
      clearCart()
      setDone(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validate = () => {
    if (cart.length === 0) return 'Your cart is empty.'
    if (form.name.trim().length < 2) return 'Please enter your name.'
    if (form.phone.replace(/\D/g, '').length < 10) return 'Please enter a valid phone number.'
    if (form.method === 'Ship to me' && (!form.address.trim() || !form.city.trim() || !form.zip.trim()))
      return 'Please enter your shipping address.'
    return null
  }

  const recordOrder = async (payLabel: string) => {
    const items = cart.map((i) => `- ${i.title} x ${i.quantity}  ($${(i.price * i.quantity).toFixed(2)})`).join('\n')
    const ship =
      form.method === 'Ship to me'
        ? `${form.address}${form.address2 ? ', ' + form.address2 : ''}, ${form.city}, ${form.state} ${form.zip}`
        : form.method
    const message =
      `NEW ORDER — hubsandbabydoll.com\n\n${items}\n\nSubtotal: $${subtotal.toFixed(2)}\n` +
      (shipping > 0 ? `Shipping: $${shipping.toFixed(2)}\n` : '') +
      (appliedCode ? `Code ${appliedCode}: -$${discount.toFixed(2)}\n` : '') +
      `Total: $${total.toFixed(2)}\n` +
      `Payment: ${payLabel}\nFulfillment: ${form.method}\n` +
      (form.method === 'Ship to me' ? `Ship to: ${ship}\n` : '') +
      (isGift ? `🎁 GIFT${giftMessage ? ` — message: "${giftMessage}"` : ''}\n` : '') +
      (form.notes ? `Notes: ${form.notes}\n` : '')
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
        kind: 'order',
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        service: `Order · ${cartCount} item${cartCount > 1 ? 's' : ''} · $${total.toFixed(2)}${appliedCode ? ` · ${appliedCode}` : ''} · ${payLabel}`,
        pickup: ship,
        message,
      }),
    })
    if (!res.ok) throw new Error('http ' + res.status)

    // Count the code redemption (best-effort; never blocks the order).
    if (appliedCode) {
      fetch(`${SUPA_URL}/functions/v1/hb-discount`, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem', code: appliedCode }),
      }).catch(() => {})
    }

    // Record marketing opt-in consent (fire-and-forget — never blocks the order)
    if (emailOptIn || smsOptIn) {
      fetch(OPTIN_FN, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim() || null,
          phone: smsOptIn ? form.phone.trim() : null,
          email_opt_in: emailOptIn && !!form.email.trim(),
          sms_opt_in: smsOptIn && !!form.phone.trim(),
          sms_consent_disclosure: smsOptIn && form.phone.trim() ? SMS_DISCLOSURE : null,
          source: 'checkout_form',
        }),
      }).catch(() => {})
    }

    // Fire an email alert to the owner (turns on once RESEND_API_KEY is set;
    // no-ops otherwise). Fire-and-forget — never blocks or fails the order.
    fetch(`${SUPA_URL}/functions/v1/hb-notify`, {
      method: 'POST',
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        total: total.toFixed(2),
        method: form.method,
        ship,
        payment: payLabel + (appliedCode ? ` · code ${appliedCode}` : ''),
        items: cart.map((i) => ({ name: i.title, quantity: i.quantity, amount: (i.price * i.quantity).toFixed(2) })),
      }),
    }).catch(() => {})
  }

  // Pay now with a card via Stripe hosted checkout.
  const payByCard = async () => {
    setError(null)
    const v = validate()
    if (v) return setError(v)
    setSubmitting(true)
    try {
      await recordOrder('Card (pending)')
      const res = await fetch(`${SUPA_URL}/functions/v1/hb-checkout`, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          items: payItems(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start card checkout.')
      window.location.href = data.url
    } catch (e) {
      setSubmitting(false)
      setError(e instanceof Error ? e.message : 'Could not start card checkout.')
    }
  }

  // Pay now with a card via Square hosted checkout.
  const payBySquare = async () => {
    setError(null)
    const v = validate()
    if (v) return setError(v)
    setSubmitting(true)
    try {
      await recordOrder('Square (pending)')
      const res = await fetch(`${SUPA_URL}/functions/v1/hb-square-checkout`, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          items: payItems(),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start Square checkout.')
      window.location.href = data.url
    } catch (e) {
      setSubmitting(false)
      setError(e instanceof Error ? e.message : 'Could not start Square checkout.')
    }
  }

  // Place the order now and arrange payment after (tap-to-pay / invoice).
  const placeOrder = async () => {
    setError(null)
    const v = validate()
    if (v) return setError(v)
    setSubmitting(true)
    try {
      await recordOrder('Pay on confirmation')
      setPaidTotal(total)
      clearCart()
      setDone(true)
      window.scrollTo(0, 0)
    } catch {
      setError('Could not place your order — please try again, or email hubsbabydoll@gmail.com.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 border border-primary flex items-center justify-center mb-8">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl mb-5 text-balance">Order received</h1>
        <p className="text-muted-foreground leading-relaxed mb-8 text-pretty">
          Thank you{form.name ? `, ${form.name.split(' ')[0]}` : ''} — your order is in. We&apos;ll see you at the
          event. We&apos;ll collect payment there and get your order handmade and on its way.
        </p>

        <PaymentBox total={paidTotal} />

        <ReferFriend defaultEmail={form.email} />

        <div className="mt-10">
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.2em] text-primary border-b border-primary/40 pb-1 hover:border-primary transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <h1 className="font-serif text-4xl lg:text-5xl mb-3 text-balance">Checkout</h1>
      <p className="text-muted-foreground mb-10 text-pretty max-w-xl">
        Place your order and we&apos;ll confirm your total, availability, and payment personally — handmade,
        never rushed.
      </p>

      {cart.length === 0 ? (
        <div className="border border-border rounded-sm p-10 text-center">
          <p className="text-muted-foreground mb-6">Your cart is empty.</p>
          <Button
            render={<Link href="/shop">Explore the collection</Link>}
            className="rounded-none text-xs uppercase tracking-[0.2em]"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-start">
          {/* Form */}
          <div className="flex flex-col gap-8">
            <fieldset className="flex flex-col gap-4">
              <legend className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Your details</legend>
              <Field label="Full name" value={form.name} onChange={set('name')} autoComplete="name" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Phone" value={form.phone} onChange={set('phone')} type="tel" autoComplete="tel" />
                <Field label="Email" value={form.email} onChange={set('email')} type="email" autoComplete="email" optional />
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-4">
              <legend className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Delivery</legend>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">How would you like it?</span>
                <select
                  value={form.method}
                  onChange={set('method')}
                  className="bg-input border border-border rounded-none px-4 h-12 text-foreground focus:outline-none focus:border-primary"
                >
                  <option>Ship to me</option>
                  <option>Local pickup</option>
                  <option>Local delivery</option>
                  <option>Pick up at an event</option>
                </select>
              </label>

              {form.method === 'Ship to me' && (
                <div className="flex flex-col gap-4">
                  <Field label="Street address" value={form.address} onChange={set('address')} autoComplete="address-line1" />
                  <Field label="Apt, suite, etc." value={form.address2} onChange={set('address2')} autoComplete="address-line2" optional />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Field label="City" value={form.city} onChange={set('city')} autoComplete="address-level2" />
                    <Field label="State" value={form.state} onChange={set('state')} autoComplete="address-level1" />
                    <Field label="ZIP" value={form.zip} onChange={set('zip')} autoComplete="postal-code" />
                  </div>
                </div>
              )}

              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Order notes (optional)</span>
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                  className="bg-input border border-border rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-primary resize-y"
                  placeholder="Scent swaps, delivery timing…"
                />
              </label>

              <div className="border border-border rounded-sm p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="w-4 h-4 accent-[var(--color-primary)]"
                  />
                  <span className="text-sm">🎁 This is a gift</span>
                </label>
                {isGift && (
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    rows={2}
                    maxLength={300}
                    className="mt-3 w-full bg-input border border-border rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-primary resize-y"
                    placeholder="Add a gift message — we'll write it on a card…"
                  />
                )}
              </div>
            </fieldset>

            {/* Marketing opt-in — both unchecked by default, consent not required for purchase */}
            <div className="border border-border rounded-sm p-4 flex flex-col gap-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Stay updated (optional)</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailOptIn}
                  onChange={(e) => setEmailOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[var(--color-primary)] shrink-0"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Email me about new products, restocks, and offers from Hubs &amp; Babydoll. I can
                  unsubscribe anytime.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[var(--color-primary)] shrink-0"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Text me drop alerts and restocks from Hubs &amp; Babydoll. By checking this box, I
                  agree to receive recurring automated marketing texts at the phone number I provided.
                  Msg &amp; data rates may apply. Consent is not a condition of purchase. Text{' '}
                  <strong>STOP</strong> to cancel, <strong>HELP</strong> for help. Message frequency
                  varies.
                </span>
              </label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col gap-3">
              <Button
                onClick={payBySquare}
                disabled={submitting}
                className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-13 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Starting secure checkout…</span>
                ) : (
                  <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pay with Card · ${total.toFixed(2)}</span>
                )}
              </Button>
              <button
                type="button"
                onClick={placeOrder}
                disabled={submitting}
                className="w-full rounded-none text-muted-foreground hover:text-primary text-xs uppercase tracking-[0.2em] h-11 transition-colors disabled:opacity-60"
              >
                Pay in Person
              </button>
            </div>
            <p className="text-xs text-muted-foreground -mt-1 leading-relaxed">
              Payments handled on secure checkout. Prefer Cash App, Venmo, or in person? Choose pay another way and we will confirm.
            </p>
          </div>

          {/* Summary */}
          <aside className="border border-border rounded-sm p-6 bg-card lg:sticky lg:top-24">
            <h2 className="text-xs uppercase tracking-[0.2em] text-primary mb-5">Your order</h2>
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                    {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Qty {item.quantity}</p>
                    {item.shipping_timeframe && (
                      <p className="text-xs text-primary/70 mt-1">Ships in {item.shipping_timeframe}</p>
                    )}
                  </div>
                  <p className="text-sm text-primary whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            {/* Reward / referral code */}
            <div className="border-t border-border mt-5 pt-5">
              {appliedCode ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary">Code {appliedCode} · {codeLabel}</span>
                  <button
                    onClick={() => { setDiscount(0); setCode(''); setCodeLabel(''); setCodeMsg(null) }}
                    className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCode())}
                      placeholder="Reward or referral code"
                      className="flex-1 bg-input border border-border rounded-none px-3 h-11 text-sm text-foreground focus:outline-none focus:border-primary uppercase"
                    />
                    <button
                      onClick={applyCode}
                      disabled={checking || !code.trim()}
                      className="rounded-none border border-primary/40 text-primary hover:bg-primary/10 text-xs uppercase tracking-[0.15em] px-4 h-11 disabled:opacity-50"
                    >
                      {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {codeMsg && <p className="text-xs text-destructive mt-2">{codeMsg}</p>}
                </div>
              )}
            </div>

            <div className="border-t border-border mt-5 pt-5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm text-primary">
                  <span>Discount ({codeLabel})</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              {shipping > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated total</span>
                <span className="font-serif text-2xl text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}

function Field({
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
      <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}{optional && <span className="text-foreground/30"> (optional)</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="bg-input border border-border rounded-none px-4 h-12 text-foreground focus:outline-none focus:border-primary"
      />
    </label>
  )
}

function PaymentBox({ total }: { total: number }) {
  const amt = total.toFixed(2)
  const methods = [
    PAY.cashApp && { name: 'Cash App', href: `https://cash.app/$${PAY.cashApp}/${amt}` },
    PAY.paypal && { name: 'PayPal', href: `https://paypal.me/${PAY.paypal}/${amt}` },
    PAY.venmo && {
      name: 'Venmo',
      href: `https://venmo.com/${PAY.venmo}?txn=pay&amount=${amt}&note=${encodeURIComponent('Hubs & Babydoll order')}`,
    },
  ].filter(Boolean) as { name: string; href: string }[]

  return (
    <div className="mx-auto max-w-sm border border-primary/30 bg-card rounded-sm p-6 text-left">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Amount due</span>
        <span className="font-serif text-3xl text-primary">${amt}</span>
      </div>
      {methods.length > 0 ? (
        <div className="flex flex-col gap-3">
          {methods.map((m) => (
            <a
              key={m.name}
              href={m.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 font-medium transition-colors"
            >
              Pay with {m.name}
            </a>
          ))}
          <p className="text-[11px] text-muted-foreground mt-1 text-center">
            Opens the app with your total filled in — every order is confirmed by hand.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          We&apos;ll send you a quick payment request to finish up — thank you for your patience.
        </p>
      )}
    </div>
  )
}
