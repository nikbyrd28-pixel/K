'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Loader2, RefreshCw, Search, DollarSign, Users, TrendingUp,
  ChevronDown, ChevronRight, Copy, Check, Mail, ExternalLink,
} from 'lucide-react'

const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'
const FN = `${SUPA_URL}/functions/v1/hb-affiliates`

type RepOrder = { id?: string | number; created_at?: string; name?: string; total: number; status?: string }

export type Rep = {
  email: string
  name: string
  social: string
  audience: string
  notes: string
  status: 'active' | 'paused' | 'removed' | string
  commission_rate: number
  cashapp: string
  venmo: string
  paypal: string
  created_at: string | null
  unregistered: boolean
  code: string
  codeActive: boolean
  redemptions: number
  orderCount: number
  revenue: number
  earned: number
  paid: number
  owed: number
  lastOrderAt: string | null
  orders: RepOrder[]
}

type Summary = { reps: number; active: number; selling: number; revenue: number; earned: number; owed: number }

const money = (n: number) => `$${(Number(n) || 0).toFixed(2)}`
const shortDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'

export function AffiliatesTab({ password }: { password: string }) {
  const [reps, setReps] = useState<Rep[] | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [showPaid, setShowPaid] = useState(false)
  const [open, setOpen] = useState<string | null>(null)

  const call = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      const res = await fetch(FN, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Something went wrong.')
      return data
    },
    [password],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const data = await call('list')
      setReps(data.affiliates || [])
      setSummary(data.summary || null)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load affiliates.')
    } finally {
      setLoading(false)
    }
  }, [call])

  useEffect(() => { load() }, [load])

  const visible = useMemo(() => {
    if (!reps) return []
    const needle = q.trim().toLowerCase()
    return reps
      .filter((r) => (showPaid ? true : r.status !== 'removed'))
      .filter((r) =>
        !needle ||
        r.name.toLowerCase().includes(needle) ||
        r.email.toLowerCase().includes(needle) ||
        r.code.toLowerCase().includes(needle) ||
        r.social.toLowerCase().includes(needle),
      )
  }, [reps, q, showPaid])

  if (!reps) {
    return (
      <div className="flex justify-center py-16">
        {err ? <p className="text-sm text-destructive">{err}</p> : <Loader2 className="w-6 h-6 animate-spin text-primary" />}
      </div>
    )
  }

  const owedReps = reps.filter((r) => r.owed > 0.004)

  return (
    <div className="flex flex-col gap-6">
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={<Users className="w-4 h-4" />} label="Reps" value={String(summary.reps)} sub={`${summary.selling} have sold`} />
          <Stat icon={<TrendingUp className="w-4 h-4" />} label="Revenue driven" value={money(summary.revenue)} sub="attributed to codes" />
          <Stat icon={<DollarSign className="w-4 h-4" />} label="Commission earned" value={money(summary.earned)} sub="all time" />
          <Stat icon={<DollarSign className="w-4 h-4" />} label="Owed now" value={money(summary.owed)} sub={`${owedReps.length} to pay`} highlight={summary.owed > 0} />
        </div>
      )}

      {owedReps.length > 0 && (
        <div className="border border-primary/40 bg-primary/5 rounded-sm p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Ready to pay</p>
          <p className="text-sm text-muted-foreground">
            {owedReps.length} rep{owedReps.length === 1 ? '' : 's'} {owedReps.length === 1 ? 'is' : 'are'} owed{' '}
            <span className="text-primary">{money(summary?.owed || 0)}</span> in total. Open a rep below to record what you sent.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, code"
            className="w-full bg-input border border-border rounded-none pl-9 pr-3 h-11 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={showPaid} onChange={(e) => setShowPaid(e.target.checked)} className="accent-primary" />
          Show removed
        </label>
        <button onClick={load} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      {visible.length === 0 ? (
        <div className="border border-border rounded-sm p-10 text-center text-muted-foreground">
          {reps.length === 0 ? (
            <>
              No affiliates yet. Share <span className="text-primary">hubsandbabydoll.com/affiliates</span> and
              reps will appear here the moment they sign up.
            </>
          ) : (
            'No one matches that search.'
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((r) => (
            <RepRow
              key={r.email}
              rep={r}
              open={open === r.email}
              onToggle={() => setOpen(open === r.email ? null : r.email)}
              call={call}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ icon, label, value, sub, highlight }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; highlight?: boolean
}) {
  return (
    <div className={`border rounded-sm p-4 ${highlight ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'}`}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className={`font-serif text-2xl tabular-nums ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function RepRow({ rep, open, onToggle, call, onChanged }: {
  rep: Rep
  open: boolean
  onToggle: () => void
  call: (a: string, e?: Record<string, unknown>) => Promise<any>
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payNote, setPayNote] = useState('')
  const [draft, setDraft] = useState({
    name: rep.name, social: rep.social, notes: rep.notes,
    status: rep.status, commission_rate: String(rep.commission_rate),
    cashapp: rep.cashapp, venmo: rep.venmo, paypal: rep.paypal,
  })

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500) }

  const save = async (patch: Partial<typeof draft> = {}) => {
    const next = { ...draft, ...patch }
    setBusy(true)
    try {
      await call('save', {
        affiliate: {
          email: rep.email,
          name: next.name,
          social: next.social,
          audience: rep.audience,
          code: rep.code,
          notes: next.notes,
          status: next.status,
          commission_rate: Number(next.commission_rate) || 0,
          cashapp: next.cashapp,
          venmo: next.venmo,
          paypal: next.paypal,
        },
      })
      setDraft(next)
      flash('Saved ✓')
      onChanged()
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  const recordPayout = async () => {
    const amt = Number(payAmount)
    if (!Number.isFinite(amt) || amt <= 0) return flash('Enter an amount.')
    setBusy(true)
    try {
      await call('payout', { email: rep.email, amount: amt, note: payNote })
      setPayAmount('')
      setPayNote('')
      flash('Payment recorded ✓')
      onChanged()
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not record that.')
    } finally {
      setBusy(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard?.writeText(rep.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  const owes = rep.owed > 0.004
  const amt = owes ? rep.owed.toFixed(2) : ''

  // One-tap pay: open the rep's payment app pre-filled, then log the payout so
  // the Owed figure stays honest. The link only pre-fills an amount when one is
  // owed; Venmo has no reliable web deep-link for a specific amount, so it just
  // opens their profile and the amount is typed there.
  const payVia = (kind: 'cashapp' | 'venmo' | 'paypal') => {
    const url =
      kind === 'cashapp'
        ? `https://cash.app/$${rep.cashapp}${amt ? `/${amt}` : ''}`
        : kind === 'venmo'
          ? `https://venmo.com/u/${rep.venmo}`
          : `https://paypal.me/${rep.paypal}${amt ? `/${amt}` : ''}`
    window.open(url, '_blank', 'noopener')
    if (!payAmount && amt) setPayAmount(amt)
    if (!payNote) setPayNote(kind === 'cashapp' ? 'Cash App' : kind === 'venmo' ? 'Venmo' : 'PayPal')
    flash('Opened — confirm in the app, then Record it below')
  }

  const hasHandle = !!(rep.cashapp || rep.venmo || rep.paypal)

  return (
    <div className={`border rounded-sm ${rep.status === 'active' ? 'border-border bg-card' : 'border-border/50 bg-card/50'}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 text-left flex-wrap">
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}

        <div className="min-w-0 flex-1">
          <p className="text-sm truncate">
            {rep.name || rep.email}
            {rep.status !== 'active' && (
              <span className="ml-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground border border-border px-1.5 py-0.5">
                {rep.status}
              </span>
            )}
            {rep.unregistered && (
              <span className="ml-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground border border-border px-1.5 py-0.5">
                no profile
              </span>
            )}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {rep.code || 'no code'}
            {rep.social ? ` · ${rep.social}` : ''}
            {rep.lastOrderAt ? ` · last sale ${shortDate(rep.lastOrderAt)}` : ' · no sales yet'}
          </p>
        </div>

        <div className="flex items-center gap-5 text-right shrink-0">
          <div>
            <p className="text-sm tabular-nums">{rep.orderCount}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">orders</p>
          </div>
          <div>
            <p className="text-sm tabular-nums">{money(rep.revenue)}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">sold</p>
          </div>
          <div>
            <p className={`text-sm tabular-nums ${owes ? 'text-primary' : 'text-muted-foreground'}`}>{money(rep.owed)}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">owed</p>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-5 flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={copyCode}
              disabled={!rep.code}
              className="inline-flex items-center gap-2 border border-primary/40 px-3 h-9 text-xs hover:bg-primary/10 disabled:opacity-40"
            >
              <span className="font-serif tracking-wider text-primary">{rep.code || '—'}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            <a
              href={`mailto:${rep.email}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              <Mail className="w-3.5 h-3.5" /> {rep.email}
            </a>
            {!rep.codeActive && rep.code && (
              <span className="text-[11px] text-destructive">code is switched off</span>
            )}
          </div>

          {rep.audience && (
            <p className="text-xs text-muted-foreground">Audience: {rep.audience}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <Mini label="Redemptions" value={String(rep.redemptions)} />
            <Mini label="Earned" value={money(rep.earned)} />
            <Mini label="Paid" value={money(rep.paid)} />
            <Mini label="Owed" value={money(rep.owed)} highlight={owes} />
          </div>

          {/* One-tap pay */}
          {hasHandle && (
            <div className="border border-primary/30 bg-primary/5 rounded-sm p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">
                Send {owes ? money(rep.owed) : 'payment'}
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                Opens the app{owes ? ' pre-filled' : ''}. Confirm there, then Record it below so the balance updates.
              </p>
              <div className="flex flex-wrap gap-2">
                {rep.cashapp && (
                  <button
                    onClick={() => payVia('cashapp')}
                    className="inline-flex items-center gap-1.5 border border-primary/40 hover:bg-primary/10 rounded-none px-4 h-10 text-xs uppercase tracking-[0.15em]"
                  >
                    Cash App <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {rep.venmo && (
                  <button
                    onClick={() => payVia('venmo')}
                    className="inline-flex items-center gap-1.5 border border-primary/40 hover:bg-primary/10 rounded-none px-4 h-10 text-xs uppercase tracking-[0.15em]"
                  >
                    Venmo <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {rep.paypal && (
                  <button
                    onClick={() => payVia('paypal')}
                    className="inline-flex items-center gap-1.5 border border-primary/40 hover:bg-primary/10 rounded-none px-4 h-10 text-xs uppercase tracking-[0.15em]"
                  >
                    PayPal <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Record a payment */}
          <div className="border border-border rounded-sm p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Record a payment</p>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={owes ? rep.owed.toFixed(2) : '0.00'}
                className="w-28 bg-input border border-border rounded-none px-3 h-10 text-sm tabular-nums focus:outline-none focus:border-primary"
              />
              <input
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="How you sent it (Cash App, Venmo…)"
                className="flex-1 min-w-[10rem] bg-input border border-border rounded-none px-3 h-10 text-sm focus:outline-none focus:border-primary"
              />
              {owes && (
                <button
                  onClick={() => setPayAmount(rep.owed.toFixed(2))}
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary px-2"
                >
                  Full {money(rep.owed)}
                </button>
              )}
              <button
                onClick={recordPayout}
                disabled={busy}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-5 h-10 text-xs uppercase tracking-[0.15em] disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record'}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              This logs what you sent — it doesn&apos;t move money. Pay them however you normally do.
            </p>
          </div>

          {/* Manage the rep */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field label="Instagram / TikTok" value={draft.social} onChange={(v) => setDraft({ ...draft, social: v })} />
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Status</span>
              <select
                value={draft.status}
                onChange={(e) => save({ status: e.target.value })}
                className="bg-input border border-border rounded-none px-3 h-10 text-sm focus:outline-none focus:border-primary"
              >
                <option value="active">Active</option>
                <option value="paused">Paused — code stops working</option>
                <option value="removed">Removed</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Commission %</span>
              <input
                type="number"
                min="0"
                max="100"
                value={draft.commission_rate}
                onChange={(e) => setDraft({ ...draft, commission_rate: e.target.value })}
                className="bg-input border border-border rounded-none px-3 h-10 text-sm tabular-nums focus:outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="border border-border rounded-sm p-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Where to pay them</p>
            <p className="text-[11px] text-muted-foreground mb-3">Fill in any one to turn on the one-tap pay buttons above. The $ or @ is optional.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Cash App" value={draft.cashapp} onChange={(v) => setDraft({ ...draft, cashapp: v })} />
              <Field label="Venmo" value={draft.venmo} onChange={(v) => setDraft({ ...draft, venmo: v })} />
              <Field label="PayPal.me" value={draft.paypal} onChange={(v) => setDraft({ ...draft, paypal: v })} />
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Notes</span>
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              rows={2}
              placeholder="Where you met, what they post, what you agreed…"
              className="bg-input border border-border rounded-none px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y"
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={() => save()}
              disabled={busy}
              className="border border-primary/40 text-foreground hover:bg-primary/10 rounded-none px-5 h-10 text-xs uppercase tracking-[0.15em] disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
            </button>
            {msg && <span className="text-xs text-primary">{msg}</span>}
          </div>

          {rep.orders.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary mb-2">Orders from this code</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[22rem]">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left font-normal py-1.5">Date</th>
                      <th className="text-left font-normal py-1.5">Customer</th>
                      <th className="text-right font-normal py-1.5">Order</th>
                      <th className="text-right font-normal py-1.5">Their cut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rep.orders.map((o, i) => (
                      <tr key={o.id ?? i} className="border-t border-border">
                        <td className="py-1.5">{shortDate(o.created_at)}</td>
                        <td className="py-1.5 truncate max-w-[10rem]">{o.name || '—'}</td>
                        <td className="py-1.5 text-right tabular-nums">{money(o.total)}</td>
                        <td className="py-1.5 text-right tabular-nums text-primary">
                          {money((o.total * rep.commission_rate) / 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Mini({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="border border-border rounded-sm py-3">
      <p className={`text-base tabular-nums ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-input border border-border rounded-none px-3 h-10 text-sm focus:outline-none focus:border-primary"
      />
    </label>
  )
}
