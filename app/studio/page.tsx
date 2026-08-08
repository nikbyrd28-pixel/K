'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Check, LogOut, Clapperboard, UploadCloud, Trash2, Download,
  Copy, RefreshCw, Camera, Music2, StickyNote,
} from 'lucide-react'

const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'
const FN = `${SUPA_URL}/functions/v1/hb-studio`

type ContentItem = {
  id: string
  created_at: string
  title: string
  caption: string
  platforms: string[]
  status: 'new' | 'approved' | 'posted'
  file_url: string
  content_type: string
  size_bytes: number
  uploaded_by: string
  manager_notes: string
  updated_by: string
  posted_at: string | null
}

const STATUS_LABEL: Record<ContentItem['status'], string> = {
  new: 'Waiting for review',
  approved: 'Approved — ready to post',
  posted: 'Posted',
}
const STATUS_STYLE: Record<ContentItem['status'], string> = {
  new: 'border-border text-muted-foreground',
  approved: 'border-primary/60 text-primary',
  posted: 'border-emerald-500/60 text-emerald-400',
}

export default function StudioPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [userName, setUserName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)

  // Upload form
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [tiktok, setTiktok] = useState(true)
  const [insta, setInsta] = useState(true)
  const [progress, setProgress] = useState<number | null>(null)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)

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
      if (data.user?.name) setUserName(data.user.name)
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
      if (data.user?.name) setUserName(data.user.name)
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
  }

  // Upload straight to storage with progress, then save the record.
  const upload = async () => {
    if (!file) return setUploadMsg('Pick a video or photo first.')
    setUploadMsg(null)
    setProgress(0)
    try {
      const { uploadUrl, path } = await call('upload_url', { filename: file.name })
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
        }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed — try a smaller file.')))
        xhr.onerror = () => reject(new Error('Upload failed — check your connection.'))
        xhr.send(file)
      })
      const platforms = [tiktok && 'TikTok', insta && 'Instagram'].filter(Boolean)
      await call('save', {
        content: {
          file_path: path, title: title.trim(), caption: caption.trim(),
          platforms, content_type: file.type, size_bytes: file.size,
        },
      })
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      setTitle('')
      setCaption('')
      setProgress(null)
      setUploadMsg('Sent to your marketing manager! 💛')
      load()
    } catch (e) {
      setProgress(null)
      setUploadMsg(e instanceof Error ? e.message : 'Upload failed.')
    }
  }

  const setStatus = async (item: ContentItem, status: ContentItem['status']) => {
    setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, status } : x)))
    try { await call('update', { id: item.id, status }) } catch { load() }
  }

  const saveNotes = async (item: ContentItem, manager_notes: string) => {
    try { await call('update', { id: item.id, manager_notes }) } catch { load() }
  }

  const remove = async (item: ContentItem) => {
    if (!confirm('Delete this upload for everyone?')) return
    setItems((xs) => xs.filter((x) => x.id !== item.id))
    try { await call('delete', { id: item.id }) } catch { load() }
  }

  const copyCaption = (item: ContentItem) => {
    navigator.clipboard?.writeText(item.caption || item.title)
  }

  if (!authed) {
    return (
      <section className="max-w-sm mx-auto px-4 py-24 lg:py-32">
        <div className="flex items-center justify-center gap-2 text-primary mb-3">
          <Clapperboard className="w-5 h-5" />
        </div>
        <h1 className="font-serif text-4xl text-center mb-2">Content Studio</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Upload videos for TikTok &amp; Instagram — your marketing manager takes it from there.
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
            disabled={busy}
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Enter the studio'}
          </button>
        </form>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl flex items-center gap-3">
            <Clapperboard className="w-6 h-6 text-primary" /> Content Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {userName ? `Hey ${userName} — ` : ''}drop your videos here and your marketing manager sets them live.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary">
            Dashboard
          </Link>
          <button onClick={signOut} className="text-muted-foreground hover:text-primary" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upload card */}
      <div className="border border-primary/30 bg-card rounded-sm p-5 sm:p-6 mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4" /> New upload
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
            placeholder="Title (just for you two — e.g. 'Candle pour close-up')"
            className="bg-input border border-border rounded-none px-4 h-11 text-sm text-foreground focus:outline-none focus:border-primary"
          />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Caption idea for the post (optional — your manager can polish it)"
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
            {progress !== null ? `Uploading… ${progress}%` : 'Send to marketing'}
          </button>
          <p className="text-[11px] text-muted-foreground">
            Videos up to ~50 MB. Your manager gets it instantly, sets the caption, and posts it.
          </p>
        </div>
      </div>

      {/* Library */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Your library</p>
        <button onClick={load} className="text-muted-foreground hover:text-primary" aria-label="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-border rounded-sm p-8 text-center">
          Nothing here yet — your first upload will show up right here.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map((item) => (
            <StudioCard
              key={item.id}
              item={item}
              onStatus={setStatus}
              onNotes={saveNotes}
              onDelete={remove}
              onCopy={copyCaption}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function StudioCard({
  item, onStatus, onNotes, onDelete, onCopy,
}: {
  item: ContentItem
  onStatus: (i: ContentItem, s: ContentItem['status']) => void
  onNotes: (i: ContentItem, notes: string) => void
  onDelete: (i: ContentItem) => void
  onCopy: (i: ContentItem) => void
}) {
  const [notes, setNotes] = useState(item.manager_notes || '')
  const [notesSaved, setNotesSaved] = useState(false)
  const isVideo = item.content_type.startsWith('video/')

  return (
    <div className="border border-border rounded-sm bg-card overflow-hidden flex flex-col">
      <div className="bg-black aspect-video">
        {isVideo ? (
          <video src={item.file_url} controls preload="metadata" playsInline className="w-full h-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.file_url} alt={item.title || 'Upload'} className="w-full h-full object-contain" />
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.title || 'Untitled'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.uploaded_by} · {new Date(item.created_at).toLocaleDateString()}
              {item.platforms.length > 0 && <> · {item.platforms.join(' + ')}</>}
            </p>
          </div>
          <span className={`shrink-0 text-[10px] uppercase tracking-[0.12em] border rounded-full px-2.5 py-1 ${STATUS_STYLE[item.status]}`}>
            {STATUS_LABEL[item.status]}
          </span>
        </div>

        {item.caption && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{item.caption}</p>}

        <div className="flex items-center gap-1.5 mt-auto pt-1">
          {(['new', 'approved', 'posted'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatus(item, s)}
              className={`text-[10px] uppercase tracking-[0.1em] border rounded-none px-2.5 h-8 transition-colors ${
                item.status === s ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-primary hover:border-primary/50'
              }`}
            >
              {s === 'new' ? 'New' : s === 'approved' ? 'Approve' : 'Posted'}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => onCopy(item)} className="text-muted-foreground hover:text-primary p-1.5" aria-label="Copy caption" title="Copy caption">
            <Copy className="w-4 h-4" />
          </button>
          <a href={item.file_url} download target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary p-1.5" aria-label="Download" title="Download">
            <Download className="w-4 h-4" />
          </a>
          <button onClick={() => onDelete(item)} className="text-muted-foreground hover:text-destructive p-1.5" aria-label="Delete" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <details className="group">
          <summary className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground cursor-pointer flex items-center gap-1.5 list-none">
            <StickyNote className="w-3.5 h-3.5" /> Manager notes{item.manager_notes ? ' ·' : ''}
            {item.manager_notes && <span className="normal-case tracking-normal truncate max-w-[10rem]">{item.manager_notes}</span>}
          </summary>
          <div className="mt-2 flex gap-2">
            <input
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setNotesSaved(false) }}
              placeholder="e.g. Posting Friday 6pm with trending sound"
              className="flex-1 bg-input border border-border rounded-none px-3 h-9 text-xs text-foreground focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => { onNotes(item, notes); setNotesSaved(true) }}
              className="border border-primary/40 text-primary hover:bg-primary/10 text-[10px] uppercase tracking-[0.1em] px-3 h-9"
            >
              {notesSaved ? <Check className="w-3.5 h-3.5" /> : 'Save'}
            </button>
          </div>
        </details>
      </div>
    </div>
  )
}
