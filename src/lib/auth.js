// Sign-up / sign-in. There is no backend in this app yet, so accounts live in
// this browser's localStorage — enough to build and test the whole flow. Every
// network-shaped call is async and throws AuthError, so swapping this module
// for a real API (and real Google / Microsoft / GitHub OAuth redirects in
// signInWithProvider) won't change the page that calls it.

const ACCOUNTS_KEY = 'devspace-accounts'
const SESSION_KEY = 'devspace-session'
const PBKDF2_ITERATIONS = 150_000

export const PROVIDERS = [
  { id: 'google', label: 'Google' },
  { id: 'microsoft', label: 'Microsoft' },
  { id: 'github', label: 'GitHub' },
]

export const MIN_PASSWORD_LENGTH = 8

export class AuthError extends Error {
  constructor(message, field = null) {
    super(message)
    this.name = 'AuthError'
    this.field = field
  }
}

export const normalizeEmail = (email = '') => email.trim().toLowerCase()

export function validateEmail(email = '') {
  const value = normalizeEmail(email)
  if (!value) return 'Enter your email address.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'That doesn’t look like an email address.'
  return null
}

export function validatePassword(password = '', { creating = false } = {}) {
  if (!password) return 'Enter your password.'
  if (creating && password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  return null
}

export function validateConfirmPassword(password = '', confirmPassword = '') {
  if (!confirmPassword) return 'Type your password again to confirm it.'
  return password === confirmPassword ? null : 'Passwords don’t match.'
}

// Field-keyed errors for a whole form, so the page can show them all at once.
// The name is collected later, in onboarding, so sign-up only needs credentials.
export function validateAuthForm({ mode, email, password, confirmPassword }) {
  const errors = {}
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  const passwordError = validatePassword(password, { creating: mode === 'signup' })
  if (passwordError) errors.password = passwordError
  if (mode === 'signup' && !passwordError) {
    const confirmError = validateConfirmPassword(password, confirmPassword)
    if (confirmError) errors.confirmPassword = confirmError
  }
  return errors
}

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage blocked (private window): the session just won't survive a reload.
  }
}

const toHex = (bytes) => [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
const fromHex = (hex) => Uint8Array.from(hex.match(/.{2}/g) ?? [], (pair) => parseInt(pair, 16))

async function hashPassword(password, saltHex = toHex(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromHex(saltHex), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256)
  return { salt: saltHex, hash: toHex(bits) }
}

const makeSession = ({ id, name, email, provider }) => ({ id, name, email, provider, signedInAt: Date.now() })

function startSession(account) {
  const session = makeSession(account)
  writeJson(SESSION_KEY, session)
  return session
}

export function getSession() {
  return readJson(SESSION_KEY, null)
}

export function signOut() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing to clear.
  }
}

export async function signUpWithEmail({ email, password, confirmPassword }) {
  const errors = validateAuthForm({ mode: 'signup', email, password, confirmPassword })
  const [field] = Object.keys(errors)
  if (field) throw new AuthError(errors[field], field)

  const accounts = readJson(ACCOUNTS_KEY, [])
  const normalized = normalizeEmail(email)
  if (accounts.some((account) => account.email === normalized)) {
    throw new AuthError('An account with this email already exists. Try signing in instead.', 'email')
  }

  const { salt, hash } = await hashPassword(password)
  const account = { id: crypto.randomUUID(), name: '', email: normalized, provider: 'email', salt, hash }
  writeJson(ACCOUNTS_KEY, [...accounts, account])
  return startSession(account)
}

export async function signInWithEmail({ email, password }) {
  const errors = validateAuthForm({ mode: 'signin', email, password })
  const [field] = Object.keys(errors)
  if (field) throw new AuthError(errors[field], field)

  const normalized = normalizeEmail(email)
  const account = readJson(ACCOUNTS_KEY, []).find((candidate) => candidate.email === normalized && candidate.provider === 'email')
  // One message for "no such account" and "wrong password" so the form can't
  // be used to discover which emails are registered.
  const rejected = new AuthError('Email or password is incorrect.', 'password')
  if (!account) throw rejected
  const { hash } = await hashPassword(password, account.salt)
  if (hash !== account.hash) throw rejected
  return startSession(account)
}

// Placeholder for the OAuth redirect: a real version sends the browser to the
// provider and finishes in a callback route. Until there is a server to hold a
// client secret, this mints a clearly-labelled local account so the rest of the
// app can be built against a signed-in user.
export async function signInWithProvider(providerId) {
  const provider = PROVIDERS.find((candidate) => candidate.id === providerId)
  if (!provider) throw new AuthError('That sign-in option isn’t available.')

  await new Promise((resolve) => window.setTimeout(resolve, 700))
  const accounts = readJson(ACCOUNTS_KEY, [])
  const existing = accounts.find((account) => account.provider === provider.id)
  if (existing) return startSession(existing)

  const account = {
    id: crypto.randomUUID(),
    name: `${provider.label} learner`,
    email: `${provider.id}-demo@devspace.local`,
    provider: provider.id,
  }
  writeJson(ACCOUNTS_KEY, [...accounts, account])
  return startSession(account)
}
