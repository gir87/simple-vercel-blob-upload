import { list } from '@vercel/blob'
import { notFound, redirect } from 'next/navigation'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const pathname = slug.join('/')

  const { blobs } = await list({ prefix: pathname, limit: 10 })
  const match = blobs.find(b => b.pathname === pathname)

  if (!match) notFound()

  redirect(match.url)
}
