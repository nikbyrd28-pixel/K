'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Loader2, Plus, Trash2, Eye, EyeOff, Check, LogOut, ImagePlus,
  RefreshCw, Package, Truck, CheckCircle2, BarChart3, AlertTriangle,
  Users, Star, ShoppingBag, Mail, Camera, ExternalLink, MessageSquare, Send, Phone, Printer,
} from 'lucide-react'
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
  status?: string
  tracking_number?: string
}

type DashUser = {
  name: string
  role: 'owner' | 'script_writer' | 'video_editor' | 'distributor' | 'analyst'
  email?: string
}

type RolePermissions = {
  name: string
  description: string
  canAccess: ('orders' | 'customers' | 'products' | 'studio' | 'scripts' | 'videos' | 'distribute' | 'rewards' | 'stats' | 'team')[]
}

const ROLE_PERMISSIONS: Record<DashUser['role'], RolePermissions> = {
  owner: {
    name: 'Owner',
    description: 'Full access to all features',
    canAccess: ['orders', 'customers', 'products', 'studio', 'scripts', 'videos', 'distribute', 'rewards', 'stats', 'team'],
  },
  script_writer: {
    name: 'Script Writer',
    description: 'Create and manage video scripts',
    canAccess: ['studio', 'scripts', 'products'],
  },
  video_editor: {
    name: 'Video Editor',
    description: 'Edit videos and manage uploads',
    canAccess: ['scripts', 'videos', 'products'],
  },
  distributor: {
    name: 'Distributor',
    description: 'Post videos to platforms and track analytics',
    canAccess: ['videos', 'distribute', 'stats'],
  },
  analyst: {
    name: 'Analyst',
    description: 'View analytics and reports only',
    canAccess: ['stats', 'orders'],
  },
}

export default function AdminPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [user, setUser] = useState<DashUser | null>(null)
  const [tab, setTab] = useState<'orders' | 'customers' | 'products' | 'rewards' | 'stats' | 'team' | 'studio' | 'scripts' | 'videos' | 'distribute'>('orders')
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

  useEffect(() => {
    if (!authed || !user) return
    const userRole = user.role || 'owner'
    const userPermissions = ROLE_PERMISSIONS[userRole]?.canAccess || []
    if (!userPermissions.includes(tab)) {
      const firstAllowedTab = userPermissions[0]
      if (firstAllowedTab) setTab(firstAllowedTab as typeof tab)
    }
  }, [authed, user])

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

  const userRole = user?.role || 'owner'
  const userPermissions = ROLE_PERMISSIONS[userRole]?.canAccess || []

  const tabsByRole: Record<DashUser['role'], { key: typeof tab; label: string; group?: string }[]> = {
    owner: [
      { key: 'orders', label: 'Orders', group: 'Business' },
      { key: 'customers', label: 'Customers', group: 'Business' },
      { key: 'products', label: 'Products', group: 'Business' },
      { key: 'rewards', label: 'Rewards', group: 'Business' },
      { key: 'stats', label: 'Analytics', group: 'Analytics' },
      { key: 'studio', label: 'Product Studio', group: 'Content Creation' },
      { key: 'scripts', label: 'Script Library', group: 'Content Creation' },
      { key: 'videos', label: 'Video Library', group: 'Content Creation' },
      { key: 'distribute', label: 'Distribution', group: 'Content Creation' },
      { key: 'team', label: 'Team Management', group: 'Settings' },
    ],
    script_writer: [
      { key: 'studio', label: 'Generate Scripts', group: 'Your Workspace' },
      { key: 'scripts', label: 'Your Scripts', group: 'Your Workspace' },
      { key: 'products', label: 'Products', group: 'Reference' },
    ],
    video_editor: [
      { key: 'scripts', label: 'Scripts to Edit', group: 'Your Workspace' },
      { key: 'videos', label: 'Your Videos', group: 'Your Workspace' },
      { key: 'products', label: 'Products', group: 'Reference' },
    ],
    distributor: [
      { key: 'videos', label: 'Ready Videos', group: 'Your Workspace' },
      { key: 'distribute', label: 'Post to Platforms', group: 'Your Workspace' },
      { key: 'stats', label: 'Performance', group: 'Analytics' },
    ],
    analyst: [
      { key: 'stats', label: 'Analytics', group: 'Your Workspace' },
      { key: 'orders', label: 'Orders', group: 'Reference' },
    ],
  }

  const tabs = tabsByRole[userRole] || []

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
        <div className="flex items-center gap-4">
          <a
            href="https://tbsol.net/crm/?client=hubsandbabydoll"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="w-3.5 h-3.5" /> TB CRM
          </a>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map(({ key, label, group }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={[
                'px-5 py-3 text-xs uppercase tracking-[0.2em] -mb-px border-b-2 transition-colors whitespace-nowrap',
                tab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                group === 'Your Workspace' && !tabs.find(t => t.group === 'Your Workspace' && t.key === tab) && 'font-medium',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
        {user && user.role !== 'owner' && (
          <div className="mt-2 px-5 py-2 text-xs text-muted-foreground bg-muted/30 rounded-sm">
            <span className="text-primary font-medium">{ROLE_PERMISSIONS[user.role]?.name}</span> — {ROLE_PERMISSIONS[user.role]?.description}
          </div>
        )}
      </div>

      {tab === 'orders' && <OrdersTab call={call} onUser={rememberUser} />}
      {tab === 'customers' && <CustomersTab call={call} />}
      {tab === 'products' && <ProductsTab call={call} />}
      {tab === 'studio' && <StudioTab call={call} />}
      {tab === 'scripts' && <ScriptsPortal call={call} userRole={user?.role} />}
      {tab === 'videos' && <VideosPortal call={call} userRole={user?.role} />}
      {tab === 'distribute' && <DistributePortal call={call} userRole={user?.role} />}
      {tab === 'rewards' && <RewardsTab call={call} />}
      {tab === 'stats' && <StatsTab call={call} />}
      {tab === 'team' && <TeamTab call={call} meName={user?.name} />}
    </section>
  )
}

// ---------------------------------------------------------------------------
//  STATS
// ---------------------------------------------------------------------------
type Stats = {
  totalOrders: number
  weekOrders: number
  todayOrders: number
  subscribers: number
  pendingOrders: number
  shippedOrders: number
  recentOrders: { id: number; created_at: string; name: string; service: string; status: string }[]
}

type AnalyticsData = {
  totalViews: number
  weekViews: number
  todayViews: number
  bounceRate: number
  topPages: { page: string; views: number }[]
  topReferrers: { referrer: string; visits: number }[]
}

function BounceGauge({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100)
  const color = pct < 40 ? 'text-emerald-400' : pct < 60 ? 'text-amber-400' : 'text-red-400'
  const bg = pct < 40 ? 'bg-emerald-400/15' : pct < 60 ? 'bg-amber-400/15' : 'bg-red-400/15'
  const tip =
    pct < 40
      ? 'Crushing it. Keep testing your call-to-action buttons to push even higher.'
      : pct < 60
      ? 'Good, but there\'s room to grow. Try adding a limited-time offer above the fold.'
      : 'High bounce rate — make sure there\'s a clear Shop button above the fold and the page loads fast on mobile.'
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 rounded-sm px-4 py-2.5 ${bg}`}>
          <span className={`text-3xl font-serif ${color}`}>{pct}%</span>
          <span className={`text-[11px] uppercase tracking-[0.12em] ${color}`}>bounce rate</span>
        </div>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${pct < 40 ? 'bg-emerald-400' : pct < 60 ? 'bg-amber-400' : 'bg-red-400'}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-3">
        <span className="font-medium text-foreground">Win every visit:</span> {tip}
      </p>
    </div>
  )
}

function StatsTab({ call }: { call: (a: string, e?: Record<string, unknown>) => Promise<any> }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const [statsData, analyticsData] = await Promise.all([
        call('stats'),
        call('analytics').catch(() => null),
      ])
      setStats(statsData)
      setAnalytics(analyticsData)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load stats.')
    } finally {
      setLoading(false)
    }
  }, [call])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  if (err) return <p className="text-sm text-destructive">{err}</p>

  const cards = [
    { label: 'Total orders', value: stats!.totalOrders, sub: 'all time' },
    { label: 'This week', value: stats!.weekOrders, sub: 'last 7 days' },
    { label: 'Today', value: stats!.todayOrders, sub: new Date().toLocaleDateString('en-US', { weekday: 'long' }) },
    { label: 'Email list', value: stats!.subscribers, sub: 'subscribers' },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-border rounded-sm bg-card p-5">
            <p className="text-3xl font-serif text-primary">{c.value}</p>
            <p className="text-xs uppercase tracking-[0.15em] mt-1">{c.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Fulfillment status */}
      <div className="border border-border rounded-sm bg-card p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Fulfillment status</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-2xl font-serif">{stats!.pendingOrders}</p>
              <p className="text-xs text-muted-foreground">Awaiting shipment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-serif">{stats!.shippedOrders}</p>
              <p className="text-xs text-muted-foreground">Shipped</p>
            </div>
          </div>
        </div>
      </div>

      {/* Website analytics */}
      {analytics && (
        <div className="border border-border rounded-sm bg-card p-5 flex flex-col gap-5">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Website visits</p>

          {/* Visit KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'All time', value: analytics.totalViews },
              { label: 'This week', value: analytics.weekViews },
              { label: 'Today', value: analytics.todayViews },
            ].map((c) => (
              <div key={c.label} className="flex flex-col">
                <p className="text-2xl font-serif text-foreground">{c.value.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Bounce rate gauge */}
          <BounceGauge rate={analytics.bounceRate} />

          {/* Top pages + referrers */}
          {(analytics.topPages.length > 0 || analytics.topReferrers.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-border">
              {analytics.topPages.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Top pages</p>
                  <div className="flex flex-col gap-1.5">
                    {analytics.topPages.map((p) => (
                      <div key={p.page} className="flex items-center justify-between gap-2">
                        <span className="text-xs truncate text-foreground">{p.page || '/'}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{p.views.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analytics.topReferrers.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Top sources</p>
                  <div className="flex flex-col gap-1.5">
                    {analytics.topReferrers.map((r) => (
                      <div key={r.referrer} className="flex items-center justify-between gap-2">
                        <span className="text-xs truncate text-foreground">{r.referrer || 'Direct'}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{r.visits.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent orders */}
      {stats!.recentOrders.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Recent orders</p>
          <div className="flex flex-col gap-2">
            {stats!.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-4 border border-border rounded-sm px-4 py-3 bg-card">
                <StatusBadge status={o.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground truncate">{o.service}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">
                  {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={load}
        className="self-start inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
      </button>
    </div>
  )
}


// ---------------------------------------------------------------------------
//  CUSTOMERS — CRM pipeline
// ---------------------------------------------------------------------------
type Customer = {
  name: string
  email: string
  phone: string
  orderCount: number
  lastOrder: string
  firstOrder: string
}
type Lead = { name: string; email: string; subscribedAt: string }

function customerStage(c: Customer): 'new' | 'loyal' | 'vip' {
  if (c.orderCount >= 5) return 'vip'
  if (c.orderCount >= 2) return 'loyal'
  return 'new'
}

const STAGE_LABELS = { new: 'New customer', loyal: 'Regular', vip: 'VIP' }
const STAGE_COLORS = {
  new: 'bg-blue-500/15 text-blue-400',
  loyal: 'bg-primary/15 text-primary',
  vip: 'bg-amber-500/15 text-amber-400',
}

function CustomersTab({ call }: { call: (a: string, e?: Record<string, unknown>) => Promise<any> }) {
  const [customers, setCustomers] = useState<Customer[] | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState<'all' | 'new' | 'loyal' | 'vip' | 'leads'>('all')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const data = await call('customers')
      setCustomers(data.customers || [])
      setLeads(data.leads || [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load customers.')
    } finally {
      setLoading(false)
    }
  }, [call])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  if (err) return <p className="text-sm text-destructive">{err}</p>

  const vips = customers!.filter((c) => customerStage(c) === 'vip')
  const loyal = customers!.filter((c) => customerStage(c) === 'loyal')
  const newC = customers!.filter((c) => customerStage(c) === 'new')

  const summaryCards = [
    { icon: <Users className="w-4 h-4" />, value: customers!.length, label: 'Customers' },
    { icon: <Star className="w-4 h-4" />, value: vips.length, label: 'VIPs (5+ orders)' },
    { icon: <ShoppingBag className="w-4 h-4" />, value: loyal.length, label: 'Regulars (2–4)' },
    { icon: <Mail className="w-4 h-4" />, value: leads.length, label: 'Email-only leads' },
  ]

  const filterTabs: { key: typeof filter; label: string; count: number }[] = [
    { key: 'all', label: 'All customers', count: customers!.length },
    { key: 'vip', label: 'VIPs', count: vips.length },
    { key: 'loyal', label: 'Regulars', count: loyal.length },
    { key: 'new', label: 'New', count: newC.length },
    { key: 'leads', label: 'Email leads', count: leads.length },
  ]

  const visible = filter === 'leads' ? [] : customers!.filter((c) => filter === 'all' || customerStage(c) === filter)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((c) => (
          <div key={c.label} className="border border-border rounded-sm bg-card p-4 flex items-center gap-3">
            <span className="text-primary">{c.icon}</span>
            <div>
              <p className="text-2xl font-serif leading-none">{c.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline stage tip */}
      <div className="flex items-start gap-3 border border-border/50 rounded-sm bg-card/50 px-4 py-3">
        <Star className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Pipeline stages</strong> are automatic — 1 order = New, 2–4 orders = Regular, 5+ = VIP.
          Email leads signed up but haven&apos;t ordered yet — perfect to convert with a welcome code.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {filterTabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={[
              'px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] -mb-px border-b-2 whitespace-nowrap transition-colors',
              filter === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {label} <span className="opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {/* Customer list */}
      {filter !== 'leads' && (
        <div className="flex flex-col gap-2">
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No customers in this stage yet.</p>
          )}
          {visible.map((c) => {
            const stage = customerStage(c)
            return (
              <div key={c.email} className="border border-border rounded-sm bg-card px-4 py-3 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif text-base">{c.name || 'Customer'}</span>
                    <span className={`text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full ${STAGE_COLORS[stage]}`}>
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {c.email}{c.phone ? ` · ${c.phone}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-primary font-medium">
                    {c.orderCount} order{c.orderCount === 1 ? '' : 's'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Last: {new Date(c.lastOrder).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Email leads */}
      {filter === 'leads' && (
        <div className="flex flex-col gap-2">
          {leads.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No email-only leads yet.</p>
          )}
          <p className="text-xs text-muted-foreground -mt-2 mb-1">
            These people signed up for your email list but haven&apos;t placed an order — send them a welcome discount to convert them.
          </p>
          {leads.map((l) => (
            <div key={l.email} className="border border-border rounded-sm bg-card px-4 py-3 flex items-center gap-4 flex-wrap">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{l.name || l.email}</p>
                {l.name && <p className="text-xs text-muted-foreground truncate">{l.email}</p>}
              </div>
              <p className="text-[11px] text-muted-foreground shrink-0">
                Joined {new Date(l.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}

      <button onClick={load} className="self-start inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary">
        <RefreshCw className="w-3.5 h-3.5" /> Refresh
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
//  BARCODE SCANNER HELPER
// ---------------------------------------------------------------------------
async function scanBarcode(file: File): Promise<string | null> {
  if (!('BarcodeDetector' in window)) return null
  try {
    const bitmap = await createImageBitmap(file)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (window as any).BarcodeDetector({ formats: ['code_128', 'code_39', 'code_93', 'qr_code'] })
    const results: { rawValue: string }[] = await detector.detect(bitmap)
    return results[0]?.rawValue ?? null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
//  SHIPPING BOX ESTIMATOR
// ---------------------------------------------------------------------------
const FLAT_RATES = [
  { name: 'Small flat rate box', price: 10.40 },
  { name: 'Medium flat rate box', price: 17.10 },
  { name: 'Large flat rate box', price: 23.75 },
]

function estPriorityMail(lbs: number): number {
  if (lbs <= 1) return 8.70
  if (lbs <= 2) return 10.20
  if (lbs <= 3) return 12.30
  if (lbs <= 5) return 15.40
  if (lbs <= 10) return 22.00
  return 30.00
}

function ShippingEstimator() {
  const [weight, setWeight] = useState('')
  const w = parseFloat(weight)
  const hasW = !isNaN(w) && w > 0
  const pmEst = hasW ? estPriorityMail(w) : null

  return (
    <details className="border border-border rounded-sm bg-card">
      <summary className="cursor-pointer px-5 py-4 flex items-center gap-2 select-none list-none">
        <Package className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">Shipping box estimator</span>
      </summary>
      <div className="px-5 pb-5 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground mb-4">
          USPS flat rate boxes vs. weight-based Priority Mail — enter your package weight to compare.
        </p>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight in lbs"
            className="w-36 bg-input border border-border rounded-none px-3 h-9 text-sm focus:outline-none focus:border-primary"
          />
          <span className="text-sm text-muted-foreground">lbs</span>
        </div>
        <div className="flex flex-col gap-2">
          {pmEst !== null && (
            <div className="flex items-center justify-between border border-border rounded-sm px-4 py-2.5 bg-muted/30">
              <span className="text-sm">Priority Mail (~{w} lb, zone 1–2)</span>
              <span className="text-sm font-medium">${pmEst.toFixed(2)}</span>
            </div>
          )}
          {FLAT_RATES.map((b) => {
            const isBetter = pmEst !== null && b.price <= pmEst
            return (
              <div
                key={b.name}
                className={`flex items-center justify-between rounded-sm px-4 py-2.5 border ${isBetter ? 'border-primary/40 bg-primary/5' : 'border-border'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{b.name}</span>
                  {isBetter && (
                    <span className="text-[10px] uppercase tracking-[0.1em] text-primary">Better deal</span>
                  )}
                </div>
                <span className="text-sm font-medium">${b.price.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Flat rate = same price up to 70 lbs regardless of distance. Weight estimate is approximate (zone 1–2); actual rates vary by destination.
        </p>
      </div>
    </details>
  )
}

// ---------------------------------------------------------------------------
//  ORDERS
// ---------------------------------------------------------------------------
function OrdersTab({ call, onUser }: { call: (a: string, e?: Record<string, unknown>) => Promise<any>; onUser?: (u: DashUser | null) => void }) {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [subscribers, setSubscribers] = useState<Order[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [printingLabel, setPrintingLabel] = useState<Order | null>(null)

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

  useEffect(() => { load() }, [load])

  const updateOrder = (id: string | number | undefined, patch: Partial<Order>) => {
    setOrders((prev) => prev!.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  const saveShipping = async (o: Order) => {
    try {
      await call('order_update', { id: o.id, status: o.status || '', tracking_number: o.tracking_number || '' })
      alert('✓ Shipping info saved')
    } catch (e) {
      alert('❌ Failed to save: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
  }

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
      <ShippingEstimator />
      <div className="mt-2" />
      {orders && orders.length === 0 && (
        <div className="border border-border rounded-sm p-10 text-center text-muted-foreground">
          No orders yet — they'll appear here the moment someone checks out.
        </div>
      )}
      <div className="flex flex-col gap-4">
        {orders?.map((o, i) => (
          <div key={o.id ?? i} className="border border-border rounded-sm p-5 bg-card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-serif text-xl">{o.name || 'Customer'}</p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-xs text-muted-foreground">
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
            {/* Shipping controls */}
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Status</label>
                <select
                  value={o.status || ''}
                  onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                  className="bg-input border border-border rounded-none px-3 h-9 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Pending</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="pickup_ready">Ready for pickup</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                <label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Tracking number</label>
                <div className="flex gap-1">
                  <input
                    value={o.tracking_number || ''}
                    onChange={(e) => updateOrder(o.id, { tracking_number: e.target.value })}
                    placeholder="e.g. 9400111899223851234567"
                    className="flex-1 bg-input border border-border rounded-none px-3 h-9 text-sm focus:outline-none focus:border-primary"
                  />
                  <label
                    className="flex items-center justify-center w-9 h-9 border border-border bg-input hover:border-primary cursor-pointer shrink-0"
                    title="Scan barcode from shipping label photo"
                  >
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const code = await scanBarcode(file)
                        if (code) {
                          updateOrder(o.id, { tracking_number: code })
                        } else {
                          alert('No barcode found — try again in better lighting, or type the number.')
                        }
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
              </div>
              <button
                onClick={() => saveShipping(o)}
                className="inline-flex items-center gap-1.5 rounded-none bg-primary/15 text-primary hover:bg-primary/25 text-[11px] uppercase tracking-[0.15em] h-9 px-4"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button
                onClick={() => setPrintingLabel(o)}
                className="inline-flex items-center gap-1.5 rounded-none bg-muted text-muted-foreground hover:bg-muted/80 text-[11px] uppercase tracking-[0.15em] h-9 px-4"
              >
                <Printer className="w-3.5 h-3.5" /> Print Label
              </button>
            </div>
          </div>
        ))}
      </div>
      {printingLabel && <ShippingLabelModal order={printingLabel} onClose={() => setPrintingLabel(null)} />}
    </div>
  )
}

function ShippingLabelModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [address, setAddress] = useState('')
  const [tracking, setTracking] = useState(order.tracking_number || '')
  const [senderEmail, setSenderEmail] = useState(() => {
    if (typeof window === 'undefined') return 'contact@hubsandbabydoll.com'
    return localStorage.getItem('hb_sender_email') || 'contact@hubsandbabydoll.com'
  })
  const [senderName, setSenderName] = useState('Hubs & Babydoll')
  const labelRef = useRef<HTMLDivElement>(null)

  const getQRCodeUrl = () => {
    const qrData = tracking || `Order-${order.id}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`
  }

  const handlePrint = () => {
    if (!labelRef.current) return

    // Save sender email preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('hb_sender_email', senderEmail)
    }

    const qrUrl = getQRCodeUrl()
    const printContent = labelRef.current.innerHTML
    const originalContent = document.body.innerHTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Shipping Label - Order ${order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: 4in 6in; margin: 0; }
            body { font-family: Arial, sans-serif; padding: 0.25in; background: white; }
            .shipping-label { width: 100%; height: 100%; border: 1px solid #000; padding: 0.2in; }
            .header { font-weight: bold; font-size: 14px; margin-bottom: 0.15in; border-bottom: 2px solid #000; text-align: center; }
            .from-to { display: grid; grid-template-columns: 1fr 1fr; gap: 0.2in; margin-bottom: 0.2in; }
            .section { font-size: 10px; }
            .section-title { font-weight: bold; font-size: 9px; margin-bottom: 0.05in; }
            .address-box { border: 2px solid #000; padding: 0.1in; min-height: 1.2in; font-size: 11px; line-height: 1.3; }
            .qr-section { text-align: center; margin-bottom: 0.15in; }
            .qr-section img { max-width: 1in; height: auto; }
            .barcode-area { text-align: center; border: 3px solid #000; padding: 0.2in; min-height: 0.8in; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; word-break: break-all; background-color: #fff; }
            .order-info { font-size: 8px; margin-top: 0.1in; text-align: center; }
          </style>
        </head>
        <body>
          <div class="shipping-label">
            <div class="header">SHIPPING LABEL</div>
            <div class="from-to">
              <div class="section">
                <div class="section-title">FROM:</div>
                <div class="address-box">
                  <strong>${senderName}</strong><br/>
                  ${senderEmail}
                </div>
              </div>
              <div class="section">
                <div class="section-title">TO:</div>
                <div class="address-box">
                  <strong>${order.name || 'Customer'}</strong><br/>
                  ${address || '(Address to be filled)'}
                  ${order.phone ? '<br/>' + order.phone : ''}
                </div>
              </div>
            </div>
            <div class="qr-section">
              <img src="${qrUrl}" alt="QR Code" />
            </div>
            <div class="barcode-area">
              ${tracking || 'No tracking #'}
            </div>
            <div class="order-info">
              Order #${order.id}
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(printHTML)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
        setTimeout(() => printWindow.close(), 500)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-sm p-6 max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-serif mb-4">Print Shipping Label</h2>

        <div className="mb-4 flex flex-col gap-3">
          <div className="p-3 bg-muted/30 border border-border rounded-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-primary font-medium mb-3">From (Return Address)</p>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Company Name"
                className="w-full bg-input border border-border rounded-none p-2 text-xs focus:outline-none focus:border-primary font-sans"
              />
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="sender@email.com"
                className="w-full bg-input border border-border rounded-none p-2 text-xs focus:outline-none focus:border-primary font-sans"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Tracking Number</label>
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. 9400111899223851234567"
              className="w-full bg-input border border-border rounded-none p-3 text-sm focus:outline-none focus:border-primary font-sans"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Shipping Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State 12345"
              className="w-full bg-input border border-border rounded-none p-3 text-sm focus:outline-none focus:border-primary h-20 resize-none font-sans"
            />
          </div>
        </div>

        {/* Label Preview */}
        <div className="mb-6 border-2 border-dashed border-primary p-2 rounded-none" ref={labelRef}>
          <div style={{ width: '100%', maxWidth: '480px', border: '2px solid #000', padding: '12px', fontFamily: 'Arial, sans-serif', fontSize: '13px', lineHeight: '1.5', backgroundColor: '#fff', color: '#000' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '3px solid #000', textAlign: 'center', color: '#000' }}>SHIPPING LABEL</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', color: '#000' }}>FROM:</div>
                <div style={{ border: '2px solid #000', padding: '10px', minHeight: '100px', fontSize: '12px', color: '#000', wordWrap: 'break-word' }}>
                  <strong style={{ color: '#000' }}>{senderName}</strong><br/>
                  <span style={{ color: '#000' }}>{senderEmail}</span>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', color: '#000' }}>TO:</div>
                <div style={{ border: '2px solid #000', padding: '10px', minHeight: '100px', fontSize: '12px', color: '#000', wordWrap: 'break-word' }}>
                  <strong style={{ color: '#000' }}>{order.name || 'Customer'}</strong><br/>
                  <span style={{ color: '#000' }}>{address || '(Address to be filled)'}</span>
                  {order.phone && <><br/><span style={{ color: '#000' }}>{order.phone}</span></>}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <img
                src={getQRCodeUrl()}
                alt="QR Code"
                style={{ width: '100px', height: '100px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>

            <div style={{ textAlign: 'center', border: '3px solid #000', padding: '12px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', color: '#000', marginBottom: '10px', wordBreak: 'break-all', backgroundColor: '#fff' }}>
              {tracking || 'NO TRACKING #'}
            </div>

            <div style={{ fontSize: '10px', textAlign: 'center', color: '#000' }}>
              <strong>Order #{order.id}</strong>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.15em] h-9"
          >
            <Printer className="w-4 h-4" /> Print to Printer
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-none bg-muted text-muted-foreground hover:bg-muted/80 text-xs uppercase tracking-[0.15em] h-9"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const s = status || ''
  if (s === 'shipped') return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] bg-primary/15 text-primary px-2 py-0.5 rounded-full">
      <Truck className="w-3 h-3" /> Shipped
    </span>
  )
  if (s === 'delivered') return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full">
      <CheckCircle2 className="w-3 h-3" /> Delivered
    </span>
  )
  if (s === 'packed') return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-full">
      <Package className="w-3 h-3" /> Packed
    </span>
  )
  if (s === 'pickup_ready') return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] bg-blue-500/15 text-blue-500 px-2 py-0.5 rounded-full">
      <Package className="w-3 h-3" /> Ready
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
      Pending
    </span>
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

  useEffect(() => { load() }, [load])

  const flash = (m: string) => { setOkMsg(m); setTimeout(() => setOkMsg(null), 2500) }

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
    const it = { ...items![idx], active: !items![idx].active }
    try {
      await call('save', {
        product: { handle: it.handle || it.name, name: it.name, description: it.description, image: it.image, sizes: it.sizes, sort: it.sort, active: it.active },
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
      { handle: '', name: '', description: '', image: '', imageAlt: '', sizes: [{ size: 'One size', price: 0 }], active: true, sort: (prev?.length ?? 0) + 100, _new: true },
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
      if (it.name.trim() && !it._new) {
        await call('save', { product: { handle: it.handle, name: it.name, description: it.description, image: data.url, sizes: it.sizes, sort: it.sort, active: it.active } })
        flash('Photo updated ✓')
      } else {
        flash('Photo ready — click Save')
      }
    } catch (e) {
      update(idx, { _saving: false })
      setErr(e instanceof Error ? e.message : 'Could not upload the photo.')
    }
  }

  // Low-stock items
  const lowStockCount = items?.reduce((n, it) => {
    return n + it.sizes.filter((s) => s.stock !== undefined && s.stock < 5 && !s.soldOut).length
  }, 0) ?? 0

  if (!items) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={addProduct}
            className="inline-flex items-center gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-11 px-5"
          >
            <Plus className="w-4 h-4" /> Add product
          </button>
          {lowStockCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 border border-amber-500/30 px-3 h-11 bg-amber-500/5">
              <AlertTriangle className="w-3.5 h-3.5" /> {lowStockCount} size{lowStockCount === 1 ? '' : 's'} low on stock
            </span>
          )}
        </div>
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
                <input
                  value={it.shipping_timeframe || ''}
                  onChange={(e) => update(idx, { shipping_timeframe: e.target.value || undefined })}
                  placeholder="Shipping timeframe (e.g., 2-3 business days)"
                  className="bg-input border border-border rounded-none px-3 h-10 text-sm text-foreground focus:outline-none focus:border-primary"
                />

                {/* Sizes + prices + stock */}
                <div className="flex flex-col gap-2">
                  <div className="hidden sm:grid grid-cols-[1fr_80px_80px_90px_auto] gap-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground px-1">
                    <span>Size</span><span>Price</span><span>Stock</span><span></span><span></span>
                  </div>
                  {it.sizes.map((s, sIdx) => {
                    const lowStock = s.stock !== undefined && s.stock < 5 && !s.soldOut
                    return (
                      <div key={sIdx} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_90px_auto] gap-2 items-center">
                        <input
                          value={s.size}
                          onChange={(e) => updateSize(idx, sIdx, { size: e.target.value })}
                          placeholder="Size / name"
                          className="bg-input border border-border rounded-none px-3 h-10 text-sm focus:outline-none focus:border-primary"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={s.price}
                            onChange={(e) => updateSize(idx, sIdx, { price: parseFloat(e.target.value) || 0 })}
                            className="bg-input border border-border rounded-none px-2 h-10 text-sm w-full focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={s.stock ?? ''}
                            onChange={(e) => updateSize(idx, sIdx, { stock: e.target.value === '' ? undefined : parseInt(e.target.value) || 0 })}
                            placeholder="—"
                            title="Units in stock"
                            className={`bg-input border rounded-none px-2 h-10 text-sm w-full focus:outline-none focus:border-primary ${lowStock ? 'border-amber-500/60' : 'border-border'}`}
                          />
                          {lowStock && (
                            <AlertTriangle className="w-3 h-3 text-amber-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          )}
                        </div>
                        <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={!!s.soldOut}
                            onChange={(e) => updateSize(idx, sIdx, { soldOut: e.target.checked })}
                          />
                          Sold out
                        </label>
                        {it.sizes.length > 1 ? (
                          <button onClick={() => removeSize(idx, sIdx)} className="text-muted-foreground hover:text-destructive" aria-label="Remove size">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span />
                        )}
                      </div>
                    )
                  })}
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

// ---------------------------------------------------------------------------
//  STUDIO (Product Photography & AI Description)
// ---------------------------------------------------------------------------
function StudioTab({ call }: { call: (a: string, e?: Record<string, unknown>) => Promise<any> }) {
  const [items, setItems] = useState<EditItem[] | null>(null)
  const [selectedItem, setSelectedItem] = useState<EditItem | null>(null)
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [contentType, setContentType] = useState<'description' | 'social' | 'email' | 'video'>('description')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/hb_products?select=*`, {
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      })
      const rows: ProductRow[] = res.ok ? await res.json() : []
      const safe = Array.isArray(rows) ? rows : []
      setItems(mergeCatalog(safe))
    } catch {
      setItems(mergeCatalog([]))
    }
  }, [])

  useEffect(() => { load() }, [load])

  const brandVoicePrompt = `You are a luxury body care brand copywriter. Your voice is: warm, intimate, poetic, and genuinely caring. Never use corporate speak or hard sell tactics. Focus on how the product makes people FEEL, not just features. Use sensory language (feel, glow, nourish, warmth). Target audience: people who give everything to others and deserve care too.`

  const generateContent = async (item: EditItem, type: 'description' | 'social' | 'email' | 'video') => {
    setGenerating(true)
    setMsg(null)
    try {
      let prompt = brandVoicePrompt + '\n\n'

      if (type === 'description') {
        prompt += `Write a compelling 2-3 sentence product description for "${item.name}". Focus on benefits and sensory appeal. Keep under 100 words. Emphasize that this product is "made to be felt" and handcrafted in small batches.`
      } else if (type === 'social') {
        prompt += `Write a captivating Instagram caption for "${item.name}" (max 150 chars). Use sensory language. No hashtags. Start with an emotional hook about self-care.`
      } else if (type === 'email') {
        prompt += `Write a short, warm email subject line and 2-sentence preview for promoting "${item.name}". Focus on the gift-giving angle and self-care message. Keep it under 50 words total.`
      } else if (type === 'video') {
        prompt += `Write a 15-30 second TikTok/Reels video script for "${item.name}". Use the "This is for..." format: start with "This is for the person who..." then introduce the product benefits. Include voiceover text and one visual direction. Focus on emotional connection and sensory appeal. Make it hook viewers immediately.`
      }

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt,
          stream: false,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        setMsg('Ollama connection failed. Make sure it\'s running at localhost:11434')
        return
      }

      const data = await res.json()
      const generated = data.response?.trim() || ''

      if (!generated) {
        setMsg('No content generated. Try again.')
        return
      }

      if (type === 'description') {
        await call('product_update', {
          handle: item.handle,
          description: generated,
        })
        setMsg('✓ Description updated')
      } else if (type === 'social') {
        setMsg(`Generated: "${generated}"`)
      } else if (type === 'email') {
        setMsg(`Generated: "${generated}"`)
      } else if (type === 'video') {
        setMsg(`Video Script:\n\n${generated}`)
      }

      load()
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 bg-muted/30 border border-border rounded-sm">
        <h3 className="font-serif text-lg mb-2">Marketing Studio</h3>
        <p className="text-sm text-muted-foreground">Generate marketing copy using Ollama AI with the Hubs & Babydoll brand voice. Requires Ollama running at localhost:11434.</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-sm text-sm whitespace-pre-wrap font-mono ${msg.startsWith('✓') ? 'bg-primary/15 text-primary' : msg.includes('Generated') || msg.includes('Video') ? 'bg-blue-500/15 text-blue-700' : 'bg-amber-500/15 text-amber-700'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h4 className="text-sm font-medium mb-3 uppercase tracking-[0.1em]">Products</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items?.map((item, i) => (
              <button
                key={item.handle ?? i}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left text-xs p-2 border rounded-sm transition ${selectedItem?.handle === item.handle ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          {!items && <p className="text-xs text-muted-foreground">Loading...</p>}
          {items && items.length === 0 && <p className="text-xs text-muted-foreground">No products.</p>}
        </div>

        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-card border border-border rounded-sm">
                {selectedItem.image && (
                  <div className="w-24 h-24 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                    <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-serif text-lg mb-1">{selectedItem.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedItem.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.1em] font-medium">Generate:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['description', 'social', 'email', 'video'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setContentType(t)
                        generateContent(selectedItem, t)
                      }}
                      disabled={generating}
                      className={`text-xs py-2 px-3 rounded-none border transition uppercase tracking-[0.12em] ${contentType === t ? 'border-primary bg-primary/15 text-primary' : 'border-border hover:border-primary/50'} disabled:opacity-50`}
                    >
                      {generating && contentType === t ? (
                        <span className="flex items-center justify-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Generating
                        </span>
                      ) : (
                        <span>{t === 'description' ? 'Product Copy' : t === 'social' ? 'Social Post' : t === 'email' ? 'Email' : 'Video Script'}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted/20 rounded-sm border border-border">
              <p className="text-muted-foreground text-sm">Select a product to generate content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
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

  useEffect(() => { load() }, [load])

  const flash = (m: string) => { setOkMsg(m); setTimeout(() => setOkMsg(null), 2500) }

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
      await call('discount_save', { discount: { code: c.code, kind: c.kind, value: c.value, max_uses: c.max_uses, min_subtotal: c.min_subtotal, note: c.note, active: !c.active } })
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

      <div>
        <p className="text-sm text-muted-foreground mb-3">{regular.length} reward code{regular.length === 1 ? '' : 's'}</p>
        <div className="flex flex-col gap-2">
          {regular.map((c) => (
            <CodeRow key={c.code} c={c} onToggle={() => toggle(c)} onDelete={() => del(c)} />
          ))}
        </div>
      </div>

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
  const [draft, setDraft] = useState({ name: '', password: '', role: 'script_writer' as DashUser['role'] })

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
      setDraft({ name: '', password: '', role: 'script_writer' })
      flash('Team member added ✓')
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not add team member.')
    }
  }

  const updateRole = async (a: Admin, newRole: DashUser['role']) => {
    try {
      await call('admin_save', { admin: { id: a.id, name: a.name, role: newRole, password: a.password } })
      flash(`Role updated for ${a.name}`)
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not update role.')
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
      <div className="p-4 bg-muted/30 border border-border rounded-sm">
        <h3 className="font-serif text-lg mb-2">Team Management</h3>
        <p className="text-sm text-muted-foreground">Each team member gets their own role and can only access the features they need.</p>
      </div>

      <div className="border border-border rounded-sm p-5 bg-card">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Add team member</p>
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
            placeholder="Password (min 4 chars)"
            type="password"
            className="bg-input border border-border rounded-none px-3 h-11 text-sm focus:outline-none focus:border-primary"
          />
          <select
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value as DashUser['role'] })}
            className="bg-input border border-border rounded-none px-3 h-11 text-sm focus:outline-none focus:border-primary"
          >
            {Object.entries(ROLE_PERMISSIONS).filter(([k]) => k !== 'owner').map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button onClick={add} className="inline-flex items-center gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.18em] h-11 px-5">
            <Plus className="w-4 h-4" /> Add member
          </button>
          {okMsg && <span className="text-sm text-primary">{okMsg}</span>}
          {err && <span className="text-sm text-destructive">{err}</span>}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-serif text-base">Team members</h4>
        {admins.map((a) => {
          const rolePerm = ROLE_PERMISSIONS[a.role as DashUser['role']]
          return (
            <div key={a.id} className={`border rounded-sm p-4 ${a.active ? 'border-border bg-card' : 'border-border/50 opacity-60'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif text-lg">{a.name}</span>
                    {a.name === meName && <span className="text-xs text-primary">(you)</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{rolePerm?.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={a.role || 'script_writer'}
                    onChange={(e) => updateRole(a, e.target.value as DashUser['role'])}
                    disabled={a.name === meName}
                    className="text-xs bg-input border border-border rounded-none px-2 py-1 focus:outline-none focus:border-primary disabled:opacity-50"
                  >
                    {Object.entries(ROLE_PERMISSIONS).filter(([k]) => k !== 'owner').map(([key, val]) => (
                      <option key={key} value={key}>{val.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3 p-2 bg-muted/20 rounded-sm">
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-2">Can access:</p>
                <div className="flex flex-wrap gap-1">
                  {rolePerm?.canAccess.map(tab => (
                    <span key={tab} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-none">{tab}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => resetPw(a)}
                  disabled={a.name === meName}
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary disabled:opacity-50"
                >
                  Reset password
                </button>
                <button
                  onClick={() => del(a)}
                  disabled={a.name === meName}
                  className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                  aria-label={`Remove ${a.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
        <p className="text-xs uppercase tracking-[0.1em] text-primary font-medium mb-3">Role reference</p>
        <div className="space-y-2">
          {Object.entries(ROLE_PERMISSIONS).map(([key, role]) => (
            <div key={key} className="text-xs">
              <span className="font-medium text-foreground">{role.name}:</span>
              <span className="text-muted-foreground ml-2">{role.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScriptsPortal({ call, userRole }: { call: (a: string, e?: Record<string, unknown>) => Promise<any>; userRole?: DashUser['role'] }) {
  const [scripts, setScripts] = useState<any[]>([])
  const [newScript, setNewScript] = useState({ title: '', product: '', content: '', status: 'draft' })
  const [msg, setMsg] = useState<string | null>(null)
  const isScriptWriter = userRole === 'script_writer'
  const isVideoEditor = userRole === 'video_editor'

  useEffect(() => {
    const saved = localStorage.getItem('hb_scripts')
    if (saved) setScripts(JSON.parse(saved))
  }, [])

  const save = async () => {
    if (!newScript.title.trim() || !newScript.content.trim()) {
      setMsg('Title and content required')
      return
    }
    const updated = [...scripts, { ...newScript, id: Date.now(), created: new Date().toISOString() }]
    setScripts(updated)
    localStorage.setItem('hb_scripts', JSON.stringify(updated))
    setMsg('✓ Script saved and ready for video editor')
    setNewScript({ title: '', product: '', content: '', status: 'draft' })
    setTimeout(() => setMsg(null), 3000)
  }

  const updateStatus = (id: number, status: string) => {
    const updated = scripts.map(s => s.id === id ? { ...s, status } : s)
    setScripts(updated)
    localStorage.setItem('hb_scripts', JSON.stringify(updated))
  }

  const deleteScript = (id: number) => {
    const updated = scripts.filter(s => s.id !== id)
    setScripts(updated)
    localStorage.setItem('hb_scripts', JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 border border-border rounded-sm">
        <h3 className="font-serif text-lg mb-2">
          {isScriptWriter ? '📝 Your Scripts' : isVideoEditor ? '📖 Scripts to Edit' : 'Scripts Library'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isScriptWriter
            ? 'Create video scripts using the Studio tab. Mark them "Ready" when the video editor should start working.'
            : isVideoEditor
            ? 'View scripts approved for video creation. Download scripts and mark progress as you work.'
            : 'All scripts across the team. Track status and manage workflow.'}
        </p>
      </div>

      {msg && <div className={`p-3 rounded-sm text-sm ${msg.startsWith('✓') ? 'bg-primary/15 text-primary' : 'bg-amber-500/15 text-amber-700'}`}>{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-border rounded-sm p-4 bg-card h-fit">
          <h4 className="font-serif text-base mb-4">New Script</h4>
          <div className="space-y-3">
            <input type="text" placeholder="Script Title" value={newScript.title} onChange={(e) => setNewScript({ ...newScript, title: e.target.value })} className="w-full bg-input border border-border rounded-none px-3 h-10 text-sm focus:outline-none focus:border-primary" />
            <input type="text" placeholder="Product (optional)" value={newScript.product} onChange={(e) => setNewScript({ ...newScript, product: e.target.value })} className="w-full bg-input border border-border rounded-none px-3 h-10 text-sm focus:outline-none focus:border-primary" />
            <textarea placeholder="Script content..." value={newScript.content} onChange={(e) => setNewScript({ ...newScript, content: e.target.value })} rows={6} className="w-full bg-input border border-border rounded-none px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
            <button onClick={save} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.12em] py-2 rounded-none hover:bg-primary/90">Save Script</button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="font-serif text-base mb-4">Scripts Library</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scripts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scripts yet. Create one to get started.</p>
            ) : (
              scripts.map(s => (
                <div key={s.id} className="border border-border rounded-sm p-3 bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-serif text-sm mb-1">{s.title}</h5>
                      {s.product && <p className="text-xs text-muted-foreground mb-2">Product: {s.product}</p>}
                    </div>
                    <select value={s.status} onChange={(e) => updateStatus(s.id, e.target.value)} className="text-xs bg-input border border-border rounded-none px-2 py-1 focus:outline-none focus:border-primary">
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="ready">Ready</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{s.content}</p>
                  <button onClick={() => deleteScript(s.id)} className="text-xs text-destructive hover:text-destructive/70">Remove</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function VideosPortal({ call, userRole }: { call: (a: string, e?: Record<string, unknown>) => Promise<any>; userRole?: DashUser['role'] }) {
  const [videos, setVideos] = useState<any[]>([])
  const [upload, setUpload] = useState({ title: '', script_id: '', file: null as File | null, status: 'draft' })
  const [msg, setMsg] = useState<string | null>(null)
  const isVideoEditor = userRole === 'video_editor'
  const isDistributor = userRole === 'distributor'

  useEffect(() => {
    const saved = localStorage.getItem('hb_videos')
    if (saved) setVideos(JSON.parse(saved))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpload({ ...upload, file: e.target.files?.[0] || null })
  }

  const saveVideo = async () => {
    if (!upload.title.trim() || !upload.file) {
      setMsg('Title and video file required')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const updated = [...videos, {
        ...upload,
        id: Date.now(),
        created: new Date().toISOString(),
        fileSize: upload.file?.size,
        fileName: upload.file?.name,
      }]
      setVideos(updated)
      localStorage.setItem('hb_videos', JSON.stringify(updated))
      setMsg('✓ Video uploaded and ready to distribute!')
      setUpload({ title: '', script_id: '', file: null, status: 'draft' })
      setTimeout(() => setMsg(null), 3000)
    }
    reader.readAsDataURL(upload.file)
  }

  const updateStatus = (id: number, status: string) => {
    const updated = videos.map(v => v.id === id ? { ...v, status } : v)
    setVideos(updated)
    localStorage.setItem('hb_videos', JSON.stringify(updated))
  }

  const deleteVideo = (id: number) => {
    const updated = videos.filter(v => v.id !== id)
    setVideos(updated)
    localStorage.setItem('hb_videos', JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 border border-border rounded-sm">
        <h3 className="font-serif text-lg mb-2">
          {isVideoEditor ? '🎬 Your Video Uploads' : isDistributor ? '✅ Ready to Post' : '📹 Video Library'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isVideoEditor
            ? 'Upload finished videos here for distribution. Statuses: Draft → Reviewing → Ready → Posted'
            : isDistributor
            ? 'Videos ready to post. Select which platforms to post to in the Distribution tab.'
            : 'All videos uploaded by the team. Track status and distribution progress.'}
        </p>
      </div>

      {msg && <div className={`p-3 rounded-sm text-sm ${msg.startsWith('✓') ? 'bg-primary/15 text-primary' : 'bg-amber-500/15 text-amber-700'}`}>{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-border rounded-sm p-4 bg-card h-fit">
          <h4 className="font-serif text-base mb-4">Upload Video</h4>
          <div className="space-y-3">
            <input type="text" placeholder="Video Title" value={upload.title} onChange={(e) => setUpload({ ...upload, title: e.target.value })} className="w-full bg-input border border-border rounded-none px-3 h-10 text-sm focus:outline-none focus:border-primary" />
            <div className="border-2 border-dashed border-border rounded-sm p-4 text-center cursor-pointer hover:border-primary transition">
              <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" id="videoInput" />
              <label htmlFor="videoInput" className="cursor-pointer block">
                {upload.file ? (
                  <span className="text-xs text-primary">{upload.file.name}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Click to upload video</span>
                )}
              </label>
            </div>
            <input type="text" placeholder="Script ID (optional)" value={upload.script_id} onChange={(e) => setUpload({ ...upload, script_id: e.target.value })} className="w-full bg-input border border-border rounded-none px-3 h-10 text-sm focus:outline-none focus:border-primary" />
            <button onClick={saveVideo} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.12em] py-2 rounded-none hover:bg-primary/90">Upload Video</button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="font-serif text-base mb-4">Videos Library</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {videos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No videos uploaded yet.</p>
            ) : (
              videos.map(v => (
                <div key={v.id} className="border border-border rounded-sm p-3 bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-serif text-sm mb-1">{v.title}</h5>
                      <p className="text-xs text-muted-foreground">{v.fileName} · {Math.round(v.fileSize / 1024 / 1024 * 100) / 100}MB</p>
                    </div>
                    <select value={v.status} onChange={(e) => updateStatus(v.id, e.target.value)} className="text-xs bg-input border border-border rounded-none px-2 py-1 focus:outline-none focus:border-primary">
                      <option value="draft">Draft</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="ready">Ready</option>
                      <option value="posted">Posted</option>
                    </select>
                  </div>
                  <button onClick={() => deleteVideo(v.id)} className="text-xs text-destructive hover:text-destructive/70">Remove</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DistributePortal({ call, userRole }: { call: (a: string, e?: Record<string, unknown>) => Promise<any>; userRole?: DashUser['role'] }) {
  const [distributions, setDistributions] = useState<any[]>([])
  const [newDistro, setNewDistro] = useState({ video_id: '', platforms: [] as string[], links: { tiktok: '', instagram: '', youtube: '' } })
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('hb_distributions')
    if (saved) setDistributions(JSON.parse(saved))
  }, [])

  const platforms = ['TikTok', 'Instagram', 'YouTube', 'Twitter', 'Threads']

  const save = () => {
    if (!newDistro.video_id.trim()) {
      setMsg('Video ID required')
      return
    }
    const updated = [...distributions, { ...newDistro, id: Date.now(), posted: new Date().toISOString() }]
    setDistributions(updated)
    localStorage.setItem('hb_distributions', JSON.stringify(updated))
    setMsg('✓ Distribution logged')
    setNewDistro({ video_id: '', platforms: [], links: { tiktok: '', instagram: '', youtube: '' } })
    setTimeout(() => setMsg(null), 3000)
  }

  const togglePlatform = (platform: string) => {
    setNewDistro({
      ...newDistro,
      platforms: newDistro.platforms.includes(platform)
        ? newDistro.platforms.filter(p => p !== platform)
        : [...newDistro.platforms, platform]
    })
  }

  const isDistributor = userRole === 'distributor'
  const title = isDistributor ? '🚀 Post to Platforms' : 'Distribution & Analytics'
  const desc = isDistributor
    ? 'Select videos ready to distribute and post to your assigned platforms'
    : 'Track which videos went to which platforms. Store post links for performance monitoring.'

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 border border-border rounded-sm">
        <h3 className="font-serif text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>

      {msg && <div className={`p-3 rounded-sm text-sm ${msg.startsWith('✓') ? 'bg-primary/15 text-primary' : 'bg-amber-500/15 text-amber-700'}`}>{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-border rounded-sm p-4 bg-card h-fit">
          <h4 className="font-serif text-base mb-4">Log Distribution</h4>
          <div className="space-y-4">
            <input type="text" placeholder="Video ID" value={newDistro.video_id} onChange={(e) => setNewDistro({ ...newDistro, video_id: e.target.value })} className="w-full bg-input border border-border rounded-none px-3 h-10 text-sm focus:outline-none focus:border-primary" />

            <div>
              <p className="text-xs uppercase tracking-[0.1em] font-medium mb-2">Platforms:</p>
              <div className="space-y-2">
                {platforms.map(p => (
                  <label key={p} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={newDistro.platforms.includes(p)} onChange={() => togglePlatform(p)} className="rounded" />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.1em] font-medium mb-2">Platform Links:</p>
              <input type="url" placeholder="TikTok link" value={newDistro.links.tiktok} onChange={(e) => setNewDistro({ ...newDistro, links: { ...newDistro.links, tiktok: e.target.value } })} className="w-full bg-input border border-border rounded-none px-3 h-8 text-xs focus:outline-none focus:border-primary mb-1" />
              <input type="url" placeholder="Instagram link" value={newDistro.links.instagram} onChange={(e) => setNewDistro({ ...newDistro, links: { ...newDistro.links, instagram: e.target.value } })} className="w-full bg-input border border-border rounded-none px-3 h-8 text-xs focus:outline-none focus:border-primary mb-1" />
              <input type="url" placeholder="YouTube link" value={newDistro.links.youtube} onChange={(e) => setNewDistro({ ...newDistro, links: { ...newDistro.links, youtube: e.target.value } })} className="w-full bg-input border border-border rounded-none px-3 h-8 text-xs focus:outline-none focus:border-primary" />
            </div>

            <button onClick={save} className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.12em] py-2 rounded-none hover:bg-primary/90">Log Distribution</button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="font-serif text-base mb-4">Posted Videos</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {distributions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No distributions logged yet.</p>
            ) : (
              distributions.map(d => (
                <div key={d.id} className="border border-border rounded-sm p-3 bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-serif text-sm mb-2">Video: {d.video_id}</h5>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {d.platforms.map(p => <span key={p} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-sm">{p}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs mb-2">
                    {d.links.tiktok && <a href={d.links.tiktok} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline truncate">TikTok ↗</a>}
                    {d.links.instagram && <a href={d.links.instagram} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline truncate">Instagram ↗</a>}
                    {d.links.youtube && <a href={d.links.youtube} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline truncate">YouTube ↗</a>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
