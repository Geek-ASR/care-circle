import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Eye, HeartHandshake, MessagesSquare, ShieldCheck } from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useCommunities } from '@/features/communities/hooks/useCommunities'
import { CommunityCard } from '@/features/communities/components/CommunityCard'
import { CategoryChip } from '@/features/conditions/components/CategoryChip'
import { CONDITION_CATEGORIES } from '@/features/conditions/constants'

const SHOWCASE_CATEGORY_VALUES = [
  'autoimmune',
  'oncology',
  'mental_health',
  'cardiovascular',
  'neurological',
  'respiratory',
  'reproductive_health',
  'sensory',
  'mobility_disability',
  'neurodevelopmental',
  'sleep',
  'substance_recovery',
  'caregiver_support',
  'rare_disease',
]
const SHOWCASE_CATEGORIES = CONDITION_CATEGORIES.filter((c) =>
  SHOWCASE_CATEGORY_VALUES.includes(c.value),
)

const FEATURES = [
  {
    icon: HeartHandshake,
    title: 'A community for every condition — not just chronic ones',
    description:
      'Join spaces built around your diagnosis — physical or mental, common or rare, lifelong or short-term. From Lupus to anxiety to cancer survivorship, if you don’t see yours yet, you can start it.',
  },
  {
    icon: MessagesSquare,
    title: 'Real conversations, in real time',
    description:
      'Ask questions, share what has and hasn’t worked, and get replies as they come in — nested discussions that stay easy to follow, no matter how deep they go.',
  },
  {
    icon: Eye,
    title: 'Browse anonymously, join when ready',
    description:
      "No pressure to create an account just to look around. Read posts and explore communities freely — sign up whenever you're ready to post, vote, or save something.",
  },
  {
    icon: ShieldCheck,
    title: 'Built around your journey, on your terms',
    description:
      'Your profile can reflect your diagnosis and story as much or as little as you want. Privacy settings are yours to control, always.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  const { data: communities, isLoading } = useCommunities()
  const showcaseCommunities = communities?.slice(0, 6) ?? []

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

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 md:px-6">
          <Link to="/" className="text-base font-semibold tracking-tight text-foreground">
            CareCircle
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/communities">Browse communities</Link>
            </Button>
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--color-primary),transparent)] opacity-[0.12]"
          />
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
            <motion.span
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              For every illness — chronic, acute, mental, or rare
            </motion.span>
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
            >
              Find people who understand exactly what you&apos;re going through.
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="max-w-xl text-balance text-base text-muted-foreground md:text-lg"
            >
              CareCircle is a community platform for people living with illness, in all
              its forms. Ask questions, share what&apos;s worked, and connect with people
              who get it — without having to explain from scratch.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-col items-center gap-3 sm:flex-row"
            >
              <Button asChild size="lg">
                <Link to="/signup">Get started — it&apos;s free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/communities">Browse communities</Link>
              </Button>
            </motion.div>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-xs text-muted-foreground"
            >
              Free to join. Browse anonymously — no account required.
            </motion.p>
          </div>
        </section>

        {/* Category showcase */}
        <section className="border-t border-border py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                Not just chronic illness — every kind of health journey
              </h2>
              <p className="max-w-xl text-sm text-muted-foreground md:text-base">
                Autoimmune, cancer, mental health, sensory, developmental, caregiving, and
                more — browse by category to find your circle.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SHOWCASE_CATEGORIES.map((category) => (
                <Link key={category.value} to={`/communities?category=${category.value}`}>
                  <CategoryChip category={category} />
                </Link>
              ))}
              <Link to="/communities">
                <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-primary hover:bg-surface-hover">
                  See all categories →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Community showcase */}
        <section className="border-t border-border bg-surface/40 py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                A community for whatever you&apos;re navigating
              </h2>
              <p className="max-w-xl text-sm text-muted-foreground md:text-base">
                {communities
                  ? `${communities.length} communities and counting.`
                  : 'Browse communities built around specific conditions.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36" />
                ))}
              {showcaseCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button asChild variant="outline">
                <Link to="/communities">
                  View all{communities ? ` ${communities.length}` : ''} communities
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-surface/40 py-16">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-4 text-center md:px-6">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Ready to find your circle?
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              It takes less than a minute to create an account, and you can stay as
              private or as open as you&apos;d like.
            </p>
            <Button asChild size="lg">
              <Link to="/signup">Create your free account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center md:px-6">
          <span className="text-sm font-semibold text-foreground">CareCircle</span>
          <p className="text-xs text-muted-foreground">
            A community for people living with illness, in all its forms, to find others
            who understand.
          </p>
        </div>
      </footer>
    </div>
  )
}
