import Image from "next/image";
import Link from "next/link";

import { ArrowUpRightIcon } from "lucide-react";

import { Emblem, Wordmark } from "@/components/brand";
import { SocialLinks } from "@/components/social-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { CHURCH, FOOTER_LINKS, GROUP_ROUTES, NAV, SERVICES, STATS, TESTIMONIALS } from "@/constant";
import { CUTOFF_MINUTES, formatCutoff } from "@/lib/attendance";
import { cn } from "@/lib/utils";

/** A mono eyebrow + hairline. The page's only structural device, used throughout. */
function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="font-mono text-[10px] tracking-[0.28em] whitespace-nowrap uppercase">{children}</span>
      <span className="bg-current h-px flex-1 opacity-15" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-background">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="border-border/60 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="bg-background/80 absolute inset-0 -z-10" />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Wordmark />

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-[13px] font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="#check-in"
              className="border-border hover:border-foreground/30 hover:bg-accent/40 hidden rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors sm:inline-flex"
            >
              Check in
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-16 pb-12 sm:px-8 sm:pt-24">
        <p className="text-muted-foreground font-mono text-[10px] tracking-[0.28em] uppercase">{CHURCH.tagline}</p>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <h1 className="text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.92] font-extrabold tracking-[-0.04em] text-balance">
            Welcome to God&rsquo;s Family{" "}
            {/* The accent appears once in the headline and then almost nowhere else. */}
            <span className="relative whitespace-nowrap">
              On Earth
              <span className="bg-brand-orange absolute inset-x-0 -bottom-1 h-[0.09em] rounded-full sm:-bottom-2" />
            </span>
          </h1>

          <p className="text-muted-foreground max-w-md text-[15px] leading-relaxed lg:pb-3">
            At {CHURCH.legalName} (COZA), we believe you were created for more. You are not here by happenstance or
            circumstance; God brought you here on a purpose and for a purpose.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#locations"
            className="bg-foreground text-background group inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-semibold transition-opacity hover:opacity-85"
          >
            Plan your visit
            <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href="#sermons"
            className="border-border hover:border-foreground/30 hover:bg-accent/40 inline-flex h-12 items-center gap-2 rounded-full border px-6 text-[14px] font-semibold transition-colors"
          >
            Watch sermons
          </a>
        </div>

        {/* The photograph is the colour. The page around it stays quiet. */}
        <div className="bg-muted relative mt-14 aspect-[16/9] overflow-hidden rounded-[24px] sm:aspect-[21/9]">
          <Image
            src="/hq.jpg"
            alt="COZA Guzape Church headquarters in Abuja"
            fill
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover object-[center_35%]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-6 pt-20 pb-6 sm:px-8 sm:pb-8">
            <p className="font-mono text-[10px] tracking-[0.24em] text-white/70 uppercase">Guzape Church &middot; HQ</p>
            <p className="mt-1.5 text-lg font-bold tracking-tight text-white sm:text-xl">Abuja, Nigeria</p>
          </div>
        </div>
      </section>

      {/* ── Check in ───────────────────────────────────────────────── */}
      <section id="check-in" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8">
        <Eyebrow>Checking in today?</Eyebrow>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {GROUP_ROUTES.map(({ group, href, invitation, blurb }) => (
            <Link
              key={group}
              href={href}
              className={cn(
                "group bg-card relative overflow-hidden rounded-2xl border p-6 transition-all",
                "hover:border-foreground/20 hover:shadow-[0_18px_40px_-24px_rgba(16,22,42,0.3)]"
              )}
            >
              {/* A 3px edge carries the group's colour. That is the whole of it. */}
              <span
                className={cn(
                  "absolute inset-y-0 left-0 w-[3px]",
                  group === "member" ? "bg-brand-orange" : "bg-brand-purple"
                )}
              />

              <div className="flex items-start justify-between gap-4">
                <p className="text-[1.6rem] leading-tight font-extrabold tracking-tight">{invitation}</p>
                <ArrowUpRightIcon className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              <p className="text-muted-foreground mt-2 text-[13px] leading-snug">{blurb}</p>

              <p className="border-border/70 mt-6 flex items-baseline gap-2 border-t pt-4">
                <span className="text-muted-foreground/70 font-mono text-[10px] tracking-[0.2em] uppercase">
                  Be seated by
                </span>
                <span className="ml-auto font-mono text-lg font-semibold tabular-nums">
                  {formatCutoff(CUTOFF_MINUTES[group])}
                </span>
              </p>
            </Link>
          ))}
        </div>

        <p className="text-muted-foreground/70 mt-4 text-xs">
          Arrival time is recorded by the system when you submit &mdash; not from what you select.
        </p>
      </section>

      {/* ── Quote ──────────────────────────────────────────────────── */}
      <section className="border-border/60 border-y">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <blockquote className="max-w-4xl text-[clamp(1.6rem,4.6vw,3rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
            <span className="text-brand-orange">&ldquo;</span>
            {CHURCH.quote}
            <span className="text-brand-orange">&rdquo;</span>
          </blockquote>
          <footer className="mt-9 flex items-center gap-3">
            <span className="bg-foreground/25 h-px w-10" />
            <p className="text-[13px] font-semibold">
              {CHURCH.pastor}
              <span className="text-muted-foreground block font-normal">{CHURCH.pastorTitle}</span>
            </p>
          </footer>
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <Eyebrow>Experience the move of God</Eyebrow>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <h2 className="text-[clamp(1.75rem,4.5vw,2.6rem)] leading-[1.02] font-extrabold tracking-[-0.03em]">
              Every service is an opportunity to grow.
            </h2>
            <p className="text-muted-foreground mt-5 max-w-sm text-[15px] leading-relaxed">
              From our Sunday Services to the globally renowned 12 Days of Glory and COZA Global Leadership Summit
              &mdash; every event is a chance to grow in revelation, leadership, and grace.
            </p>
          </div>

          {/* A departure board, not a card grid. */}
          <dl className="border-border/70 divide-border/70 divide-y border-t">
            {SERVICES.map((service) => (
              <div key={service.name} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5">
                <dt className="text-lg font-bold tracking-tight">{service.name}</dt>
                <dd className="text-muted-foreground order-3 w-full text-[13px] sm:order-2 sm:w-auto sm:flex-1">
                  {service.where}
                </dd>
                <dd className="order-2 font-mono text-[15px] tabular-nums sm:order-3">
                  {service.from} <span className="text-muted-foreground/50">&mdash;</span> {service.to}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Sermons ────────────────────────────────────────────────── */}
      <section id="sermons" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="bg-muted relative aspect-square overflow-hidden rounded-[24px]">
            <Image
              src="/sermon-how-faith-works.jpg"
              alt="How Faith Works — Pastor Biodun Fatoyinbo"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>

          <div>
            <Eyebrow className="text-muted-foreground">Latest message</Eyebrow>
            <h2 className="mt-7 text-[clamp(1.9rem,5vw,3.1rem)] leading-[0.98] font-extrabold tracking-[-0.035em]">
              The Word works.
              <br />
              Every time.
            </h2>
            <p className="text-muted-foreground mt-6 max-w-md text-[15px] leading-relaxed">
              God&rsquo;s Word transforms destinies. Catch up on the latest life-changing messages from Our Father,{" "}
              {CHURCH.pastor}. Be strengthened, built up, and positioned for the next level.
            </p>
            <p className="mt-7 flex items-baseline gap-3">
              <span className="text-muted-foreground/70 font-mono text-[10px] tracking-[0.2em] uppercase">
                Now playing
              </span>
              <span className="text-[15px] font-bold tracking-tight">How Faith Works</span>
            </p>
            <a
              href="#"
              className="border-border hover:border-foreground/30 hover:bg-accent/40 mt-7 inline-flex h-12 items-center gap-2 rounded-full border px-6 text-[14px] font-semibold transition-colors"
            >
              Watch our sermons
              <ArrowUpRightIcon className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── eChurch ────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="order-2 lg:order-1">
            <Eyebrow className="text-muted-foreground">Worship from anywhere</Eyebrow>
            <h2 className="mt-7 text-[clamp(1.9rem,5vw,3.1rem)] leading-[0.98] font-extrabold tracking-[-0.035em]">
              Join our eChurch
            </h2>
            <p className="text-muted-foreground mt-6 max-w-md text-[15px] leading-relaxed">
              Whether you&rsquo;re in Cairo, Hong Kong, Montreal, or anywhere across the world, you can belong to this
              family. Our eChurch brings you right into the COZA experience &mdash; worship, word, prayer and deep
              fellowship, all from wherever you are.
            </p>
            <Link
              href="/members"
              className="bg-foreground text-background group mt-7 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-semibold transition-opacity hover:opacity-85"
            >
              Register today
              <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="bg-muted relative order-1 aspect-square overflow-hidden rounded-[24px] lg:order-2">
            <Image
              src="/echurch.jpg"
              alt="Be part of our family — COZA eChurch"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Leadership ─────────────────────────────────────────────── */}
      <section id="about" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8">
        <div className="bg-muted relative overflow-hidden rounded-[28px] px-6 pt-12 sm:px-12 sm:pt-16">
          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div className="pb-12 sm:pb-16">
              <Eyebrow className="text-muted-foreground">Founded on revelation</Eyebrow>
              <h2 className="mt-7 text-[clamp(1.9rem,5vw,3.1rem)] leading-[0.98] font-extrabold tracking-[-0.035em]">
                Raising a takeover generation.
              </h2>
              <p className="text-muted-foreground mt-6 max-w-lg text-[15px] leading-relaxed">
                Established over 26 years ago under divine instruction in Ilorin, Kwara State, COZA has become one of
                the fastest-growing churches in Africa, with vibrant campuses across Nigeria, the UAE and the United
                Kingdom.
              </p>
              <p className="text-muted-foreground mt-4 max-w-lg text-[15px] leading-relaxed">
                Led by Our Father, {CHURCH.pastor}, and Our Mother, {CHURCH.motherTitle}, COZA is known for its culture
                of excellence, powerful worship, and transformative Word.
              </p>
              <p className="mt-8 font-mono text-[11px] tracking-[0.18em] uppercase">
                Spearheading new things with spirituality &amp; excellence
              </p>
            </div>

            {/* The cut-out stands on the block — no frame, no card. */}
            <div className="relative mx-auto h-[340px] w-full max-w-[420px] sm:h-[460px]">
              <Image
                src="/pastors.png"
                alt={`${CHURCH.pastor} and ${CHURCH.motherTitle}`}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <Eyebrow>We are big enough to serve you, small enough to know you</Eyebrow>

        <ul className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.name}>
              <p className="text-[clamp(1rem,1.6vw,1.15rem)] leading-snug font-semibold tracking-tight text-pretty">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-muted-foreground mt-5 font-mono text-[11px] tracking-[0.16em] uppercase">
                {t.name} <span className="opacity-50">&middot;</span> {t.where}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Locations ──────────────────────────────────────────────── */}
      <section id="locations" className="border-border/60 scroll-mt-20 border-t">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow className="text-muted-foreground">Find a church near you</Eyebrow>
              <h2 className="mt-7 text-[clamp(1.75rem,4.5vw,2.6rem)] leading-[1.02] font-extrabold tracking-[-0.03em]">
                Join me this Sunday.
              </h2>
              <p className="text-muted-foreground mt-6 max-w-md text-[15px] leading-relaxed">
                I can&rsquo;t wait to welcome you at any of our COZA churches around the world. Come experience deep
                worship, powerful teaching, and an atmosphere filled with faith, love and excellence.
              </p>

              <div className="border-border/70 mt-9 border-t pt-7">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase">Guzape Church &middot; Headquarters</p>
                <p className="mt-3 text-lg leading-snug font-bold tracking-tight">{CHURCH.address}</p>
              </div>

              <a
                href="#contact"
                className="bg-foreground text-background group mt-8 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-semibold transition-opacity hover:opacity-85"
              >
                Contact us
                <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            {/* Oversized numerals carry this, not icons in boxes. */}
            <dl className="grid grid-cols-2 gap-x-8 gap-y-12 self-center sm:grid-cols-3 lg:grid-cols-2">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-mono text-[clamp(2.5rem,7vw,4rem)] leading-none font-semibold tracking-[-0.05em] tabular-nums">
                    {stat.value}
                  </dt>
                  <dd className="text-muted-foreground mt-3 text-[13px] font-medium">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer id="contact" className="bg-panel scroll-mt-20 text-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <h2 className="text-[clamp(1.6rem,4vw,2.4rem)] leading-[1.05] font-extrabold tracking-[-0.03em]">
                Stay connected. Stay inspired. Stay ahead.
              </h2>
              <p className="mt-5 max-w-md text-[14px] leading-relaxed text-white/55">
                Our newsletter strengthens your walk, keeps you aligned with what God is doing in the house, and helps
                you apply kingdom principles to everyday life.
              </p>

              {/* ponytail: presentational until there is somewhere to send it. */}
              <form className="mt-8 flex max-w-md flex-col gap-2.5 sm:flex-row">
                <label className="sr-only" htmlFor="newsletter">
                  Your email address
                </label>
                <input
                  id="newsletter"
                  type="email"
                  placeholder="Your email address"
                  className="h-12 flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-[14px] text-white transition-colors outline-none placeholder:text-white/35 focus-visible:border-white/40"
                />
                <button
                  type="submit"
                  className="bg-brand-orange text-brand-navy h-12 shrink-0 rounded-full px-6 text-[14px] font-bold transition-opacity hover:opacity-90"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {FOOTER_LINKS.map((column) => (
                <div key={column.title}>
                  <p className="font-mono text-[9px] tracking-[0.22em] text-white/35 uppercase">{column.title}</p>
                  <ul className="mt-5 space-y-3">
                    {column.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-[13px] text-white/65 transition-colors hover:text-white">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
            {[
              ["Address", CHURCH.address],
              ["Phone", CHURCH.phone],
              ["Email", CHURCH.email],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="font-mono text-[9px] tracking-[0.22em] text-white/35 uppercase">{label}</p>
                <p className="mt-2.5 text-[13px] leading-relaxed text-white/70">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Emblem onDark className="size-9" />
              <p className="text-[13px] font-semibold">
                {CHURCH.name}
                <span className="block font-normal text-white/45">{CHURCH.tagline}</span>
              </p>
            </div>

            <SocialLinks className="-mx-2" />
          </div>

          <p className="mt-10 font-mono text-[10px] tracking-[0.18em] text-white/25 uppercase">
            &copy; {new Date().getFullYear()} {CHURCH.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
