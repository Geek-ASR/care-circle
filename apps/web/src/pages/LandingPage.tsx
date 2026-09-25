import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronUp,
  Eye,
  HeartHandshake,
  ListChecks,
  MessageSquare,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useCommunities } from '@/features/communities/hooks/useCommunities'
import { CommunityCard } from '@/features/communities/components/CommunityCard'
import { CONDITION_CATEGORIES } from '@/features/conditions/constants'

const SHOWCASE_CATEGORY_VALUES = [
  'autoimmune',
  'oncology',
  'mental_health',
  'cardiovascular',
  'neurological',
  'respiratory',
  'digestive',
  'endocrine',
  'reproductive_health',
  'rare_disease',
  'neurodevelopmental',
  'caregiver_support',
]
const SHOWCASE_CATEGORIES = CONDITION_CATEGORIES.filter((c) =>
  SHOWCASE_CATEGORY_VALUES.includes(c.value),
)

const FEATURES = [
  {
    icon: HeartHandshake,
    title: 'A community for every condition',
    description:
      'Physical or mental, common or rare, lifelong or short-term. If you don’t see yours yet, you can start it.',
    className: 'lg:col-span-2',
  },
  {
    icon: MessagesSquare,
    title: 'Real conversations, in real time',
    description:
      'Threaded discussions that stay easy to follow, plus direct messages when you want to talk one-on-one.',
  },
  {
    icon: BarChart3,
    title: 'Questions, polls and reviews',
    description:
      'Ask the community, run a quick poll, or review a treatment, medication, doctor or hospital.',
  },
  {
    icon: Stethoscope,
    title: 'Personal health tracker',
    description:
      'Log symptoms, mood and energy, and see how things trend over weeks — private to you.',
  },
  {
    icon: ListChecks,
    title: 'Symptom checker',
    description:
      'Describe what you’re experiencing and find communities of people with similar symptoms. A starting point, never a diagnosis.',
    className: 'lg:col-span-2',
  },
]

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create a free account',
    text: 'Pick a username — no real name required. Or just browse anonymously first.',
  },
  {
    icon: Users,
    title: 'Join your communities',
    text: 'Find circles for your conditions. Comorbidity is the norm, so join as many as you need.',
  },
  {
    icon: HeartHandshake,
    title: 'Share, ask, support',
    text: 'Post, comment, vote and chat with people who don’t need anything explained.',
  },
]

const PRINCIPLES = [
  'Browse anonymously — no account needed to read',
  'Control who sees your age, diagnosis and profile',
  'Block anyone, report anything, moderators review it',
  'Peer support only — we never pretend to give medical advice',
]

const NAV_LINKS = [
  { to: '/communities', label: 'Communities' },
  { to: '/symptom-checker', label: 'Symptom checker' },
  { to: '/resources', label: 'Resources' },
]

const FOOTER_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/communities', label: 'Communities' },
      { to: '/search', label: 'Search' },
      { to: '/resources', label: 'Resources' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { to: '/symptom-checker', label: 'Symptom checker' },
      { to: '/tracker', label: 'Health tracker' },
      { to: '/communities/new', label: 'Start a community' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/signup', label: 'Create account' },
      { to: '/login', label: 'Sign in' },
      { to: '/forgot-password', label: 'Reset password' },
    ],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-balance text-base text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

/** Static, decorative product preview for the hero. Not real data. */
function HeroPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none">
      <div className="absolute -inset-10 -z-10 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-10 -right-6 -z-10 h-48 w-48 rounded-full bg-accent/25 blur-3xl" />

      <div className="rounded-2xl border border-border bg-surface/90 p-5 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-400 to-indigo-600 font-display text-xs font-bold text-white">
            L
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-foreground">
              Lupus Warriors
            </span>
            <span className="text-xs text-muted-foreground">
              Community member · 2h ago
            </span>
          </div>
          <span className="ml-auto rounded-full bg-success/12 px-2.5 py-0.5 text-xs font-medium text-success ring-1 ring-inset ring-success/25">
            Success story
          </span>
        </div>
        <p className="mt-3 font-display text-[17px] font-semibold leading-snug text-foreground">
          Six months into remission — here’s what actually helped me
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Pacing, a symptom diary, and finally feeling heard by my rheumatologist…
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-surface-sunken px-2.5 py-1 font-semibold text-primary">
            <ChevronUp className="h-3.5 w-3.5" /> 412
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
            <MessageSquare className="h-3.5 w-3.5" /> 58 comments
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute -right-4 -top-6 hidden rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 shadow-lg sm:block"
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="font-medium text-foreground">3 people replying now</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative -mt-3 ml-8 mr-[-1rem] rounded-2xl border border-border bg-surface-raised p-4 shadow-lg sm:ml-16"
      >
        <div className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-400 to-cyan-600 text-xs font-semibold text-white">
            J
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-foreground">
              Reply from someone who gets it
            </span>
            <span className="text-sm text-muted-foreground">
              The symptom diary changed everything for me too. Thank you for sharing 💛
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function LandingPage() {
  const { data: communities, isLoading } = useCommunities()
  const showcaseCommunities = communities?.slice(0, 6) ?? []

  const stats = [
    {
      value: communities ? communities.length.toLocaleString() : '—',
      label: 'Active communities',
    },
    { value: CONDITION_CATEGORIES.length.toString(), label: 'Condition categories' },
    { value: 'Real-time', label: 'Chat & replies' },
    { value: '$0', label: 'Free to join' },
  ]

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Helmet>
        <title>CareCircle — find people who understand what you're going through</title>
        <meta
          name="description"
          content="CareCircle is a community platform for people living with illness — physical or mental, chronic, acute, or rare. Ask questions, share experiences, and connect with people who understand."
        />
      </Helmet>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 md:px-6">
          <Link to="/" aria-label="CareCircle home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="h-9 px-4">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="bg-dot-grid pointer-events-none absolute inset-0"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[60rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,var(--glow),transparent_65%)]"
          />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 px-4 pb-20 pt-16 md:px-6 md:pt-24 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
            <div className="flex flex-col items-center gap-7 text-center lg:items-start lg:text-left">
              <motion.span
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                For every illness — chronic, acute, mental or rare
              </motion.span>
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ duration: 0.45, delay: 0.06 }}
                className="font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.6rem]"
              >
                Find people who <span className="text-brand-gradient">understand</span>{' '}
                what you&apos;re going through.
              </motion.h1>
              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="max-w-xl text-balance text-lg leading-relaxed text-muted-foreground"
              >
                CareCircle is a community platform for people living with illness, in all
                its forms. Ask questions, share what&apos;s worked, and connect with
                people who get it — without explaining from scratch.
              </motion.p>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
              >
                <Button asChild size="lg" variant="brand" className="w-full sm:w-auto">
                  <Link to="/signup">
                    Join CareCircle — it&apos;s free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to="/communities">Browse communities</Link>
                </Button>
              </motion.div>
              <motion.ul
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ duration: 0.45, delay: 0.24 }}
                className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start"
              >
                {['Free to join', 'Browse anonymously', 'Moderated & safe'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ),
                )}
              </motion.ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <HeroPreview />
            </motion.div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-border bg-surface/50">
          <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-border px-4 md:grid-cols-4 md:divide-x md:px-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 py-8">
                <dt className="order-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="order-1 font-display text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Categories */}
        <section className="py-24">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <SectionHeading
              eyebrow="Every kind of health journey"
              title="Not just chronic illness"
              description="Autoimmune, cancer, mental health, rare disease, caregiving and more — browse by category to find your circle."
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {SHOWCASE_CATEGORIES.map((category, i) => (
                <motion.div
                  key={category.value}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
                >
                  <Link
                    to={`/communities?category=${category.value}`}
                    className="group flex h-full items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <category.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium leading-snug text-foreground">
                      {category.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link
                to="/communities"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                See all {CONDITION_CATEGORIES.length} categories
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features bento */}
        <section className="border-t border-border bg-surface-sunken/60 py-24">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <SectionHeading
              eyebrow="Everything in one place"
              title={
                <>
                  Built for the way people{' '}
                  <span className="text-brand-gradient">actually</span> cope
                </>
              }
              description="The community structure of a forum, the immediacy of chat, and tools designed around living with a condition."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                  className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xs transition-shadow hover:shadow-lg ${feature.className ?? ''}`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                  />
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="relative flex flex-col gap-1.5">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-primary/25 bg-primary/[0.07] p-6"
              >
                <Eye className="h-6 w-6 text-primary" aria-hidden="true" />
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Look around first
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Read posts and explore communities with no account at all.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Communities */}
        <section className="py-24">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <SectionHeading
              eyebrow="Communities"
              title="A circle for whatever you’re navigating"
              description={
                communities
                  ? `${communities.length} communities and counting — and anyone can propose a new one.`
                  : 'Browse communities built around specific conditions.'
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              {showcaseCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Button asChild variant="outline">
                <Link to="/communities">
                  View all{communities ? ` ${communities.length}` : ''} communities
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it works + safety */}
        <section className="border-t border-border bg-surface-sunken/60 py-24">
          <div className="mx-auto grid w-full max-w-6xl gap-16 px-4 md:px-6 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                How it works
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Three steps to your circle
              </h2>
              <ol className="mt-10 flex flex-col gap-8">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="relative flex gap-5">
                    {i < STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-6 top-14 h-[calc(100%-1.5rem)] w-px bg-linear-to-b from-border-strong to-transparent"
                      />
                    )}
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-primary shadow-sm">
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-xs font-semibold text-subtle-foreground">
                        Step {i + 1}
                      </span>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-md md:p-10">
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
              />
              <ShieldCheck
                className="relative h-10 w-10 text-primary"
                aria-hidden="true"
              />
              <h2 className="relative mt-5 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Safe by design, private on your terms
              </h2>
              <p className="relative mt-3 text-muted-foreground">
                Health is personal. CareCircle is built so you decide exactly how much of
                your story to share — and with whom.
              </p>
              <ul className="relative mt-8 flex flex-col gap-4">
                {PRINCIPLES.map((principle) => (
                  <li key={principle} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="text-foreground">{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-24 md:px-6">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand-gradient-deep px-6 py-16 text-center shadow-lg md:px-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(255_255_255/0.25),transparent_45%)]"
            />
            <div className="relative flex flex-col items-center gap-5">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                Ready to find your circle?
              </h2>
              <p className="max-w-lg text-base text-white/85">
                It takes less than a minute to create an account, and you can stay as
                private or as open as you&apos;d like.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-slate-900 shadow-lg hover:bg-white/90"
                >
                  <Link to="/signup">
                    Create your free account <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/15 hover:text-white"
                >
                  <Link to="/communities">Explore first</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface-sunken/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-6">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              A community for people living with illness, in all its forms, to find others
              who understand.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {column.links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-subtle-foreground md:flex-row md:items-center md:justify-between md:px-6">
            <p>© {new Date().getFullYear()} CareCircle. Built with care.</p>
            <p>
              CareCircle offers peer support, not medical advice. In an emergency, contact
              your local emergency services.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
