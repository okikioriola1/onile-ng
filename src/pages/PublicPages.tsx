import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Home,
  Landmark,
  MapPin,
  ShieldCheck,
  Star,
  Target,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { completionBadgeColor, filterListings } from '../lib/business'
import { cn, formatCurrency } from '../lib/utils'
import { useAppStore, useCurrentUser } from '../store/useAppStore'
import { Badge, Button, Card, EmptyState, Input, PageSection, ProgressBar, Select } from '../components/ui'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const propertyPreview = [
  {
    name: 'Lekki Heights',
    location: 'Lekki, Lagos',
    price: '₦45,000,000',
    status: 'Completed',
    tone: 'completed' as const,
  },
  {
    name: 'Gwarinpa Terrace',
    location: 'Gwarinpa, Abuja',
    price: '₦38,500,000',
    status: 'Off-Plan',
    tone: 'off-plan' as const,
  },
  {
    name: 'GRA Residence',
    location: 'GRA, Port Harcourt',
    price: '₦32,000,000',
    status: 'Completed',
    tone: 'completed' as const,
  },
]

const trustPillars = [
  {
    title: 'Verified Listings Only',
    body: 'Every public home has passed document and ownership checks before it appears in the marketplace.',
    icon: ShieldCheck,
  },
  {
    title: 'KYC-Verified Users',
    body: 'Buyers and sellers move through a structured identity and consent workflow before deeper actions unlock.',
    icon: CheckCircle,
  },
  {
    title: 'Partner Bank Integration',
    body: 'Savings accounts, mandate checks, and offer workflows are all designed around a connected mortgage-bank relationship.',
    icon: Landmark,
  },
  {
    title: 'Full Audit Trail',
    body: 'Each state change has an owner, a note, and a timeline so nobody gets lost in the process.',
    icon: Clock,
  },
]

const testimonials = [
  {
    quote: 'I expected weeks of silence, but my offer came through in four days and the updates made sense every step of the way.',
    name: 'Chidi A.',
    city: 'Lagos',
  },
  {
    quote: 'As a seller, it finally felt like I was dealing with buyers who were actually ready and a process that respected my time.',
    name: 'Ngozi F.',
    city: 'Abuja',
  },
  {
    quote: 'Being self-employed usually makes everything harder. Onilé made the documents clearer and the savings piece surprisingly motivating.',
    name: 'Emeka O.',
    city: 'Port Harcourt',
  },
]

const faqItems = [
  {
    question: 'Who is Onilé for?',
    answer:
      'Onilé is designed for buyers, sellers, and operations teams who need a clearer, verified path through property discovery, savings, and mortgage origination.',
  },
  {
    question: 'Is my savings account a real bank account?',
    answer:
      'Within this demo it is simulated, but the product experience is designed around a real partner-bank-linked savings account flow.',
  },
  {
    question: 'How long does it take to get a mortgage offer?',
    answer:
      'The experience is designed around an average offer turnaround of 5 business days once the required documents and affordability details are complete.',
  },
  {
    question: 'What documents do I need to apply?',
    answer:
      'Required documents depend on your role and employment type, but typically include identity, proof of address, income evidence, and any property-linked documents needed for the transaction.',
  },
  {
    question: 'Can I save without applying for a mortgage?',
    answer:
      'Yes. Savings goals are meant to work independently, so users can start building toward a deposit, fees, or any housing goal before applying.',
  },
  {
    question: 'How are properties verified?',
    answer:
      'Properties go through document review, ownership checks, and platform verification before being marked as public and mortgage-ready.',
  },
  {
    question: 'What happens after my offer is accepted?',
    answer:
      'The workflow moves into mandate validation and approval readiness, then disbursement checks are completed before funds are released.',
  },
  {
    question: 'Is Onilé a bank or a lender?',
    answer:
      'No. Onilé is a mortgage origination and workflow platform that works with a licensed partner bank. It is not the lender of record.',
  },
]

export function HomePage() {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const [openFaq, setOpenFaq] = useState<string | null>(faqItems[0]?.question ?? null)

  return (
    <div className="bg-sage-50">
      <HeroSection shouldReduceMotion={shouldReduceMotion} />
      <StatsBar shouldReduceMotion={shouldReduceMotion} />
      <HowItWorksSection shouldReduceMotion={shouldReduceMotion} />
      <MarketplacePreviewSection shouldReduceMotion={shouldReduceMotion} />
      <SavingsFeatureSection shouldReduceMotion={shouldReduceMotion} />
      <AudienceSection shouldReduceMotion={shouldReduceMotion} />
      <TrustPillarsSection shouldReduceMotion={shouldReduceMotion} />
      <TestimonialsSection shouldReduceMotion={shouldReduceMotion} />
      <FaqSection
        shouldReduceMotion={shouldReduceMotion}
        openFaq={openFaq}
        onToggle={(question) => setOpenFaq((current) => (current === question ? null : question))}
      />
      <FinalCtaSection shouldReduceMotion={shouldReduceMotion} />
      <FooterSection />
    </div>
  )
}

function HeroSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <section className="bg-sage-50">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center"
        >
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-gold-500">
            Nigeria&apos;s Verified Mortgage Platform
          </p>
          <h1 className="max-w-2xl text-5xl font-bold leading-[0.95] text-sage-900 sm:text-6xl lg:text-7xl">
            Own your home. The right way.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-body">
            Onilé connects you to verified properties, a bank-linked savings account, and a mortgage offer in
            5 business days — all without leaving your phone.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/marketplace"
              className="inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3.5 text-sm font-semibold text-sage-900 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-gold-400"
            >
              Browse Properties
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-sage-900 px-6 py-3.5 text-sm font-semibold text-sage-900 transition-colors duration-200 hover:bg-sage-900 hover:text-warm-white"
            >
              How It Works
            </a>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm text-body sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <TrustBadge icon={ShieldCheck} label="Verified Listings" />
            <TrustBadge icon={Clock} label="Offer in 5 Days" />
            <TrustBadge icon={Landmark} label="Bank-Linked Savings" />
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: 1,
                  y: [0, -10, 0],
                }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                  y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                }
          }
          className="relative flex items-center justify-center lg:justify-end"
        >
          <div className="absolute inset-8 rounded-[32px] bg-[radial-gradient(circle_at_top,#d4a85333,transparent_55%),radial-gradient(circle_at_bottom_left,#3a7a6822,transparent_50%)] blur-2xl" />
          <div className="relative w-full max-w-[540px] rotate-1 rounded-[28px] border border-sage-100 bg-warm-white p-6 shadow-xl">
            <div className="rounded-[24px] border border-sage-100 bg-sage-50 p-4">
              <div className="mb-4 h-44 rounded-[22px] bg-[linear-gradient(135deg,#5A8A6F_0%,#3A7A68_45%,#1F4A35_100%)]" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-sage-900">Lekki Heights</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-body">
                    <MapPin size={15} className="text-sage-700" />
                    Lekki, Lagos
                  </p>
                </div>
                <Badge className="bg-sage-700/10 text-sage-700">Mortgage Ready</Badge>
              </div>
              <p className="mt-4 text-2xl font-bold text-sage-900">₦45,000,000</p>
            </div>

            <div className="mt-5 rounded-[24px] border border-sage-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-sage-900">Home Deposit Goal</p>
                <span className="text-sm font-semibold text-gold-500">62%</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-sage-50">
                <div className="h-full w-[62%] rounded-full bg-gold-500" />
              </div>
              <p className="mt-3 text-sm text-body">₦3,100,000 saved toward ₦5,000,000</p>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-[24px] border border-sage-100 bg-sage-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-sage-900">Application Status</p>
                <p className="text-sm text-body">Mortgage package in review</p>
              </div>
              <Badge className="bg-amber-100 text-amber-800">Under Review</Badge>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StatsBar({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  const stats = [
    { value: 500, suffix: '+', label: 'Verified Properties' },
    { value: 5, suffix: ' Days', label: 'Average Offer Time' },
    { value: 2.4, prefix: '₦', suffix: 'B+', label: 'Mortgages Processed', decimals: 1 },
    { value: 92, suffix: '%', label: 'Repayment Success Rate' },
  ]

  return (
    <section className="bg-sage-900">
      <div className="mx-auto grid max-w-[1320px] gap-4 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              'flex flex-col items-center justify-center gap-2 px-4 py-3 text-center md:py-2',
              index < stats.length - 1 ? 'md:border-r md:border-white/15' : '',
            )}
          >
            <AnimatedCountStat {...stat} shouldReduceMotion={shouldReduceMotion} />
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorksSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  const steps = [
    {
      number: '01',
      title: 'Register, verify, and open savings',
      body: 'Create your account, complete KYC once, and get a bank-linked savings account automatically created.',
      icon: ShieldCheck,
    },
    {
      number: '02',
      title: 'Browse verified mortgage-ready homes',
      body: 'Explore properties that have already passed verification so you can focus on homes that are truly financeable.',
      icon: Home,
    },
    {
      number: '03',
      title: 'Submit once and receive your offer',
      body: 'Upload your documents a single time and move toward a mortgage offer in 5 business days.',
      icon: FileText,
    },
  ]

  return (
    <section id="how-it-works" className="bg-warm-white">
      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          title="Your journey to home ownership, simplified."
          subtitle="Clarity first. Each step is designed to remove the confusion that usually slows people down."
        />
        <div className="mt-12 flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="flex flex-1 flex-col lg:flex-row lg:items-center">
                <motion.div
                  variants={fadeUp}
                  initial={shouldReduceMotion ? false : 'hidden'}
                  whileInView={shouldReduceMotion ? undefined : 'visible'}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 rounded-[28px] border border-sage-100 bg-sage-50 p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-lg font-bold text-sage-500">
                      {step.number}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/12 text-gold-500">
                      <Icon size={20} />
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-sage-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-body">{step.body}</p>
                </motion.div>
                {index < steps.length - 1 ? (
                  <div className="flex items-center justify-center py-2 lg:px-5">
                    <ArrowRight className="text-gold-500" size={22} />
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function MarketplacePreviewSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <section className="bg-sage-50">
      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          title="Browse mortgage-ready homes across Nigeria."
          subtitle="A preview of the kind of verified inventory Onilé is designed to surface clearly and confidently."
        />
        <div className="mt-12 flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {propertyPreview.map((property, index) => (
            <motion.div
              key={property.name}
              variants={fadeUp}
              initial={shouldReduceMotion ? false : 'hidden'}
              whileInView={shouldReduceMotion ? undefined : 'visible'}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-[280px] md:min-w-0"
            >
              <Card className="overflow-hidden rounded-2xl p-0 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="h-48 rounded-t-2xl bg-[linear-gradient(135deg,#d7e6dc_0%,#5A8A6F_45%,#1F4A35_100%)]" />
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xl font-bold text-sage-900">{property.name}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-body">
                      <MapPin size={16} className="text-sage-700" />
                      {property.location}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-sage-900">{property.price}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={property.tone === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                      {property.status}
                    </Badge>
                    <Badge className="bg-sage-700/12 text-sage-700">Mortgage Ready</Badge>
                  </div>
                  <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-sage-700 transition-colors hover:text-sage-900">
                    View Property
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-sage-700 transition-colors hover:text-sage-900">
            See All Properties
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function SavingsFeatureSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(cardRef, { once: true, amount: 0.45 })

  return (
    <section className="bg-warm-white">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <SectionHeading
            title="Start saving toward your home today."
            subtitle="Your savings account is part of the journey from day one, not an afterthought after approval."
            align="left"
          />
          <p className="mt-6 max-w-xl text-base leading-8 text-body">
            Onilé is designed around a bank-linked savings experience so buyers can start building toward a deposit,
            legal fees, or any home-related goal in one clear place.
          </p>
          <div className="mt-8 space-y-4">
            {[
              'Bank-linked account opened in minutes',
              'Set goals for deposit, legal fees, or any purpose',
              'Save independently — no mortgage required',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle size={20} className="mt-0.5 text-gold-500" />
                <p className="text-sm leading-7 text-body">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3.5 text-sm font-semibold text-sage-900 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-gold-400"
            >
              Open Your Savings Account
            </Link>
          </div>
        </div>

        <div ref={cardRef} className="flex items-center justify-center">
          <div className="w-full max-w-[520px] rounded-[28px] border border-sage-100 bg-warm-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/12 text-gold-500">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-lg font-bold text-sage-900">Home Deposit Goal</p>
                  <p className="text-sm text-body">Bank-linked savings progress</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gold-500">62%</span>
            </div>

            <div className="mt-6 h-3 rounded-full bg-sage-50">
              <motion.div
                initial={shouldReduceMotion ? false : { width: 0 }}
                animate={shouldReduceMotion ? { width: '62%' } : inView ? { width: '62%' } : { width: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gold-500"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-sage-900">Saved: ₦3,100,000</span>
              <span className="text-body">Target: ₦5,000,000</span>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold text-sage-900 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-gold-400"
            >
              Top Up
            </button>

            <div className="mt-7 space-y-3 border-t border-sage-100 pt-5">
              {[
                { label: 'Salary sweep', date: '13 May 2026', amount: '₦450,000' },
                { label: 'Manual top-up', date: '09 May 2026', amount: '₦250,000' },
                { label: 'Savings transfer', date: '03 May 2026', amount: '₦180,000' },
              ].map((item) => (
                <div key={item.date + item.amount} className="flex items-center justify-between gap-4 rounded-2xl bg-sage-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-sage-900">{item.label}</p>
                    <p className="text-xs text-body">{item.date}</p>
                  </div>
                  <p className="text-sm font-semibold text-sage-900">{item.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AudienceSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <section className="bg-sage-900">
      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            id="for-buyers"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -40 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[28px] border border-sage-500/30 bg-sage-500/20 p-8"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/12 text-gold-500">
              <Home size={24} />
            </div>
            <h3 className="mt-6 text-3xl font-bold text-warm-white">Find your next home with confidence.</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-sage-100">
              Save toward your deposit, browse mortgage-ready listings, and move through one clear application flow
              instead of guessing what comes next.
            </p>
            <div className="mt-8">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full bg-gold-500 px-6 py-3.5 text-sm font-semibold text-sage-900 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-gold-400"
              >
                Start as a Buyer
              </Link>
            </div>
          </motion.div>

          <motion.div
            id="for-sellers"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 40 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[28px] border border-sage-500/30 bg-sage-500/20 p-8"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/12 text-gold-500">
              <Home size={24} />
            </div>
            <h3 className="mt-6 text-3xl font-bold text-warm-white">List your property. Reach finance-ready buyers.</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-sage-100">
              Show up with verified documentation, clearer listing confidence, and a structured path toward disbursement
              instead of fragmented buyer follow-up.
            </p>
            <div className="mt-8">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-full border border-gold-500 px-6 py-3.5 text-sm font-semibold text-gold-500 transition-colors duration-200 hover:bg-gold-500 hover:text-sage-900"
              >
                List Your Property
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function TrustPillarsSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <section className="bg-sage-50">
      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          title="Built on verification. Backed by trust."
          subtitle="Trust should not be a vague claim. It should be visible in how listings, people, bank connections, and decisions are handled."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {trustPillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                variants={fadeUp}
                initial={shouldReduceMotion ? false : 'hidden'}
                whileInView={shouldReduceMotion ? undefined : 'visible'}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl border-l-4 border-sage-900 bg-warm-white p-6 shadow-[0_10px_25px_rgba(31,74,53,0.06)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/12 text-gold-500">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-sage-900">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-body">{pillar.body}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <section className="bg-warm-white">
      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          title="What our users are saying."
          subtitle="A credible product experience should feel human in the stories people tell about it."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              variants={fadeUp}
              initial={shouldReduceMotion ? false : 'hidden'}
              whileInView={shouldReduceMotion ? undefined : 'visible'}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="rounded-2xl bg-sage-50 p-6 shadow-sm">
                <div className="flex items-center gap-1 text-gold-500">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} size={16} className="fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-sm italic leading-7 text-body">&quot;{item.quote}&quot;</p>
                <div className="mt-6">
                  <p className="font-bold text-sage-900">{item.name}</p>
                  <p className="text-sm text-body">{item.city}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection({
  shouldReduceMotion,
  openFaq,
  onToggle,
}: {
  shouldReduceMotion: boolean
  openFaq: string | null
  onToggle: (question: string) => void
}) {
  return (
    <section className="bg-sage-50">
      <div className="mx-auto max-w-[980px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          title="Frequently asked questions."
          subtitle="A good homeownership platform should answer the questions people normally have to chase someone for."
        />
        <div className="mt-12 space-y-4">
          {faqItems.map((item) => {
            const open = openFaq === item.question
            return (
              <div key={item.question} className="overflow-hidden rounded-2xl border border-sage-100 bg-warm-white">
                <button
                  type="button"
                  onClick={() => onToggle(item.question)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-lg font-bold text-sage-900">{item.question}</span>
                  <ChevronDown
                    size={20}
                    className={cn('shrink-0 text-sage-700 transition-transform duration-300', open ? 'rotate-180' : '')}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      key="content"
                      initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-sage-100 px-6 py-5 text-sm leading-7 text-body">{item.answer}</div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FinalCtaSection({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  const pattern = `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(250,250,248,0.08)' stroke-width='1'%3E%3Cpath d='M20 20h80v80H20z'/%3E%3Cpath d='M60 20v80M20 60h80'/%3E%3C/g%3E%3C/svg%3E")`

  return (
    <section className="bg-sage-900">
      <motion.div
        initial={shouldReduceMotion ? false : 'hidden'}
        whileInView={shouldReduceMotion ? undefined : 'visible'}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        variants={fadeUp}
        className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div
          className="rounded-[36px] border border-white/10 px-6 py-10 sm:px-8 lg:px-12"
          style={{
            backgroundImage: pattern,
            backgroundColor: '#1F4A35',
          }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Your home is waiting. Let&apos;s make it happen.
            </h2>
            <p className="mt-5 text-base leading-8 text-sage-100">
              Start with verified property access, savings built into the journey, and a process designed to feel clear from day one.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-[#E1B45A] bg-[#D6A24A] px-7 py-4 text-base font-semibold shadow-[0_16px_34px_rgba(201,146,58,0.32)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#E1B45A]"
              >
                <span className="text-[#173726]">Get Started for Free</span>
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-white/70 bg-[rgba(250,250,248,0.12)] px-7 py-4 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm transition-colors duration-200 hover:bg-[rgba(250,250,248,0.18)]"
              >
                <span className="text-[#FAFAF8]">Browse Properties</span>
              </Link>
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-sage-100 sm:flex-row sm:flex-wrap sm:gap-6">
              {['No hidden fees', 'Bank-linked savings included', 'Offer in 5 business days'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-gold-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function FooterSection() {
  return (
    <footer className="bg-sage-900">
      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-gold-500">
                <Home size={18} />
              </div>
              <span className="text-2xl font-bold text-white">Onilé</span>
            </div>
            <p className="text-sm leading-7 text-sage-100">Your verified path to home ownership.</p>
            <div className="flex items-center gap-4 text-sage-500">
              <a href="#" className="transition-colors duration-200 hover:text-gold-500" aria-label="Twitter">
                <TwitterGlyph />
              </a>
              <a href="#" className="transition-colors duration-200 hover:text-gold-500" aria-label="Instagram">
                <InstagramGlyph />
              </a>
              <a href="#" className="transition-colors duration-200 hover:text-gold-500" aria-label="LinkedIn">
                <LinkedInGlyph />
              </a>
            </div>
          </div>

          <FooterLinkGroup
            title="Platform"
            links={['Marketplace', 'How It Works', 'Savings', 'Mortgage Offers']}
          />
          <FooterLinkGroup
            title="For You"
            links={['For Buyers', 'For Sellers', 'FAQ', 'Sign In']}
          />
          <FooterLinkGroup
            title="Company"
            links={['About Onilé', 'Privacy', 'Terms', 'Contact']}
          />
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-sage-500">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <p>© 2026 Onilé. All rights reserved.</p>
            <p>Licensed mortgage origination partner — not a lender of record.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLinkGroup({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sage-500">{title}</p>
      <div className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <a key={link} href="#" className="text-sm text-sage-100 transition-colors duration-200 hover:text-gold-500">
            {link}
          </a>
        ))}
      </div>
    </div>
  )
}

function TwitterGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8">
      <path d="M22 5.9c-.7.3-1.5.5-2.3.7.8-.5 1.4-1.2 1.7-2.2-.8.5-1.7.8-2.6 1-1.5-1.6-4.1-1.7-5.8-.2-1.1 1-1.6 2.5-1.3 4-3.1-.2-6-1.8-7.9-4.3-1 1.7-.5 4 1.1 5.1-.6 0-1.2-.2-1.7-.5 0 1.9 1.4 3.6 3.3 4-.6.2-1.2.2-1.8.1.5 1.6 2 2.7 3.7 2.8A7.7 7.7 0 0 1 2 18.6a10.8 10.8 0 0 0 5.9 1.7c7.1 0 11-5.9 11-11v-.5c.8-.6 1.5-1.3 2.1-2.1Z" />
    </svg>
  )
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M8 10.2V16" />
      <path d="M8 8a.8.8 0 1 1 0-1.6A.8.8 0 0 1 8 8Z" fill="currentColor" stroke="none" />
      <path d="M11.5 16v-3.2c0-1.5.8-2.4 2.1-2.4s1.9.9 1.9 2.4V16" />
      <path d="M11.5 11v-1" />
    </svg>
  )
}

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck
  label: string
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-[0_6px_18px_rgba(31,74,53,0.06)]">
      <Icon size={16} className="text-gold-500" />
      <span className="text-sm font-medium text-body">{label}</span>
    </div>
  )
}

function AnimatedCountStat({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  shouldReduceMotion,
}: {
  value: number
  label: string
  prefix?: string
  suffix?: string
  decimals?: number
  shouldReduceMotion: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0)

  useEffect(() => {
    if (!inView || shouldReduceMotion) {
      if (shouldReduceMotion) setDisplayValue(value)
      return
    }
    let frame = 0
    const duration = 1200
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const nextValue = value * progress
      setDisplayValue(nextValue)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, shouldReduceMotion, value])

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString()

  return (
    <div ref={ref}>
      <p className="text-3xl font-bold text-gold-500 sm:text-4xl">
        {prefix}
        {formatted}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-white">{label}</p>
    </div>
  )
}

function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: {
  title: string
  subtitle: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl text-left'}>
      <h2 className="text-4xl font-bold leading-tight text-sage-900 sm:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-body">{subtitle}</p>
    </div>
  )
}

export function MarketplacePage() {
  const listings = useAppStore((state) => state.listings)
  const filters = useAppStore((state) => state.marketplaceFilters)
  const setFilters = useAppStore((state) => state.setMarketplaceFilters)
  const visible = filterListings(listings, filters)

  const states = [...new Set(listings.map((listing) => listing.location.state))]
  const cities = [...new Set(listings.map((listing) => listing.location.city))]
  const types = [...new Set(listings.map((listing) => listing.propertyType))]

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <PageSection title="Public marketplace" subtitle="Verified residential inventory only, with search and mortgage readiness filters.">
        <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
          <Card className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-sage-100 bg-white px-4 py-3">
              <MapPin size={18} className="text-sage-700" />
              <input
                value={filters.search}
                onChange={(event) => setFilters({ search: event.target.value })}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search by title, city, or state"
              />
            </div>
            <Select label="State" value={filters.state} onChange={(event) => setFilters({ state: event.target.value })}>
              <option value="">All states</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
            <Select label="City" value={filters.city} onChange={(event) => setFilters({ city: event.target.value })}>
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
            <Select label="Property type" value={filters.propertyType} onChange={(event) => setFilters({ propertyType: event.target.value })}>
              <option value="">All property types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <Select label="Completion status" value={filters.completionStatus} onChange={(event) => setFilters({ completionStatus: event.target.value })}>
              <option value="">Any status</option>
              <option value="completed">Completed</option>
              <option value="off-plan">Off-Plan</option>
            </Select>
            <Select label="Mortgage eligible" value={filters.mortgageEligible} onChange={(event) => setFilters({ mortgageEligible: event.target.value })}>
              <option value="">All listings</option>
              <option value="yes">Mortgage eligible only</option>
              <option value="no">Cash only</option>
            </Select>
            <Input
              label={`Max price (${formatCurrency(filters.maxPrice)})`}
              type="range"
              min={30_000_000}
              max={300_000_000}
              step={5_000_000}
              value={filters.maxPrice}
              onChange={(event) => setFilters({ maxPrice: Number(event.target.value) })}
            />
          </Card>

          {visible.length ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {visible.map((listing) => (
                <ListingCard key={listing.id} listingId={listing.id} />
              ))}
            </div>
          ) : (
            <EmptyState title="No verified listing matches this filter set" body="Adjust the public filters to widen the result set." />
          )}
        </div>
      </PageSection>
    </div>
  )
}

function ListingCard({ listingId }: { listingId: string }) {
  const listing = useAppStore((state) => state.listings.find((item) => item.id === listingId))
  if (!listing) return null
  return (
    <Card className="overflow-hidden p-0">
      <img src={listing.images[0]} alt={listing.title} className="h-56 w-full object-cover" />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-800">Verified</Badge>
          <Badge className={completionBadgeColor(listing.completionStatus)}>{listing.completionStatus}</Badge>
          <Badge className={listing.mortgageEligible ? 'bg-sage-700/12 text-sage-700' : 'bg-slate-100 text-slate-700'}>
            {listing.mortgageEligible ? 'Mortgage Ready' : 'Cash only'}
          </Badge>
        </div>
        <div>
          <p className="text-xl font-bold text-sage-900">{listing.title}</p>
          <p className="mt-1 text-sm text-body">
            {listing.location.city}, {listing.location.state}
          </p>
        </div>
        <p className="text-sm text-body">{listing.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-sage-900">{formatCurrency(listing.price)}</p>
          <Link to={`/listing/${listing.id}`} className="rounded-full bg-sage-900 px-4 py-2 text-sm font-medium text-white">
            View details
          </Link>
        </div>
      </div>
    </Card>
  )
}

export function ListingDetailPage() {
  const { listingId } = useParams()
  const listing = useAppStore((state) => state.listings.find((item) => item.id === listingId))
  const user = useCurrentUser()
  const toggleSaveListing = useAppStore((state) => state.toggleSaveListing)
  const savings = useAppStore((state) => state.savingsAccounts.find((account) => account.userId === user?.id))
  const navigate = useNavigate()

  if (!listing || !(listing.status === 'live' && listing.verificationBadge)) {
    return (
      <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState title="Listing unavailable" body="This property is not publicly visible yet." />
      </div>
    )
  }

  const canStart = Boolean(user && user.role === 'buyer' && user.accountState === 'verified' && savings?.status === 'created')

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <Card className="overflow-hidden p-0">
            <img src={listing.images[0]} alt={listing.title} className="h-72 w-full object-cover md:h-96" />
            <div className="grid gap-4 p-4 md:grid-cols-2">
              {listing.images.slice(1).map((image) => (
                <img key={image} src={image} alt={listing.title} className="h-36 w-full rounded-[22px] object-cover" />
              ))}
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800">Verified listing</Badge>
                <Badge className={completionBadgeColor(listing.completionStatus)}>{listing.completionStatus}</Badge>
                <Badge className="bg-sage-700/12 text-sage-700">{listing.mortgageEligible ? 'Mortgage Ready' : 'Cash only'}</Badge>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-sage-900">{listing.title}</h2>
                <p className="mt-2 text-sm text-body">
                  {listing.location.city}, {listing.location.state}
                </p>
              </div>
              <p className="text-3xl font-bold text-sage-900">{formatCurrency(listing.price)}</p>
            </div>

            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-sm font-medium text-sage-900">Documents-ready indicator</p>
              <div className="mt-3 space-y-3">
                {listing.documentStatus.map((document) => (
                  <div key={document.id} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-body">{document.type}</span>
                    <Badge className={document.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}>
                      {document.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-dashed border-sage-100 px-5 py-4">
              <p className="text-sm font-medium text-sage-900">Location map placeholder</p>
              <p className="mt-2 text-sm text-body">Map integration is mocked for the frontend demo. Verified coordinates can be wired later.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  if (!user) {
                    navigate('/auth')
                    return
                  }
                  toggleSaveListing(user.id, listing.id)
                }}
              >
                Save listing
              </Button>
              <Button
                disabled={!listing.mortgageEligible}
                onClick={() => {
                  if (!user) {
                    navigate('/auth')
                    return
                  }
                  if (!canStart) {
                    navigate('/buyer')
                    return
                  }
                  navigate(`/buyer/apply/${listing.id}`)
                }}
              >
                Apply for mortgage
              </Button>
            </div>
            {!user ? <p className="text-sm text-body">Both save and apply actions require sign-in.</p> : null}
            {user && !canStart ? (
              <p className="text-sm text-amber-700">
                Buyer applications open only to verified buyers with a created partner-bank savings account.
              </p>
            ) : null}
          </Card>
        </div>

        <PageSection title="Property narrative" subtitle="Seller metadata is intentionally visible before login.">
          <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            <Card className="space-y-4">
              <p className="text-[15px] leading-7 text-body">{listing.description}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-body">Verification</p>
                  <p className="font-semibold text-sage-900">{listing.sellerInfo.verifiedLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-body">Interest count</p>
                  <p className="font-semibold text-sage-900">{listing.buyerInterestCount} buyers</p>
                </div>
              </div>
              {listing.milestoneChecklist?.length ? (
                <div className="space-y-3 rounded-[24px] bg-sage-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sage-900">Off-plan milestone checklist</p>
                    <span className="text-sm text-body">
                      {listing.milestoneChecklist.filter((item) => item.done).length}/{listing.milestoneChecklist.length}
                    </span>
                  </div>
                  <ProgressBar value={(listing.milestoneChecklist.filter((item) => item.done).length / listing.milestoneChecklist.length) * 100} />
                  {listing.milestoneChecklist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-body">{item.label}</span>
                      <Badge className={item.done ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                        {item.done ? 'Done' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>

            <Card className="space-y-3">
              <p className="text-lg font-bold text-sage-900">Seller info</p>
              <p className="text-sm text-body">{listing.sellerInfo.name}</p>
              {listing.sellerInfo.company ? <p className="text-sm text-body">{listing.sellerInfo.company}</p> : null}
              <Badge className="bg-green-100 text-green-800">{listing.sellerInfo.verifiedLabel}</Badge>
            </Card>
          </div>
        </PageSection>
      </div>
    </div>
  )
}
