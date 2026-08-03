'use client'

import { useState } from 'react'
import type { Room, SelfInfo, Toast } from '@/lib/types'
import { SLOT_COLORS } from './slotStyles'

interface DuelPickingProps {
  room: Room
  self: SelfInfo | null
  error: string | null
  toast: Toast | null
  pickWord: (word: string) => void
}

export function DuelPicking({ room, self, error, toast, pickWord }: DuelPickingProps) {
  const [word, setWord] = useState('')
  const mySlot = self?.slot ?? 0
  const picking = room.picking
  const myTurn = picking?.myTurn ?? false
  const myPicked = picking?.myPicked ?? false
  const me = room.players.find((p) => p.slot === mySlot)
  const opp = room.players.find((p) => p.slot !== mySlot)

  const submit = () => {
    if (word.length !== room.wordLength) return
    pickWord(word)
  }

  const playerCard = (p: (typeof room.players)[number], picked: boolean) => {
    const colors = SLOT_COLORS[p.slot]
    const isMe = p.slot === mySlot
    return (
      <div
        key={p.id}
        className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-2 ${
          picked
            ? `${colors.soft} ring-1`
            : 'border-zinc-200 dark:border-zinc-800'
        }`}
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <span className={`inline-block h-2 w-2 rounded-full ${colors.dot}`} />
          {p.name}
          {isMe && <span className="text-[10px] font-normal text-zinc-400">(you)</span>}
        </span>
        <span className={`text-xs font-medium ${picked ? colors.text : 'text-zinc-400'}`}>
          {picked ? 'Word submitted' : 'Picking word...'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <header className="flex w-full items-center justify-between">
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Room
          </p>
          <p className="font-mono text-sm font-bold tracking-widest text-zinc-900 dark:text-zinc-50">
            {room.code}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Round {room.round}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {myPicked ? 'Waiting for your opponent' : 'Pick your word'}
          </p>
        </div>
      </header>

      <div className="flex w-full gap-3">
        {me && playerCard(me, myPicked)}
        {opp && playerCard(opp, picking?.oppPicked ?? false)}
      </div>

      <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {myTurn ? (
          <>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Pick a <span className="font-semibold text-zinc-900 dark:text-zinc-50">5-letter word</span>{' '}
              for <span className="font-semibold text-zinc-900 dark:text-zinc-50">{opp?.name}</span> to guess.
            </p>
            <input
              autoFocus
              className="w-56 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-center font-mono text-2xl font-black uppercase tracking-[0.3em] text-zinc-900 outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
              value={word}
              maxLength={room.wordLength}
              placeholder="_ _ _ _ _"
              onChange={(e) =>
                setWord(e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase())
              }
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            <button
              type="button"
              disabled={word.length !== room.wordLength}
              onClick={submit}
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900"
            >
              Send word
            </button>
          </>
        ) : myPicked ? (
          <>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              Word submitted
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Waiting for {opp?.name} to pick a word for you. The duel starts once you both set your words.
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              Hold on
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {`${opp?.name} is picking the word you will have to guess. You'll be up next.`}
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="w-full rounded-lg bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg ${
            toast.kind === 'success'
              ? 'bg-green-600 text-white'
              : toast.kind === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}
