import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

function tokenFor(passphrase: string): string {
  return createHash('sha256').update(passphrase).digest('hex')
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/login' || pathname.startsWith('/api/auth') || pathname.startsWith('/file/')) {
    return NextResponse.next()
  }

  const expected = tokenFor(process.env.PASSPHRASE ?? '')
  const token = request.cookies.get('auth_token')?.value

  if (token !== expected) {
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
