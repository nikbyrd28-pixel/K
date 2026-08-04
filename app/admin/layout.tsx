import type { Metadata } from 'next'

// The dashboard is private — keep it out of search engines.
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
