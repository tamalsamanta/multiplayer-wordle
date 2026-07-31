'use client'

import type { Feedback, GuessRow } from '@/lib/types'

const CELL_COLORS: Record<Feedback, string> = {
  correct: 'bg-green-600 border-green-600',
  present: 'bg-yellow-500 border-yellow-500',
  absent: 'bg-zinc-500 border-zinc-500',
}

function Cell({
  letter,
  feedback,
}: {
  letter: string
  feedback?: Feedback
}) {
  const hasLetter = letter.length > 0
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center border-2 text-xl font-bold uppercase transition-colors sm:h-14 sm:w-14 ${
        feedback
          ? `text-white ${CELL_COLORS[feedback]}`
          : hasLetter
            ? 'border-zinc-400 text-zinc-900 dark:border-zinc-500 dark:text-zinc-50'
            : 'border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-zinc-50'
      }`}
    >
      {hasLetter ? letter : ''}
    </div>
  )
}

interface BoardProps {
  board: GuessRow[]
  maxGuesses: number
  wordLength: number
  currentGuess: string
}

export function Board({ board, maxGuesses, wordLength, currentGuess }: BoardProps) {
  const rows = []

  for (let r = 0; r < maxGuesses; r++) {
    const rowData = board[r]

    if (rowData) {
      rows.push(
        <div key={r} className="flex gap-1.5">
          {rowData.guess.split('').map((letter, i) => (
            <Cell key={i} letter={letter} feedback={rowData.feedback[i]} />
          ))}
        </div>
      )
    } else if (r === board.length) {
      rows.push(
        <div key={r} className="flex gap-1.5">
          {Array.from({ length: wordLength }).map((_, i) => (
            <Cell key={i} letter={currentGuess[i] ?? ''} />
          ))}
        </div>
      )
    } else {
      rows.push(
        <div key={r} className="flex gap-1.5">
          {Array.from({ length: wordLength }).map((_, i) => (
            <Cell key={i} letter="" />
          ))}
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex flex-col gap-1.5">{rows}</div>
    </div>
  )
}
