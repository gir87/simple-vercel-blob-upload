import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'

const WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 10 // failed attempts per IP per window

// Module-level state: persists across requests on a warm instance, but
// resets on cold start and isn't shared across concurrent instances —
// best-effort throttling, not a hard guarantee.
const attempts = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  attempts.set(ip, timestamps)
  return timestamps.length >= MAX_ATTEMPTS
}

function recordFailure(ip: string) {
  const timestamps = attempts.get(ip) ?? []
  timestamps.push(Date.now())
  attempts.set(ip, timestamps)
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

function safeEqual(a: string, b: string): boolean {
  const bufA = createHash('sha256').update(a).digest()
  const bufB = createHash('sha256').update(b).digest()
  return timingSafeEqual(bufA, bufB) // both always 32 bytes — never throws
}

export async function POST(request: Request): Promise<NextResponse> {
  const ip = clientIp(request)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(WINDOW_MS / 1000) } },
    )
  }

  const { passphrase } = await request.json()

  if (!passphrase || !safeEqual(String(passphrase), process.env.PASSPHRASE ?? '')) {
    recordFailure(ip)
    return NextResponse.json({ error: 'Incorrect passphrase.' }, { status: 401 })
  }

  const token = createHash('sha256').update(passphrase as string).digest('hex')

  const response = NextResponse.json({ ok: true })
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
