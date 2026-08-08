'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Check, LogOut, Clapperboard, UploadCloud, Trash2, Download,
  Copy, RefreshCw, Camera, Music2, StickyNote, CalendarClock, Scissors,
} from 'lucide-react'

const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'
const FN = `${SUPA_URL}/functions/v1/hb-studio`

type Stage = 'new' | 'editing' | 'ready' | 'scheduled' | 'posted'

type ContentItem = {
  id: string
  created_at: string
  title: string
  caption: string
  client_notes: string
  editor_notes: string
  platforms: string[]
  status: Stage
  file_url: string
  edited_file_url: string
  content_type: string
  size_bytes: number
  uploaded_by: string
  manager_notes?: string
  scheduled_at?: string | null
  batch?: string
  updated_by: string
  posted_at: string | null
}

const STAGES: { key: Stage; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'editing', label: 'Editing' },
  { key: 'ready', label: 'Ready' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'posted', label: 'Posted' },
]

const STAGE_STYLE: Record<Stage, string> = {
  new: 'border-border text-muted-foreground',
  editing: 'border-sky-500/60 text-sky-400',
  ready: 'border-primary/60 text-primary',
  scheduled: 'border-amber-500/60 text-amber-400',
  posted: 'border-emerald-500/60 text-emerald-400',
}

export default function StudioPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [me, setMe] = useState<{ name: string; role: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Stage | 'all'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Upload form
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [tiktok, setTiktok] = useState(true)
  const [insta, setInsta] = useState(true)
  const [progress, setProgress] = useState<number | null>(null)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)

  // Auto-schedule form
  const [schedOpen, setSchedOpen] = useState(false)
  const [schedStart, setSchedStart] = useState('')
  const [schedGap, setSchedGap] = useState(24)
  const [schedBatch, setSchedBatch] = useState('')
  const [schedMsg, setSchedMsg] = useState<string | null>(null)

  const isEditor = me?.role === 'editor'
  const canManage = !!me && ['owner', 'manager', 'helper'].includes(me.role)

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

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await call('list')
      setItems(data.content || [])
      if (data.user) setMe(data.user)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load.')
    } finally {
      setLoading(false)
    }
  }, [call])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('hb_pw')
    if (saved) {
      setPw(saved)
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (authed && pw) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      const res = await fetch(FN, {
        method: 'POST',
        headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, action: 'list' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not sign in.')
      localStorage.setItem('hb_pw', pw)
      setItems(data.content || [])
      if (data.user) setMe(data.user)
      setAuthed(true)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem('hb_pw')
    setPw('')
    setAuthed(false)
    setItems([])
    setMe(null)
  }

  const uploadFile = async (f: File) => {
    const { uploadUrl, path } = await call('upload_url', { filename: f.name })
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', f.type || 'application/octet-stream')
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
      }
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed — try a smaller file.')))
      xhr.onerror = () => reject(new Error('Upload failed — check your connection.'))
      xhr.send(f)
    })
    return path as string
  }

  // Client drops raw material into the pipeline.
  const upload = async () => {
    if (!file) return setUploadMsg('Pick a video or photo first.')
    setUploadMsg(null)
    setProgress(0)
    try {
      const path = await uploadFile(file)
      const platforms = [tiktok && 'TikTok', insta && 'Instagram'].filter(Boolean)
      await call('save', {
        content: {
          file_path: path, title: title.trim(), caption: caption.trim(),
          client_notes: clientNotes.trim(), platforms, content_type: file.type, size_bytes: file.size,
        },
      })
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      setTitle('')
      setCaption('')
      setClientNotes('')
      setProgress(null)
      setUploadMsg('In the pipeline! Your team takes it from here. 💛')
      load()
    } catch (e) {
      setProgress(null)
      setUploadMsg(e instanceof Error ? e.message : 'Upload failed.')
    }
  }

  const patch = async (item: ContentItem, extra: Record<string, unknown>, optimistic?: Partial<ContentItem>) => {
    if (optimistic) setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, ...optimistic } : x)))
    try { await call('update', { id: item.id, ...extra }) } catch { load() }
  }

  const attachEdit = async (item: ContentItem, f: File, notes: string) => {
    setProgress(0)
    try {
      const path = await uploadFile(f)
      await call('attach_edit', { id: item.id, file_path: path, editor_notes: notes })
      setProgress(null)
      load()
    } catch (e) {
      setProgress(null)
      alert(e instanceof Error ? e.message : 'Upload failed.')
    }
  }

  const remove = async (item: ContentItem) => {
    if (!confirm('Delete this content for everyone?')) return
    setItems((xs) => xs.filter((x) => x.id !== item.id))
    try { await call('delete', { id: item.id }) } catch { load() }
  }

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const autoSchedule = async () => {
    setSchedMsg(null)
    if (selected.size === 0) return setSchedMsg('Tick the items to schedule first.')
    if (!schedStart) return setSchedMsg('Pick a start date and time.')
    try {
      const data = await call('auto_schedule', {
        ids: Array.from(selected), start: new Date(schedStart).toISOString(),
        gap_hours: schedGap, batch: schedBatch.trim(),
      })
      setSchedMsg(`Scheduled ${data.scheduled?.length ?? 0} post${(data.scheduled?.length ?? 0) === 1 ? '' : 's'}.`)
      setSelected(new Set())
      load()
    } catch (e) {
      setSchedMsg(e instanceof Error ? e.message : 'Could not schedule.')
    }
  }

  if (!authed) {
    return (
      <section className="max-w-sm mx-auto px-4 py-24 lg:py-32">
        <div className="flex items-center justify-center gap-2 text-primary mb-3">
          <Clapperboard className="w-5 h-5" />
        </div>
        <h1 className="font-serif text-4xl text-center mb-2">Content Studio</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          One system for the whole pipeline — upload, edit, schedule, post.
        </p>
        <form onSubmit={signIn} className="flex flex-col gap-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Your studio password"
            autoFocus
            className="bg-input border border-border rounded-none px-4 h-12 text-foreground focus:outline-none focus:border-primary"
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Enter the studio'}
          </button>
        </form>
      </section>
    )
  }

  const counts = STAGES.reduce((acc, s) => ({ ...acc, [s.key]: items.filter((i) => i.status === s.key).length }), {} as Record<Stage, number>)
  const visible = filter === 'all' ? items : items.filter((i) => i.status === filter)

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl flex items-center gap-3">
            <Clapperboard className="w-6 h-6 text-primary" /> Content Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {me ? `${me.name} · ${isEditor ? 'Editor' : me.role === 'owner' ? 'Owner' : 'Marketing manager'}` : ''}
            {isEditor ? ' — edit what comes in, mark it ready.' : ' — upload, review, schedule, post.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!isEditor && (
            <Link href="/admin" className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary">
              Dashboard
            </Link>
          )}
          <button onClick={signOut} className="text-muted-foreground hover:text-primary" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upload card — clients and managers drop raw material in. Editors edit; they don't add. */}
      {!isEditor && (
        <div className="border border-primary/30 bg-card rounded-sm p-5 sm:p-6 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> New material
          </p>
          <div className="flex flex-col gap-4">
            <input
              ref={fileRef}
              type="file"
              accept="video/*,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-muted-foreground file:mr-4 file:rounded-none file:border file:border-primary/40 file:bg-transparent file:text-primary file:text-xs file:uppercase file:tracking-[0.15em] file:px-4 file:h-10 file:cursor-pointer"
            />
            {file && (
              <p className="text-xs text-muted-foreground -mt-2">
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title — e.g. 'Candle pour close-up'"
              className="bg-input border border-border rounded-none px-4 h-11 text-sm text-foreground focus:outline-none focus:border-primary"
            />
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="Caption idea for the post (optional)"
              className="bg-input border border-border rounded-none px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary resize-y"
            />
            <textarea
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              rows={2}
              placeholder="Notes for the editor — what to cut, what to highlight, the vibe…"
              className="bg-input border border-border rounded-none px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary resize-y"
            />
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={tiktok} onChange={(e) => setTiktok(e.target.checked)} className="w-4 h-4 accent-[var(--color-primary)]" />
                <Music2 className="w-4 h-4" /> TikTok
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={insta} onChange={(e) => setInsta(e.target.checked)} className="w-4 h-4 accent-[var(--color-primary)]" />
                <Camera className="w-4 h-4" /> Instagram
              </label>
            </div>
            {progress !== null && (
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            {uploadMsg && <p className="text-sm text-primary">{uploadMsg}</p>}
            <button
              onClick={upload}
              disabled={progress !== null}
              className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 disabled:opacity-60"
            >
              {progress !== null ? `Uploading… ${progress}%` : 'Add to pipeline'}
            </button>
            <p className="text-[11px] text-muted-foreground">
              Videos and photos up to ~50 MB. It flows: New → Editing → Ready → Scheduled → Posted.
            </p>
          </div>
        </div>
      )}

      {/* Auto-schedule toolbar (manager only) */}
      {canManage && (
        <div className="border border-border bg-card rounded-sm p-4 mb-8">
          <button
            onClick={() => setSchedOpen((o) => !o)}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary"
          >
            <CalendarClock className="w-4 h-4" />
            Auto-schedule {selected.size > 0 ? `(${selected.size} selected)` : ''}
          </button>
          {schedOpen && (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Tick items below, pick a start time and spacing — each one gets its own slot, in order.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">First post</span>
                  <input
                    type="datetime-local"
                    value={schedStart}
                    onChange={(e) => setSchedStart(e.target.value)}
                    className="bg-input border border-border rounded-none px-3 h-11 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Spacing</span>
                  <select
                    value={schedGap}
                    onChange={(e) => setSchedGap(Number(e.target.value))}
                    className="bg-input border border-border rounded-none px-3 h-11 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value={6}>Every 6 hours</option>
                    <option value={12}>Every 12 hours</option>
                    <option value={24}>Daily</option>
                    <option value={48}>Every 2 days</option>
                    <option value={72}>Every 3 days</option>
                    <option value={168}>Weekly</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Batch name (optional)</span>
                  <input
                    value={schedBatch}
                    onChange={(e) => setSchedBatch(e.target.value)}
                    placeholder="e.g. Fall drop week 1"
                    className="bg-input border border-border rounded-none px-3 h-11 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </label>
              </div>
              {schedMsg && <p className="text-sm text-primary">{schedMsg}</p>}
              <button
                onClick={autoSchedule}
                className="self-start rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-11 px-6"
              >
                Schedule {selected.size || ''} selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stage filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`text-[11px] uppercase tracking-[0.12em] border rounded-full px-3.5 py-1.5 ${filter === 'all' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-primary'}`}
        >
          All · {items.length}
        </button>
        {STAGES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`text-[11px] uppercase tracking-[0.12em] border rounded-full px-3.5 py-1.5 ${filter === s.key ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-primary'}`}
          >
            {s.label} · {counts[s.key]}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={load} className="text-muted-foreground hover:text-primary p-1" aria-label="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-border rounded-sm p-8 text-center">
          Nothing in this stage yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {visible.map((item) => (
            <StudioCard
              key={item.id}
              item={item}
              isEditor={isEditor}
              canManage={canManage}
              selected={selected.has(item.id)}
              onSelect={() => toggleSelect(item.id)}
              onPatch={patch}
              onAttachEdit={attachEdit}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function StudioCard({
  item, isEditor, canManage, selected, onSelect, onPatch, onAttachEdit, onDelete,
}: {
  item: ContentItem
  isEditor: boolean
  canManage: boolean
  selected: boolean
  onSelect: () => void
  onPatch: (i: ContentItem, extra: Record<string, unknown>, optimistic?: Partial<ContentItem>) => void
  onAttachEdit: (i: ContentItem, f: File, notes: string) => void
  onDelete: (i: ContentItem) => void
}) {
  const [managerNotes, setManagerNotes] = useState(item.manager_notes || '')
  const [editorNotes, setEditorNotes] = useState(item.editor_notes || '')
  const [notesSaved, setNotesSaved] = useState(false)
  const [when, setWhen] = useState(item.scheduled_at ? item.scheduled_at.slice(0, 16) : '')
  const editFileRef = useRef<HTMLInputElement>(null)
  const showUrl = item.edited_file_url || item.file_url
  const isVideo = item.content_type.startsWith('video/')

  const editorStages: Stage[] = ['new', 'editing', 'ready']
  const stages = isEditor ? editorStages : STAGES.map((s) => s.key)

  return (
    <div className={`border rounded-sm bg-card overflow-hidden flex flex-col ${selected ? 'border-primary' : 'border-border'}`}>
      <div className="bg-black aspect-video relative">
        {isVideo ? (
          <video src={showUrl} controls preload="metadata" playsInline className="w-full h-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={showUrl} alt={item.title || 'Upload'} className="w-full h-full object-contain" />
        )}
        {item.edited_file_url && (
          <span className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.1em] bg-primary/90 text-primary-foreground px-2 py-0.5">
            Edited cut
          </span>
        )}
        {canManage && (
          <label className="absolute top-2 right-2 bg-black/60 p-1.5 cursor-pointer">
            <input type="checkbox" checked={selected} onChange={onSelect} className="w-4 h-4 accent-[var(--color-primary)]" />
          </label>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.title || 'Untitled'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.uploaded_by} · {new Date(item.created_at).toLocaleDateString()}
              {item.platforms.length > 0 && <> · {item.platforms.join(' + ')}</>}
              {!isEditor && item.batch && <> · 🗂 {item.batch}</>}
            </p>
          </div>
          <span className={`shrink-0 text-[10px] uppercase tracking-[0.12em] border rounded-full px-2.5 py-1 ${STAGE_STYLE[item.status]}`}>
            {item.status}
          </span>
        </div>

        {!isEditor && item.status === 'scheduled' && item.scheduled_at && (
          <p className="text-xs text-amber-400 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5" /> {new Date(item.scheduled_at).toLocaleString()}
          </p>
        )}

        {item.caption && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            <span className="text-foreground/70">Caption:</span> {item.caption}
          </p>
        )}
        {item.client_notes && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 border-l-2 border-primary/40 pl-2">
            <span className="text-primary/80">Client:</span> {item.client_notes}
          </p>
        )}
        {item.editor_notes && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 border-l-2 border-sky-500/40 pl-2">
            <span className="text-sky-400/80">Editor:</span> {item.editor_notes}
          </p>
        )}

        {/* Stage buttons */}
        <div className="flex items-center gap-1 flex-wrap mt-auto pt-1">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => onPatch(item, { status: s }, { status: s })}
              className={`text-[10px] uppercase tracking-[0.08em] border rounded-none px-2 h-7 transition-colors ${
                item.status === s ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-primary hover:border-primary/50'
              }`}
            >
              {s}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => navigator.clipboard?.writeText(item.caption || item.title)}
            className="text-muted-foreground hover:text-primary p-1.5" aria-label="Copy caption" title="Copy caption"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a href={item.file_url} download target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary p-1.5" aria-label="Download original" title="Download original">
            <Download className="w-4 h-4" />
          </a>
          {item.edited_file_url && (
            <a href={item.edited_file_url} download target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 p-1.5" aria-label="Download edited cut" title="Download edited cut">
              <Scissors className="w-4 h-4" />
            </a>
          )}
          {canManage && (
            <button onClick={() => onDelete(item)} className="text-muted-foreground hover:text-destructive p-1.5" aria-label="Delete" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Editor: upload the edited cut */}
        {(isEditor || canManage) && item.status !== 'posted' && (
          <details>
            <summary className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground cursor-pointer flex items-center gap-1.5 list-none">
              <Scissors className="w-3.5 h-3.5" /> {item.edited_file_url ? 'Replace edited cut' : 'Upload edited cut'}
            </summary>
            <div className="mt-2 flex flex-col gap-2">
              <input
                ref={editFileRef}
                type="file"
                accept="video/*,image/*"
                className="text-xs text-muted-foreground file:mr-3 file:rounded-none file:border file:border-primary/40 file:bg-transparent file:text-primary file:text-[10px] file:uppercase file:tracking-[0.1em] file:px-3 file:h-8 file:cursor-pointer"
              />
              <input
                value={editorNotes}
                onChange={(e) => setEditorNotes(e.target.value)}
                placeholder="Editor notes — what changed, versions, music…"
                className="bg-input border border-border rounded-none px-3 h-9 text-xs text-foreground focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  const f = editFileRef.current?.files?.[0]
                  if (f) onAttachEdit(item, f, editorNotes)
                }}
                className="self-start border border-primary/40 text-primary hover:bg-primary/10 text-[10px] uppercase tracking-[0.1em] px-3 h-8"
              >
                Upload &amp; mark ready
              </button>
            </div>
          </details>
        )}

        {/* Manager: schedule + notes */}
        {canManage && (
          <details>
            <summary className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground cursor-pointer flex items-center gap-1.5 list-none">
              <StickyNote className="w-3.5 h-3.5" /> Manage
              {item.manager_notes && <span className="normal-case tracking-normal truncate max-w-[9rem]">· {item.manager_notes}</span>}
            </summary>
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="flex-1 bg-input border border-border rounded-none px-3 h-9 text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => when && onPatch(item, { scheduled_at: new Date(when).toISOString(), status: 'scheduled' }, { status: 'scheduled', scheduled_at: new Date(when).toISOString() })}
                  className="border border-primary/40 text-primary hover:bg-primary/10 text-[10px] uppercase tracking-[0.1em] px-3 h-9"
                >
                  Schedule
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={managerNotes}
                  onChange={(e) => { setManagerNotes(e.target.value); setNotesSaved(false) }}
                  placeholder="Manager notes — posting plan, sound, hashtags…"
                  className="flex-1 bg-input border border-border rounded-none px-3 h-9 text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => { onPatch(item, { manager_notes: managerNotes }); setNotesSaved(true) }}
                  className="border border-primary/40 text-primary hover:bg-primary/10 text-[10px] uppercase tracking-[0.1em] px-3 h-9"
                >
                  {notesSaved ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
