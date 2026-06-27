import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Hubs & Babydoll is a small, home-based brand creating handcrafted self-care essentials for the people who care for everyone else.',
}

function EventsSection() {
  const details = [
    { label: 'Event', value: 'TBD' },
    { label: 'Date', value: 'Coming Soon' },
    { label: 'Location', value: 'Local Area' },
  ]
  return (
    <section className="py-20 lg:py-28 bg-background border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="h-px w-8 bg-primary/50" />
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Events</span>
          <span className="h-px w-8 bg-primary/50" />
        </div>
        <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-balance">Find Us In Person</h2>
        <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-12 text-pretty">
          We&apos;d love to meet you.
        </p>

        <div className="mx-auto max-w-md border border-primary/30 bg-secondary rounded-sm p-8 lg:p-10 text-left">
          <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-primary-foreground bg-primary px-3 py-1.5 mb-7">
            Upcoming Event
          </span>
          <dl className="flex flex-col">
            {details.map((detail, i) => (
              <div
                key={detail.label}
                className={`flex items-baseline justify-between gap-4 py-4 ${
                  i !== details.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="font-serif text-xl lg:text-2xl text-foreground">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <section className="py-24 lg:py-36 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Our Story</span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.12] mt-8 mb-14 text-balance">
            The people who love the hardest often care for themselves the least.
          </h1>

          <div className="max-w-2xl mx-auto text-left">
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6 text-pretty">
              The husband who keeps saying &ldquo;I&apos;m good&rdquo; while carrying the weight of
              providing. The mother who remembers everyone&apos;s appointments but forgets her own.
              The woman holding it all together while quietly running on empty. We&apos;ve met them
              all — and that&apos;s why Hubs &amp; Babydoll exists.
            </p>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty">
              We&apos;re a small, home-based brand creating handcrafted self-care essentials and gift
              experiences designed to transform everyday routines into meaningful wellness moments.
              Rooted in the belief that everyone deserves to feel SEEN and HEARD, our products invite
              you to slow down, soften, and care for yourself and the people you love — one
              intentional moment at a time.
            </p>
          </div>

          <div className="mt-16 pt-12 border-t border-border max-w-2xl mx-auto space-y-2">
            <p className="font-serif text-2xl lg:text-3xl text-foreground italic leading-snug">
              Because softness isn&apos;t weakness. Care isn&apos;t selfish.
            </p>
            <p className="font-serif text-xl lg:text-2xl text-primary leading-snug">
              And those who pour into others deserve to be poured into, too.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-secondary border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Come Say Hello</span>
            <span className="h-px w-8 bg-primary/50" />
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl mb-6 text-balance">
            Some of our favorite moments aren&apos;t the sales — they&apos;re the conversations.
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty">
            If you see us at a local vending event, please stop by. We love hearing your stories,
            learning what you&apos;re celebrating and what you&apos;re navigating, and helping you
            find the products that fit the season you&apos;re in. Thank you for supporting our dream
            and allowing Hubs &amp; Babydoll to become part of your routines.
          </p>
        </div>
      </section>

      <EventsSection />
    </>
  )
}
