'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PurgeButton({ count }: { count: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePurge() {
    if (!confirm(`Delete all ${count} file${count === 1 ? '' : 's'}? This cannot be undone.`)) return
    setLoading(true)
    await fetch('/api/blobs', { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handlePurge}
      disabled={loading}
      className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
    >
      {loading ? 'Purging…' : 'Purge all'}
    </button>
  )
}
