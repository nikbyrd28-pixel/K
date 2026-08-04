import Link from 'next/link'

// Slim top bar — sets a premium, handmade tone. Statements are all true to the
// brand (small-batch, Black-owned, local pickup offered at checkout).
export function AnnouncementBar() {
  const messages = [
    'Handmade in small batches',
    'Black-owned',
    'Gift-ready sets',
    'Local pickup available',
  ]
  return (
    <div className="bg-primary text-primary-foreground text-[10px] sm:text-[11px] uppercase tracking-[0.2em]">
      <Link
        href="/shop"
        className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-center gap-x-6 gap-y-1 flex-wrap hover:opacity-90 transition-opacity"
      >
        {messages.map((m, i) => (
          <span key={m} className="flex items-center gap-6">
            {i > 0 && <span className="opacity-50" aria-hidden="true">·</span>}
            {m}
          </span>
        ))}
      </Link>
    </div>
  )
}
