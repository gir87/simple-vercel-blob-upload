'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Something went wrong
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {error.digest ? `Error reference: ${error.digest}` : 'An unexpected error occurred.'}
      </p>
      <button
        onClick={() => retry()}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Try again
      </button>
    </main>
  )
}
