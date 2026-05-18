import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { demoCredentials } from '../lib/seed'
import { useAppStore, useCurrentUser } from '../store/useAppStore'
import type { EmploymentType, RegistrationPayload } from '../types'
import { Button, Card, Input, PageSection, Select } from '../components/ui'
import { getRoleDashboardPath, summarizeOnboardingState } from '../lib/business'

const registrationSchema = z.object({
  role: z.enum(['buyer', 'seller']),
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(8),
  residentialAddress: z.string().min(6),
  nin: z.string().min(11),
  bvn: z.string().min(11),
  employmentType: z.enum(['salaried', 'self-employed']).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
})

const onboardingSchema = z.object({
  fullLegalName: z.string().min(3),
  phone: z.string().min(8),
  email: z.string().email(),
  residentialAddress: z.string().min(6),
  nin: z.string().min(11),
  bvn: z.string().min(11),
  employmentType: z.enum(['salaried', 'self-employed']).optional(),
  terms: z.boolean().refine(Boolean, 'Required'),
  privacy: z.boolean().refine(Boolean, 'Required'),
  dataSharing: z.boolean().refine(Boolean, 'Required'),
})

export function AuthPage() {
  const login = useAppStore((state) => state.login)
  const demoLogin = useAppStore((state) => state.demoLogin)
  const registerUser = useAppStore((state) => state.registerUser)
  const navigate = useNavigate()
  const [loginMessage, setLoginMessage] = useState('')
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const registerForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { role: 'buyer', employmentType: 'salaried' },
  })

  const onLogin = loginForm.handleSubmit((values) => {
    const result = login(values.email, values.password)
    setLoginMessage(result.message)
    if (result.ok) navigate('/')
  })

  const onRegister = registerForm.handleSubmit((values) => {
    const payload = values as RegistrationPayload
    const user = registerUser(payload)
    navigate(`/auth/onboarding?user=${user.id}`)
  })

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted-teal)]">Demo access</p>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--forest)]">Sign in to a seeded role or start fresh.</h2>
        </div>

        <div className="grid gap-3">
          {demoCredentials.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => {
                const user = useAppStore.getState().users.find((item) => item.email === demo.email)
                if (user) {
                  demoLogin(user.id)
                  navigate(getRoleDashboardPath(user))
                }
              }}
              className="rounded-[24px] border border-[var(--surface-strong)] p-4 text-left transition hover:bg-[var(--surface)]"
            >
              <p className="font-medium text-[var(--forest)]">{demo.label}</p>
              <p className="mt-1 text-sm text-[var(--body)]">
                {demo.email} / {demo.password}
              </p>
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={onLogin}>
          <Input label="Email" {...loginForm.register('email')} error={loginForm.formState.errors.email?.message} />
          <Input label="Password" type="password" {...loginForm.register('password')} error={loginForm.formState.errors.password?.message} />
          <Button type="submit" className="w-full">
            Sign in
          </Button>
          {loginMessage ? <p className="text-sm text-[var(--body)]">{loginMessage}</p> : null}
        </form>
      </Card>

      <Card className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted-teal)]">Registration</p>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--forest)]">Create a new frontend-only account.</h2>
        </div>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onRegister}>
          <Select label="Role" {...registerForm.register('role')} error={registerForm.formState.errors.role?.message}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </Select>
          <Select label="Employment type" {...registerForm.register('employmentType')} error={registerForm.formState.errors.employmentType?.message}>
            <option value="salaried">Salaried</option>
            <option value="self-employed">Self-employed</option>
          </Select>
          <Input label="Full legal name" {...registerForm.register('fullName')} error={registerForm.formState.errors.fullName?.message} />
          <Input label="Email" {...registerForm.register('email')} error={registerForm.formState.errors.email?.message} />
          <Input label="Password" type="password" {...registerForm.register('password')} error={registerForm.formState.errors.password?.message} />
          <Input label="Phone" {...registerForm.register('phone')} error={registerForm.formState.errors.phone?.message} />
          <Input label="Residential address" className="sm:col-span-2" {...registerForm.register('residentialAddress')} error={registerForm.formState.errors.residentialAddress?.message} />
          <Input label="NIN" {...registerForm.register('nin')} error={registerForm.formState.errors.nin?.message} />
          <Input label="BVN" {...registerForm.register('bvn')} error={registerForm.formState.errors.bvn?.message} />
          <Button type="submit" className="sm:col-span-2">
            Create account and continue to onboarding
          </Button>
        </form>
      </Card>
    </div>
  )
}

export function OnboardingPage() {
  const user = useCurrentUser()
  const draft = useAppStore((state) => (user ? state.onboardingDrafts[user.id] : undefined))
  const upsertDraft = useAppStore((state) => state.upsertOnboardingDraft)
  const uploadDocument = useAppStore((state) => state.uploadOnboardingDocument)
  const submitOnboarding = useAppStore((state) => state.submitOnboarding)
  const navigate = useNavigate()
  const [step, setStep] = useState(draft?.currentStep ?? 0)

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullLegalName: draft?.fullLegalName ?? user?.fullName ?? '',
      phone: draft?.phone ?? user?.phone ?? '',
      email: draft?.email ?? user?.email ?? '',
      residentialAddress: draft?.residentialAddress ?? user?.residentialAddress ?? '',
      nin: draft?.nin ?? user?.nin ?? '',
      bvn: draft?.bvn ?? user?.bvn ?? '',
      employmentType: (draft?.employmentType ?? user?.employmentType) as EmploymentType | undefined,
      terms: draft?.consents.terms ?? false,
      privacy: draft?.consents.privacy ?? false,
      dataSharing: draft?.consents.dataSharing ?? false,
    },
  })

  const steps = useMemo(() => ['Profile', 'Identity', 'Consents', 'Documents', 'Submit'], [])

  if (!user || user.role === 'admin' || !draft) {
    return <Card>Onboarding is available only for buyer and seller users.</Card>
  }

  const next = async () => {
    const valid = await form.trigger()
    if (!valid) return
    const values = form.getValues()
    upsertDraft(user.id, {
      currentStep: Math.min(step + 1, steps.length - 1),
      fullLegalName: values.fullLegalName,
      phone: values.phone,
      email: values.email,
      residentialAddress: values.residentialAddress,
      nin: values.nin,
      bvn: values.bvn,
      employmentType: values.employmentType,
      consents: {
        terms: values.terms,
        privacy: values.privacy,
        dataSharing: values.dataSharing,
      },
    })
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  const prev = () => {
    upsertDraft(user.id, { currentStep: Math.max(step - 1, 0) })
    setStep((current) => Math.max(current - 1, 0))
  }

  return (
    <div className="space-y-6">
      <PageSection title="Multi-step onboarding" subtitle={summarizeOnboardingState(draft)}>
        <Card className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {steps.map((label, index) => (
              <span
                key={label}
                className={index === step ? 'rounded-full bg-[var(--muted-teal)] px-4 py-2 text-xs font-semibold text-white' : 'rounded-full bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--body)]'}
              >
                {index + 1}. {label}
              </span>
            ))}
          </div>

          <form className="grid gap-4 md:grid-cols-2">
            {(step === 0 || step === 1 || step === 2) && (
              <>
                <Input label="Full legal name" {...form.register('fullLegalName')} error={form.formState.errors.fullLegalName?.message} />
                <Input label="Phone" {...form.register('phone')} error={form.formState.errors.phone?.message} />
                <Input label="Email" {...form.register('email')} error={form.formState.errors.email?.message} />
                <Input label="Residential address" {...form.register('residentialAddress')} error={form.formState.errors.residentialAddress?.message} />
                <Input label="NIN" {...form.register('nin')} error={form.formState.errors.nin?.message} />
                <Input label="BVN" {...form.register('bvn')} error={form.formState.errors.bvn?.message} />
                <Select label="Employment type" {...form.register('employmentType')} error={form.formState.errors.employmentType?.message}>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-employed</option>
                </Select>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4 rounded-[24px] bg-[var(--surface)] p-5 md:col-span-2">
                {[
                  ['terms', 'I accept the platform terms'],
                  ['privacy', 'I consent to the privacy policy'],
                  ['dataSharing', 'I consent to sharing data with the partner bank'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 text-sm text-[var(--forest)]">
                    <input type="checkbox" {...form.register(key as 'terms' | 'privacy' | 'dataSharing')} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 md:col-span-2">
                {draft.documents.map((document) => (
                  <div key={document.id} className="rounded-[24px] border border-[var(--surface-strong)] p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-medium text-[var(--forest)]">{document.type}</p>
                        <p className="text-sm text-[var(--body)]">
                          {document.name ? `Uploaded: ${document.name}` : 'No file metadata saved yet'}
                        </p>
                      </div>
                      <label className="rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-medium text-white">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(event) => {
                            const fileName = event.target.files?.[0]?.name
                            if (fileName) uploadDocument(user.id, document.type, fileName)
                          }}
                        />
                        Upload
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 rounded-[28px] bg-[var(--surface)] p-5 md:col-span-2">
                <p className="text-sm text-[var(--body)]">
                  Your onboarding progress is stored locally and can be resumed after refresh. Submitting now moves you to KYC review and triggers the simulated bank account setup after approval.
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    submitOnboarding(user.id)
                    navigate(getRoleDashboardPath(user))
                  }}
                >
                  Submit onboarding package
                </Button>
              </div>
            )}
          </form>

          <div className="flex justify-between">
            <Button type="button" variant="ghost" disabled={step === 0} onClick={prev}>
              Previous
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={next}>
                Save and continue
              </Button>
            ) : null}
          </div>
        </Card>
      </PageSection>
    </div>
  )
}
