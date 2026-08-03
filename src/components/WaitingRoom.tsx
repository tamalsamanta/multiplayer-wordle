'use client'

import { useState } from 'react'
import type { Room } from '@/lib/types'
import { SLOT_COLORS } from './slotStyles'

interface WaitingRoomProps {
  room: Room
  isCreator: boolean
}

export function WaitingRoom({ room, isCreator }: WaitingRoomProps) {
  const me = room.players[0]
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/?join=${room.code}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-black tracking-tight">Wordle Duel</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Waiting for your opponent to join
        </p>
      </header>

      <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {isCreator ? (
          <>
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Share this invite link
            </span>
            <code className="w-full break-all rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              {shareUrl}
            </code>
            <button
              type="button"
              onClick={copy}
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {copied ? 'Link copied!' : 'Copy invite link'}
            </button>
          </>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The host is starting the game...
          </p>
        )}
        <span className="mt-1 text-xs text-zinc-400">
          Joined as <span className="font-semibold">{me?.name}</span>
        </span>
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          {room.mode === 'race' ? 'Race' : 'Duel'} room
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <span className={`inline-block h-2.5 w-2.5 animate-pulse rounded-full ${SLOT_COLORS[0].dot}`} />
        Waiting for a challenger...
      </div>
    </div>
  )
}
