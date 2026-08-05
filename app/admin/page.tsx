'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Plus, Trash2, Eye, EyeOff, Check, LogOut, ImagePlus, RefreshCw } from 'lucide-react'
import { mergeCatalog, type EffectiveItem, type ProductRow, type CatalogSize } from '@/lib/catalog'

const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'
const FN = `${SUPA_URL}/functions/v1/hb-admin`

type EditItem = EffectiveItem & { _saving?: boolean; _new?: boolean }
type Order = {
  id?: string | number
  created_at?: string
  name?: string
  phone?: string
  email?: string
  service?: string
  pickup?: string
  message?: string
}

type DashUser = { name: string; role: string }

export default function AdminPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [user, setUser] = useState<DashUser | null>(null)
  const [tab, setTab] = useState<'orders' | 'products' | 'rewards' | 'team'>('orders')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('hb_pw')
    if (saved) {
      setPw(saved)
      setAuthed(true)
    }
    const savedUser = localStorage.getItem('hb_user')
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)) } catch {}
    }
  }, [])

  const rememberUser = (u: DashUser | null) => {
    setUser(u)
    if (typeof window !== 'undefined') {
      if (u) localStorage.setItem('hb_user', JSON.stringify(u))
      else localStorage.removeItem('hb_user')
    }
  }

  const call = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      const res = await fetch(FN, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, action, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Something went wrong.')
      return data
    },
    [pw],
  )

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      // A lightweight, real password check — asking for orders proves the password.
      const data = await call('orders')
      rememberUser(data.user || null)
      localStorage.setItem('hb_pw', pw)
      setAuthed(true)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem('hb_pw')
    localStorage.removeItem('hb_user')
    setPw('')
    setUser(null)
    setAuthed(false)
    setTab('orders')
  }

  if (!authed) {
    return (
      <section className="max-w-sm mx-auto px-4 py-24 lg:py-32">
        <h1 className="font-serif text-4xl text-center mb-2">Your Dashboard</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Sign in to manage orders and products.
        </p>
        <form onSubmit={signIn} className="flex flex-col gap-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Dashboard password"
            autoFocus
            className="bg-input border border-border rounded-none px-4 h-12 text-foreground focus:outline-none focus:border-primary"
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            type="submit"
            disabled={busy || !pw}
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Sign in'}
          </button>
        </form>
        <p className="text-center mt-8">
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary">
            ← Back to site
          </Link>
        </p>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl">Your Dashboard</h1>
          {user && (
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2">
              Signed in as {user.name}{user.role === 'owner' ? ' · Owner' : ''}
            </p>
          )}
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-border">
        {(['orders', 'products', 'rewards', ...(user?.role === 'owner' ? ['team'] : [])] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-5 py-3 text-xs uppercase tracking-[0.2em] -mb-px border-b-2 transition-colors capitalize',
              tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'orders' && <OrdersTab call={call} onUser={rememberUser} />}
      {tab === 'products' && <ProductsTab call={call} />}
      {tab === 'rewards' && <RewardsTab call={call} />}
      {tab === 'team' && <TeamTab call={call} meName={user?.name} />}
    </section>
  )
}

// ---------------------------------------------------------------------------
//  ORDERS
// ---------------------------------------------------------------------------
function OrdersTab({ call, onUser }: { call: (a: string, e?: Record<string, unknown>) => Promise<any>; onUser?: (u: { name: string; role: string } | null) => void }) {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [subscribers, setSubscribers] = useState<Order[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const data = await call('orders')
      if (data.user && onUser) onUser(data.user)
      setOrders(data.orders || [])
      setSubscribers(data.subscribers || [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load orders.')
    } finally {
      setLoading(false)
    }
  }, [call])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      {subscribers.length > 0 && (
        <details className="mb-6 border border-border rounded-sm bg-card">
          <summary className="cursor-pointer px-5 py-4 text-sm">
            <span className="text-primary font-medium">{subscribers.length}</span>{' '}
            <span className="text-muted-foreground">email subscriber{subscribers.length === 1 ? '' : 's'} on your list</span>
          </summary>
          <div className="px-5 pb-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3">
            {subscribers.map((s, i) => (
              <span key={s.id ?? i} className="text-xs text-muted-foreground">{s.email}</span>
            ))}
          </div>
        </details>
      )}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          {orders ? `${orders.length} recent order${orders.length === 1 ? '' : 's'}` : ' '}
        </p>
        <button onClick={load} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      {err && <p className="text-sm text-destructive mb-4">{err}</p>}
      {loading && !orders && (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      )}
      {orders && orders.length === 0 && (
        <div className="border border-border rounded-sm p-10 text-center text-muted-foreground">
          No orders yet — they’ll appear here the moment someone checks out.
        </div>
      )}
      <div className="flex flex-col gap-4">
        {orders?.map((o, i) => (
          <div key={o.id ?? i} className="border border-border rounded-sm p-5 bg-card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-serif text-xl">{o.name || 'Customer'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[o.phone, o.email].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary">{o.service || ''}</p>
                {o.created_at && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {o.message && (
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap mt-3 pt-3 border-t border-border font-sans leading-relaxed">
                {o.message}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
//  PRODUCTS
// ---------------------------------------------------------------------------
function ProductsTab({ call }: { call: (a: string, e?: Record<string, unknown>) => Promise<any> }) {
  const [items, setItems] = useState<EditItem[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  const [editedBy, setEditedBy] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/hb_products?select=*`, {
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      })
      const rows: (ProductRow & { updated_by?: string })[] = res.ok ? await res.json() : []
      const safe = Array.isArray(rows) ? rows : []
      const by: Record<string, string> = {}
      safe.forEach((r) => { if (r.updated_by) by[r.handle] = r.updated_by })
      setEditedBy(by)
      setItems(mergeCatalog(safe))
    } catch {
      setItems(mergeCatalog([]))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const flash = (m: string) => {
    setOkMsg(m)
    setTimeout(() => setOkMsg(null), 2500)
  }

  const update = (idx: number, patch: Partial<EditItem>) =>
    setItems((prev) => prev!.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  const updateSize = (idx: number, sIdx: number, patch: Partial<CatalogSize>) =>
    setItems((prev) =>
      prev!.map((it, i) =>
        i === idx ? { ...it, sizes: it.sizes.map((s, j) => (j === sIdx ? { ...s, ...patch } : s)) } : it,
      ),
    )

  const addSize = (idx: number) =>
    setItems((prev) => prev!.map((it, i) => (i === idx ? { ...it, sizes: [...it.sizes, { size: 'New size', price: 0 }] } : it)))

  const removeSize = (idx: number, sIdx: number) =>
    setItems((prev) => prev!.map((it, i) => (i === idx ? { ...it, sizes: it.sizes.filter((_, j) => j !== sIdx) } : it)))

  const save = async (idx: number) => {
    const it = items![idx]
    if (!it.name.trim()) return setErr('Please give the product a name first.')
    update(idx, { _saving: true })
    setErr(null)
    try {
      const data = await call('save', {
        product: {
          handle: it.handle || it.name,
          name: it.name,
          description: it.description,
          image: it.image,
          sizes: it.sizes,
          sort: it.sort,
          active: it.active,
        },
      })
      update(idx, { _saving: false, _new: false, handle: data.product?.handle || it.handle })
      flash('Saved ✓')
    } catch (e) {
      update(idx, { _saving: false })
      setErr(e instanceof Error ? e.message : 'Could not save.')
    }
  }

  const toggleHide = async (idx: number) => {
    update(idx, { active: !items![idx].active })
    // Persist immediately so it reflects on the site.
    const it = { ...items![idx], active: !items![idx].active }
    try {
      await call('save', {
        product: {
          handle: it.handle || it.name,
          name: it.name,
          description: it.description,
          image: it.image,
          sizes: it.sizes,
          sort: it.sort,
          active: it.active,
        },
      })
      flash(it.active ? 'Now showing on the site' : 'Hidden from the site')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not update.')
    }
  }

  const remove = async (idx: number) => {
    const it = items![idx]
    if (it._new) return setItems((prev) => prev!.filter((_, i) => i !== idx))
    if (!confirm(`Delete "${it.name}"? This can't be undone.`)) return
    try {
      await call('delete', { handle: it.handle })
      setItems((prev) => prev!.filter((_, i) => i !== idx))
      flash('Deleted')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not delete.')
    }
  }

  const addProduct = () =>
    setItems((prev) => [
      {
        handle: '',
        name: '',
        description: '',
        image: '',
        imageAlt: '',
        sizes: [{ size: 'One size', price: 0 }],
        active: true,
        sort: (prev?.length ?? 0) + 100,
        _new: true,
      },
      ...(prev ?? []),
    ])

  const uploadPhoto = async (idx: number, file: File) => {
    setErr(null)
    update(idx, { _saving: true })
    try {
      const dataUrl = await compressImage(file)
      const it = items![idx]
      const data = await call('upload', { handle: it.handle || it.name || 'photo', dataUrl })
      update(idx, { image: data.url, _saving: false })
      // Auto-save the new photo if the product already exists (has a name).
      if (it.name.trim() && !it._new) {
        await call('save', {
          product: { handle: it.handle, name: it.name, description: it.description, image: data.url, sizes: it.sizes, sort: it.sort, active: it.active },
        })
        flash('Photo updated ✓')
      } else {
        flash('Photo ready — click Save')
      }
    } catch (e) {
      update(idx, { _saving: false })
      setErr(e instanceof Error ? e.message : 'Could not upload the photo.')
    }
  }

  if (!items) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          onClick={addProduct}
          className="inline-flex items-center gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-11 px-5"
        >
          <Plus className="w-4 h-4" /> Add product
        </button>
        {okMsg && <span className="text-sm text-primary">{okMsg}</span>}
      </div>
      {err && <p className="text-sm text-destructive mb-4">{err}</p>}

      <div className="flex flex-col gap-6">
        {items.map((it, idx) => (
          <div
            key={it.handle || `new-${idx}`}
            className={`border rounded-sm p-5 bg-card ${it.active ? 'border-border' : 'border-border/50 opacity-70'}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-5">
              {/* Photo */}
              <div>
                <div className="relative w-full aspect-square bg-muted rounded-sm overflow-hidden border border-border">
                  {it.image ? (
                    <Image src={it.image} alt={it.name} fill className="object-cover" sizes="120px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImagePlus className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <label className="mt-2 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.12em] text-primary border border-primary/40 h-9 cursor-pointer hover:bg-primary/10 transition-colors">
                  <ImagePlus className="w-3.5 h-3.5" /> Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadPhoto(idx, e.target.files[0])}
                  />
                </label>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-3">
                <input
                  value={it.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="Product name"
                  className="bg-input border border-border rounded-none px-3 h-11 text-foreground font-serif text-lg focus:outline-none focus:border-primary"
                />
                <textarea
                  value={it.description}
                  onChange={(e) => update(idx, { description: e.target.value })}
                  placeholder="Description"
                  rows={2}
                  className="bg-input border border-border rounded-none px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-y"
                />

                {/* Sizes + prices */}
                <div className="flex flex-col gap-2">
                  {it.sizes.map((s, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <input
                        value={s.size}
                        onChange={(e) => updateSize(idx, sIdx, { size: e.target.value })}
                        placeholder="Size"
                        className="bg-input border border-border rounded-none px-3 h-10 text-sm w-32 focus:outline-none focus:border-primary"
                      />
                      <span className="text-muted-foreground">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={s.price}
                        onChange={(e) => updateSize(idx, sIdx, { price: parseFloat(e.target.value) || 0 })}
                        className="bg-input border border-border rounded-none px-3 h-10 text-sm w-24 focus:outline-none focus:border-primary"
                      />
                      <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-muted-foreground ml-1">
                        <input
                          type="checkbox"
                          checked={!!s.soldOut}
                          onChange={(e) => updateSize(idx, sIdx, { soldOut: e.target.checked })}
                        />
                        Sold out
                      </label>
                      {it.sizes.length > 1 && (
                        <button onClick={() => removeSize(idx, sIdx)} className="text-muted-foreground hover:text-destructive ml-auto" aria-label="Remove size">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addSize(idx)} className="self-start text-[11px] uppercase tracking-[0.12em] text-primary hover:underline mt-1">
                    + Add a size
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border mt-1">
                  <button
                    onClick={() => save(idx)}
                    disabled={it._saving}
                    className="inline-flex items-center gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.18em] h-10 px-5 disabled:opacity-60"
                  >
                    {it._saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                  </button>
                  <button
                    onClick={() => toggleHide(idx)}
                    className="inline-flex items-center gap-2 rounded-none border border-border text-foreground hover:border-primary text-xs uppercase tracking-[0.18em] h-10 px-4"
                  >
                    {it.active ? <><EyeOff className="w-4 h-4" /> Hide</> : <><Eye className="w-4 h-4" /> Show</>}
                  </button>
                  <button
                    onClick={() => remove(idx)}
                    className="inline-flex items-center gap-2 rounded-none text-muted-foreground hover:text-destructive text-xs uppercase tracking-[0.18em] h-10 px-3 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
                {editedBy[it.handle] && (
                  <p className="text-[11px] text-muted-foreground">Last edited by {editedBy[it.handle]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
//  REWARDS (discount + referral codes)
// ---------------------------------------------------------------------------
type Code = {
  code: string
  kind: 'percent' | 'amount'
  value: number
  active: boolean
  max_uses: number | null
  used_count: number
  min_subtotal: number
  referrer_email: string | null
  note: string
  updated_by?: string
}

function RewardsTab({ call }: { call: (a: string, e?: Record<string, unknown>) => Promise<any> }) {
  const [codes, setCodes] = useState<Code[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [draft, setDraft] = useState({ code: '', kind: 'percent' as 'percent' | 'amount', value: '10', max_uses: '', min_subtotal: '', note: '' })

  const load = useCallback(async () => {
    setErr(null)
    try {
      const data = await call('discounts')
      setCodes(data.codes || [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load codes.')
    }
  }, [call])

  useEffect(() => {
    load()
  }, [load])

  const flash = (m: string) => {
    setOkMsg(m)
    setTimeout(() => setOkMsg(null), 2500)
  }

  const create = async () => {
    if (!draft.code.trim()) return setErr('Enter a code (letters and numbers).')
    setErr(null)
    try {
      await call('discount_save', {
        discount: {
          code: draft.code,
          kind: draft.kind,
          value: parseFloat(draft.value) || 0,
          max_uses: draft.max_uses === '' ? null : parseInt(draft.max_uses),
          min_subtotal: parseFloat(draft.min_subtotal) || 0,
          note: draft.note,
          active: true,
        },
      })
      setDraft({ code: '', kind: 'percent', value: '10', max_uses: '', min_subtotal: '', note: '' })
      flash('Code created ✓')
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create code.')
    }
  }

  const toggle = async (c: Code) => {
    try {
      await call('discount_save', {
        discount: { code: c.code, kind: c.kind, value: c.value, max_uses: c.max_uses, min_subtotal: c.min_subtotal, note: c.note, active: !c.active },
      })
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not update.')
    }
  }

  const del = async (c: Code) => {
    if (!confirm(`Delete code ${c.code}?`)) return
    try {
      await call('discount_delete', { code: c.code })
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not delete.')
    }
  }

  if (!codes) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>

  const referrals = codes.filter((c) => c.referrer_email)
  const regular = codes.filter((c) => !c.referrer_email)

  return (
    <div className="flex flex-col gap-8">
      {/* Create */}
      <div className="border border-border rounded-sm p-5 bg-card">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Create a reward code</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={draft.code}
            onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
            placeholder="CODE e.g. THANKYOU"
            className="bg-input border border-border rounded-none px-3 h-11 text-sm uppercase focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <select
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value as 'percent' | 'amount' })}
              className="bg-input border border-border rounded-none px-3 h-11 text-sm focus:outline-none focus:border-primary"
            >
              <option value="percent">% off</option>
              <option value="amount">$ off</option>
            </select>
            <input
              type="number"
              min="0"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              placeholder="10"
              className="flex-1 bg-input border border-border rounded-none px-3 h-11 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <input
            type="number"
            min="1"
            value={draft.max_uses}
            onChange={(e) => setDraft({ ...draft, max_uses: e.target.value })}
            placeholder="Max uses (blank = unlimited)"
            className="bg-input border border-border rounded-none px-3 h-11 text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="number"
            min="0"
            value={draft.min_subtotal}
            onChange={(e) => setDraft({ ...draft, min_subtotal: e.target.value })}
            placeholder="Minimum spend $ (optional)"
            className="bg-input border border-border rounded-none px-3 h-11 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button
            onClick={create}
            className="inline-flex items-center gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.18em] h-11 px-5"
          >
            <Plus className="w-4 h-4" /> Create code
          </button>
          {okMsg && <span className="text-sm text-primary">{okMsg}</span>}
          {err && <span className="text-sm text-destructive">{err}</span>}
        </div>
      </div>

      {/* Regular codes */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">{regular.length} reward code{regular.length === 1 ? '' : 's'}</p>
        <div className="flex flex-col gap-2">
          {regular.map((c) => (
            <CodeRow key={c.code} c={c} onToggle={() => toggle(c)} onDelete={() => del(c)} />
          ))}
        </div>
      </div>

      {/* Referrals */}
      {referrals.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">{referrals.length} customer referral code{referrals.length === 1 ? '' : 's'}</p>
          <p className="text-xs text-muted-foreground mb-3">Codes your customers shared with friends — reach out to thank the ones with uses.</p>
          <div className="flex flex-col gap-2">
            {referrals.map((c) => (
              <CodeRow key={c.code} c={c} onToggle={() => toggle(c)} onDelete={() => del(c)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CodeRow({ c, onToggle, onDelete }: { c: Code; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className={`flex items-center gap-3 border rounded-sm px-4 py-3 flex-wrap ${c.active ? 'border-border bg-card' : 'border-border/50 opacity-60'}`}>
      <span className="font-serif text-lg tracking-wider text-primary">{c.code}</span>
      <span className="text-xs text-muted-foreground">
        {c.kind === 'amount' ? `$${c.value} off` : `${c.value}% off`}
        {c.min_subtotal > 0 ? ` · min $${c.min_subtotal}` : ''}
        {` · used ${c.used_count}${c.max_uses != null ? `/${c.max_uses}` : ''}`}
        {c.referrer_email ? ` · from ${c.referrer_email}` : ''}
        {c.updated_by ? ` · by ${c.updated_by}` : ''}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={onToggle} className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary">
          {c.active ? 'Turn off' : 'Turn on'}
        </button>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive" aria-label={`Delete ${c.code}`}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
//  TEAM (separate logins — owner only)
// ---------------------------------------------------------------------------
type Admin = { id: string; name: string; role: string; active: boolean }

function TeamTab({ call, meName }: { call: (a: string, e?: Record<string, unknown>) => Promise<any>; meName?: string }) {
  const [admins, setAdmins] = useState<Admin[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [draft, setDraft] = useState({ name: '', password: '', role: 'helper' as 'helper' | 'owner' })

  const load = useCallback(async () => {
    setErr(null)
    try {
      const data = await call('admins')
      setAdmins(data.admins || [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load logins.')
    }
  }, [call])

  useEffect(() => { load() }, [load])

  const flash = (m: string) => { setOkMsg(m); setTimeout(() => setOkMsg(null), 2500) }

  const add = async () => {
    if (!draft.name.trim()) return setErr('Enter a name.')
    if (draft.password.trim().length < 4) return setErr('Set a password (at least 4 characters).')
    setErr(null)
    try {
      await call('admin_save', { admin: { name: draft.name, password: draft.password, role: draft.role } })
      setDraft({ name: '', password: '', role: 'helper' })
      flash('Login added ✓')
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not add login.')
    }
  }

  const resetPw = async (a: Admin) => {
    const pw = prompt(`New password for ${a.name} (at least 4 characters):`)
    if (!pw || pw.length < 4) return
    try {
      await call('admin_save', { admin: { id: a.id, name: a.name, role: a.role, password: pw } })
      flash(`Password updated for ${a.name}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not update.')
    }
  }

  const del = async (a: Admin) => {
    if (!confirm(`Remove ${a.name}'s login?`)) return
    try {
      await call('admin_delete', { id: a.id })
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not remove.')
    }
  }

  if (!admins) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground -mt-2">
        Each person gets their own password, so edits are labeled with who made them.
      </p>

      <div className="border border-border rounded-sm p-5 bg-card">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Add a login</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Name"
            className="bg-input border border-border rounded-none px-3 h-11 text-sm focus:outline-none focus:border-primary"
          />
          <input
            value={draft.password}
            onChange={(e) => setDraft({ ...draft, password: e.target.value })}
            placeholder="Password"
            className="bg-input border border-border rounded-none px-3 h-11 text-sm focus:outline-none focus:border-primary"
          />
          <select
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value as 'helper' | 'owner' })}
            className="bg-input border border-border rounded-none px-3 h-11 text-sm focus:outline-none focus:border-primary"
          >
            <option value="helper">Helper</option>
            <option value="owner">Owner (full access)</option>
          </select>
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button onClick={add} className="inline-flex items-center gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.18em] h-11 px-5">
            <Plus className="w-4 h-4" /> Add login
          </button>
          {okMsg && <span className="text-sm text-primary">{okMsg}</span>}
          {err && <span className="text-sm text-destructive">{err}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {admins.map((a) => (
          <div key={a.id} className={`flex items-center gap-3 border rounded-sm px-4 py-3 flex-wrap ${a.active ? 'border-border bg-card' : 'border-border/50 opacity-60'}`}>
            <span className="font-serif text-lg">{a.name}</span>
            <span className="text-[11px] uppercase tracking-[0.15em] text-primary border border-primary/30 px-2 py-0.5">{a.role}</span>
            {a.name === meName && <span className="text-xs text-muted-foreground">(you)</span>}
            <div className="ml-auto flex items-center gap-3">
              <button onClick={() => resetPw(a)} className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary">
                Reset password
              </button>
              <button onClick={() => del(a)} className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${a.name}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Shrink + compress a photo in the browser so uploads are small and fast.
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const max = 1400
  let { width, height } = bitmap
  if (width > max || height > max) {
    const scale = Math.min(max / width, max / height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process image')
  ctx.drawImage(bitmap, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', 0.85)
}
