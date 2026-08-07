import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-xs uppercase tracking-[0.3em] text-primary">404</span>
        <h1 className="font-serif text-5xl lg:text-6xl mt-4 mb-6">Page not found</h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-10">
          That page doesn&apos;t exist — but your perfect body care routine does.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-[0.2em] h-12 px-8 transition-colors"
          >
            Shop the Collection
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </section>
  )
}
