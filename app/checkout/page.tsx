'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Check, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShoppingCart } from '@/components/shopping-cart-provider'

// Orders are captured into TB Command (the shared Supabase backend) so they
// appear in the owner's dashboard. This anon key is a public, insert-only key.
const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'
const CLIENT = 'hubsandbabydoll'

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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const placeOrder = async () => {
    setError(null)
    if (cart.length === 0) return
    if (form.name.trim().length < 2) return setError('Please enter your name.')
    if (form.phone.replace(/\D/g, '').length < 10) return setError('Please enter a valid phone number.')
    if (form.method === 'Ship to me' && (!form.address.trim() || !form.city.trim() || !form.zip.trim()))
      return setError('Please enter your shipping address.')

    const items = cart.map((i) => `- ${i.title} x ${i.quantity}  ($${(i.price * i.quantity).toFixed(2)})`).join('\n')
    const ship =
      form.method === 'Ship to me'
        ? `${form.address}${form.address2 ? ', ' + form.address2 : ''}, ${form.city}, ${form.state} ${form.zip}`
        : form.method
    const message =
      `NEW ORDER — hubsandbabydoll.com\n\n${items}\n\nSubtotal: $${subtotal.toFixed(2)}\n` +
      `Fulfillment: ${form.method}\n` +
      (form.method === 'Ship to me' ? `Ship to: ${ship}\n` : '') +
      (form.notes ? `Notes: ${form.notes}\n` : '')

    setSubmitting(true)
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
          kind: 'order',
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          service: `Order · ${cartCount} item${cartCount > 1 ? 's' : ''} · $${subtotal.toFixed(2)}`,
          pickup: ship,
          message,
        }),
      })
      if (!res.ok) throw new Error('http ' + res.status)
      setPaidTotal(subtotal)
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
          Thank you{form.name ? `, ${form.name.split(' ')[0]}` : ''} — your order is in. Complete your
          payment below and we&apos;ll get it handmade and on its way.
        </p>

        <PaymentBox total={paidTotal} />

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
                  placeholder="Gift message, scent swaps, delivery timing…"
                />
              </label>
            </fieldset>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={placeOrder}
              disabled={submitting}
              className="w-full sm:w-auto sm:self-start rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-13 px-12 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Placing order…</span>
              ) : (
                `Place order · $${subtotal.toFixed(2)}`
              )}
            </Button>
            <p className="text-xs text-muted-foreground -mt-4">
              No card is charged here — we confirm your total and payment (Zelle, Cash App, card, or in person)
              before anything is due.
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
                  </div>
                  <p className="text-sm text-primary whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border mt-5 pt-5">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated total</span>
              <span className="font-serif text-2xl text-primary">${subtotal.toFixed(2)}</span>
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
