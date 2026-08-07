'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'

export function AnalyticsTracker() {
  const pathname = usePathname()
  const sidRef = useRef<string | null>(null)

  useEffect(() => {
    if (pathname.startsWith('/admin')) return

    if (!sidRef.current) {
      let sid = sessionStorage.getItem('hb_sid')
      if (!sid) {
        sid = crypto.randomUUID()
        sessionStorage.setItem('hb_sid', sid)
      }
      sidRef.current = sid
    }

    let referrer: string | null = null
    try {
      if (document.referrer) referrer = new URL(document.referrer).hostname
    } catch {}

    fetch(`${SUPA_URL}/rest/v1/hb_pageviews`, {
      method: 'POST',
      headers: {
        apikey: SUPA_ANON,
        Authorization: `Bearer ${SUPA_ANON}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ page: pathname, referrer, session_id: sidRef.current }),
    }).catch(() => {})
  }, [pathname])

  return null
}
