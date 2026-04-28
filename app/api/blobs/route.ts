import { list, del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function DELETE(): Promise<NextResponse> {
  const urls: string[] = []
  let cursor: string | undefined

  do {
    const result = await list({ cursor, limit: 1000 })
    urls.push(...result.blobs.map(b => b.url))
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)

  if (urls.length > 0) {
    await del(urls)
  }

  return NextResponse.json({ deleted: urls.length })
}
