'use client'

import type { Feedback, GuessRow } from '@/lib/types'

const KEY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
]

const KEY_COLORS: Record<Feedback, string> = {
  correct: 'bg-green-600 text-white',
  present: 'bg-yellow-500 text-white',
  absent: 'bg-zinc-600 text-white dark:bg-zinc-800',
}

function keyState(board: GuessRow[]) {
  const map = new Map<string, { fb: Feedback; priority: number }>()
  const priority: Record<Feedback, number> = { correct: 3, present: 2, absent: 1 }

  for (const row of board) {
    for (let i = 0; i < row.guess.length; i++) {
      const letter = row.guess[i]
      const fb = row.feedback[i]
      const current = map.get(letter)
      if (!current || priority[fb] > current.priority) {
        map.set(letter, { fb, priority: priority[fb] })
      }
    }
  }
  return map
}

interface KeyboardProps {
  board: GuessRow[]
  onKey: (key: string) => void
  disabled: boolean
}

export function Keyboard({ board, onKey, disabled }: KeyboardProps) {
  const states = keyState(board)

  const keyClass = (key: string) => {
    if (key === 'Enter' || key === 'Backspace') {
      return 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
    }
    const st = states.get(key)
    return st ? KEY_COLORS[st.fb] : 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50'
  }

  const widthClass = (key: string) =>
    key === 'Enter' || key === 'Backspace'
      ? 'flex-[1.5] text-xs'
      : 'flex-1 text-sm'

  return (
    <div className="flex w-full max-w-md flex-col gap-1.5">
      {KEY_ROWS.map((row, r) => (
        <div key={r} className="flex justify-center gap-1.5">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onKey(key)}
              className={`flex h-11 items-center justify-center rounded-md font-semibold uppercase transition-colors disabled:opacity-40 sm:h-12 ${widthClass(key)} ${keyClass(key)}`}
            >
              {key === 'Backspace' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
