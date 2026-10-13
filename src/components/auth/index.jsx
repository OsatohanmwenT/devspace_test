import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { AuthError, MIN_PASSWORD_LENGTH, PROVIDERS, signInWithEmail, signInWithProvider, signUpWithEmail, validateAuthForm, validateEmail } from '../../lib/auth'
import { ActionButton } from '../ui/ActionButton'

const MUTED = 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
const STRONG = 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'

const PROVIDER_ICONS = {
  google: (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.7-3.78H1.35v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.36 14.31a7.2 7.2 0 0 1 0-4.62v-3.1H1.35a12 12 0 0 0 0 10.82l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.35 6.59l4.01 3.1A7.2 7.2 0 0 1 12 4.77Z" />
    </svg>
  ),
  microsoft: (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  ),
}

function EyeIcon({ off }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  )
}

function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={shown}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className={`absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl hover:text-[#89baff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#88bdf2] ${MUTED}`}
    >
      <EyeIcon off={shown} />
    </button>
  )
}

function TextField({ label, error, hint, trailing, ...input }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className={`text-[13px] font-semibold ${STRONG}`}>{label}</label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`h-11 w-full rounded-xl border bg-[#1a1a1c] px-4 text-[15px] outline-none transition-colors placeholder:text-[#6b6b70] focus:border-[#4169e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:placeholder:text-[#a3a29d] ${STRONG} ${trailing ? 'pr-12' : ''} ${
            error ? 'border-[#ff676d]' : 'border-[#404040] [[data-theme=light]_&]:border-[#d4d4d0]'
          }`}
          {...input}
        />
        {trailing}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="m-0 text-[12px] font-medium text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className={`m-0 text-[12px] ${MUTED}`}>{hint}</p>
      ) : null}
    </div>
  )
}

export default function AuthView({ onAuthenticated, initialMode = 'signup' }) {
  const [mode, setMode] = useState(initialMode)
  // Sign-up is two cards: the email first, then the password (twice). Sign-in
  // is a single card.
  const [step, setStep] = useState('email')
  const reducedMotion = useReducedMotion()
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // 'email' while the form submits, or a provider id while its popup would be open.
  const [pending, setPending] = useState(null)
  const isSignup = mode === 'signup'
  const busy = pending !== null
  const onPasswordStep = isSignup && step === 'password'

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  const switchMode = () => {
    setMode(isSignup ? 'signin' : 'signup')
    setStep('email')
    setErrors({})
    setFormError('')
  }

  const run = async (key, action) => {
    setPending(key)
    setFormError('')
    try {
      onAuthenticated(await action())
    } catch (error) {
      if (!(error instanceof AuthError)) throw error
      if (error.field) {
        setErrors({ [error.field]: error.message })
        if (error.field === 'email') setStep('email')
      }
      else setFormError(error.message)
      setPending(null)
    }
  }

  const submit = (event) => {
    event.preventDefault()
    if (busy) return
    if (isSignup && step === 'email') {
      const emailError = validateEmail(form.email)
      setErrors(emailError ? { email: emailError } : {})
      if (!emailError) setStep('password')
      return
    }
    const found = validateAuthForm({ mode, ...form })
    setErrors(found)
    if (Object.keys(found).length) {
      // An email problem found at the last step sends them back to fix it.
      if (isSignup && found.email) setStep('email')
      return
    }
    run('email', () => (isSignup ? signUpWithEmail(form) : signInWithEmail(form)))
  }

  return (
    <main className="auth-backdrop relative grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden font-rubik">
      <header className="px-6 pt-5 max-[680px]:px-4">
        <img className="h-5 w-[135px] max-w-none" src="/assets/logo.svg" alt="Devspace" />
      </header>

      <section className="grid min-h-0 place-items-center overflow-y-auto px-4 py-4">
        <div className="relative z-10 grid w-full max-w-[560px] gap-4 rounded-3xl border border-white/10 bg-[#141416]/95 p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] backdrop-blur-md max-[480px]:p-6 [[data-theme=light]_&]:border-black/5 [[data-theme=light]_&]:bg-white/95">
          <div className="grid gap-1.5">
            <h1 className={`m-0 font-rethink-sans text-[30px] font-semibold ${STRONG}`}>
              {!isSignup ? 'Welcome back' : onPasswordStep ? 'Choose a password' : 'Create your account'}
            </h1>
            <p className={`m-0 text-[15px] ${MUTED}`}>
              {!isSignup
                ? 'Sign in to keep your streak going.'
                : onPasswordStep
                  ? 'Almost there — pick something you’ll remember.'
                  : 'Save your progress and pick up where you left off on any device.'}
            </p>
          </div>

          <form className="grid gap-3" onSubmit={submit} noValidate>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={onPasswordStep ? 'password' : 'email'}
                className="grid gap-3"
                initial={reducedMotion ? false : { opacity: 0, x: onPasswordStep ? 48 : -48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: onPasswordStep ? -48 : 48 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {onPasswordStep ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      disabled={busy}
                      className={`flex w-fit max-w-full items-center gap-1.5 rounded-lg text-[13px] font-medium hover:text-[#89baff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#88bdf2] ${MUTED}`}
                    >
                      <svg viewBox="0 0 24 24" className="size-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
                      <span className="truncate">{form.email.trim()}</span>
                    </button>
                    <TextField
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      autoFocus
                      placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                      value={form.password}
                      onChange={update('password')}
                      error={errors.password}
                      trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((shown) => !shown)} />}
                    />
                    <TextField
                      label="Confirm password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Type it again"
                      value={form.confirmPassword}
                      onChange={update('confirmPassword')}
                      error={errors.confirmPassword}
                    />
                  </>
                ) : (
                  <>
                    <TextField label="Email" name="email" type="email" autoComplete="email" autoFocus={isSignup} placeholder="you@example.com" value={form.email} onChange={update('email')} error={errors.email} />
                    {!isSignup && (
                      <TextField
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Your password"
                        value={form.password}
                        onChange={update('password')}
                        error={errors.password}
                        trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((shown) => !shown)} />}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {formError && <p role="alert" className="m-0 text-[13px] font-medium text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]">{formError}</p>}

            <ActionButton type="submit" variant="primary" disabled={busy} className="mt-1 min-h-11 w-full text-[15px] font-semibold disabled:opacity-60">
              {pending === 'email'
                ? (isSignup ? 'Creating account…' : 'Signing in…')
                : !isSignup ? 'Sign in' : onPasswordStep ? 'Create account' : 'Continue'}
            </ActionButton>
          </form>

          {!onPasswordStep && (
          <>
          <div className={`flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[.08em] ${MUTED}`} role="separator" aria-label="or continue with">
            <span className="h-px flex-1 bg-[#404040] [[data-theme=light]_&]:bg-[#e4e2dc]" />
            or
            <span className="h-px flex-1 bg-[#404040] [[data-theme=light]_&]:bg-[#e4e2dc]" />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {PROVIDERS.map((provider) => (
              <ActionButton
                key={provider.id}
                variant="neutral"
                disabled={busy}
                aria-label={`Continue with ${provider.label}`}
                aria-busy={pending === provider.id || undefined}
                onClick={() => run(provider.id, () => signInWithProvider(provider.id))}
                className="flex min-h-11 w-full items-center justify-center gap-2 px-2 text-[14px] font-medium disabled:opacity-60"
              >
                {PROVIDER_ICONS[provider.id]}
                <span className="max-[400px]:hidden">{pending === provider.id ? '…' : provider.label}</span>
              </ActionButton>
            ))}
          </div>
          </>
          )}

          <p className={`m-0 text-center text-[14px] ${MUTED}`}>
            {isSignup ? 'Already have an account?' : 'New to Devspace?'}{' '}
            <button type="button" onClick={switchMode} disabled={busy} className="font-semibold text-[#89baff] underline-offset-2 hover:underline disabled:opacity-60 [[data-theme=light]_&]:text-[#3d77eb]">
              {isSignup ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </div>
      </section>

      <footer className="relative z-10 px-6 pb-4 text-center text-[12px] leading-[1.5] text-white/70 max-[680px]:px-4">
        By continuing you agree to the Devspace Terms and Privacy Policy.
      </footer>
    </main>
  )
}
