import { list } from '@vercel/blob'
import PurgeButton from './purge-button'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default async function BlobList() {
  const allBlobs = []
  let cursor: string | undefined

  do {
    const result = await list({ cursor, limit: 1000 })
    allBlobs.push(...result.blobs)
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)

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
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {allBlobs.map(blob => (
            <li key={blob.url} className="flex items-center justify-between gap-4 px-6 py-3">
              <a
                href={blob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate font-mono text-sm text-zinc-700 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                {blob.pathname}
              </a>
              <span className="shrink-0 text-xs text-zinc-400">
                {formatBytes(blob.size)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
