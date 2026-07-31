'use client'

import { useState } from 'react'

interface LobbyProps {
  error: string | null
  createRoom: (name: string) => void
  joinRoom: (code: string, name: string) => void
}

export function Lobby({ error, createRoom, joinRoom }: LobbyProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const submit = (action: 'create' | 'join') => {
    if (!name.trim()) return
    if (action === 'create') createRoom(name.trim())
    else joinRoom(code.trim(), name.trim())
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400'

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-black tracking-tight">Wordle Duel</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Two players. One word. Race to solve it — fewer guesses wins.
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
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit('create')}
          />
        </label>

        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => submit('create')}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900"
        >
          Create room
        </button>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          or
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Room code
          </span>
          <input
            className={`${inputClass} font-mono uppercase tracking-widest`}
            value={code}
            maxLength={4}
            placeholder="ABCD"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && submit('join')}
          />
        </label>

        <button
          type="button"
          disabled={!name.trim() || code.trim().length !== 4}
          onClick={() => submit('join')}
          className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Join room
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
