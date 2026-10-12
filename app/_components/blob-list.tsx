import { list } from '@vercel/blob'
import PurgeButton from './purge-button'
import CopyButton from './copy-button'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function extensionOf(pathname: string): string {
  const name = pathname.split('/').pop() ?? ''
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

export default async function BlobList() {
  const allBlobs = []
  let cursor: string | undefined

  do {
    const result = await list({ cursor, limit: 1000 })
    allBlobs.push(...result.blobs)
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)

  allBlobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Stored files
          <span className="ml-2 font-normal text-zinc-400">{allBlobs.length}</span>
        </h2>
        {allBlobs.length > 0 && <PurgeButton count={allBlobs.length} />}
      </div>

      {allBlobs.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-zinc-400">No files stored yet.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 px-6 pb-6">
          {allBlobs.map(blob => {
            const ext = extensionOf(blob.pathname)
            return (
              <li key={blob.url} className="flex min-w-0 flex-col gap-1">
                <a
                  href={`/file/${blob.pathname.split('/').map(encodeURIComponent).join('/')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={blob.pathname}
                  className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 transition hover:opacity-80 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  {IMAGE_EXTENSIONS.includes(ext) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blob.url}
                      alt={blob.pathname}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-xs uppercase text-zinc-400">
                      {ext || 'file'}
                    </span>
                  )}
                </a>
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300" title={blob.pathname}>
                    {blob.pathname}
                  </span>
                  <CopyButton pathname={blob.pathname} />
                </div>
                <span className="text-xs text-zinc-400">{formatBytes(blob.size)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
