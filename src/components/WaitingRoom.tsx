'use client'

import type { Room } from '@/lib/types'
import { SLOT_COLORS } from './slotStyles'

interface WaitingRoomProps {
  room: Room
}

export function WaitingRoom({ room }: WaitingRoomProps) {
  const me = room.players[0]

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-black tracking-tight">Wordle Duel</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Waiting for your opponent to join
        </p>
      </header>

      <div className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Share this room code
        </span>
        <span className="font-mono text-5xl font-black tracking-[0.3em] text-zinc-900 dark:text-zinc-50">
          {room.code}
        </span>
        <span className="mt-1 text-xs text-zinc-400">
          Joined as <span className="font-semibold">{me?.name}</span>
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <span className={`inline-block h-2.5 w-2.5 animate-pulse rounded-full ${SLOT_COLORS[0].dot}`} />
        Waiting for a challenger...
      </div>
    </div>
  )
}
