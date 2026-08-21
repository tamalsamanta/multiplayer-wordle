'use client'

import { useEffect, useState } from 'react'

interface JoinScreenProps {
  error: string | null
  joinRoom: (name: string) => void
}

export function JoinScreen({ error, joinRoom }: JoinScreenProps) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (error) setSubmitting(false)
  }, [error])

  const submit = () => {
    if (!name.trim()) return
    setSubmitting(true)
    joinRoom(name.trim())
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400'

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-black tracking-tight">Wordle Duel</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          You&apos;ve been invited to a game. Enter your name to join.
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Your name
          </span>
          <input
            className={inputClass}
            value={name}
            maxLength={20}
            placeholder="Player"
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </label>

        <button
          type="button"
          disabled={!name.trim() || submitting}
          onClick={submit}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {submitting ? 'Joining...' : 'Join game'}
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
