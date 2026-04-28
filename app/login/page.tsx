'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Incorrect passphrase.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Enter passphrase
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          This page is password protected.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            placeholder="Passphrase"
            className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !passphrase}
            className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? 'Checking…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
