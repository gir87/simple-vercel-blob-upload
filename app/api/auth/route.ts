import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(request: Request): Promise<NextResponse> {
  const { passphrase } = await request.json()

  if (!passphrase || passphrase !== process.env.PASSPHRASE) {
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
