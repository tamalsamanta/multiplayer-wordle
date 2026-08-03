'use client'

import { useState } from 'react'
import type { Mode } from '@/lib/types'

const MODES: { id: Mode; title: string; tagline: string; description: string }[] = [
  {
    id: 'race',
    title: 'Race',
    tagline: 'One word, head to head',
    description: 'Both players race to solve the same random word. First to solve wins.',
  },
  {
    id: 'duel',
    title: 'Duel',
    tagline: 'You pick, they guess',
    description: 'Each player secretly picks a word for the other to solve. First to solve wins.',
  },
]

interface ModeSelectProps {
  onSelect: (mode: Mode) => void
}

export function ModeSelect({ onSelect }: ModeSelectProps) {
  const [mode, setMode] = useState<Mode>('race')

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-black tracking-tight">Wordle Duel</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Choose a game mode</p>
      </header>

      <div className="flex flex-col gap-3">
        {MODES.map((m) => {
          const selected = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors ${
                selected
                  ? 'border-zinc-900 ring-2 ring-zinc-900 dark:border-zinc-50 dark:ring-zinc-50'
                  : 'border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {m.title}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {m.tagline}
                </span>
                <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {m.description}
                </span>
              </div>
              <span
                className={`ml-auto mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selected
                    ? 'border-zinc-900 dark:border-zinc-50'
                    : 'border-zinc-300 dark:border-zinc-700'
                }`}
              >
                {selected && (
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-900 dark:bg-zinc-50" />
                )}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelect(mode)}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 dark:bg-zinc-50 dark:text-zinc-900"
      >
        Continue
      </button>
    </div>
  )
}
