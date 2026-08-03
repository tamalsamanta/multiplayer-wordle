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
  const shareText = `Join my Wordle Duel game: ${shareUrl} (room code: ${room.code})`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

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
            <div className="flex w-full gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </a>
              <button
                type="button"
                onClick={copy}
                className="flex flex-1 items-center justify-center rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                {copied ? 'Link copied!' : 'Copy invite link'}
              </button>
            </div>
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
