'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Room, SelfInfo, Toast } from '@/lib/types'
import { Board } from './Board'
import { Keyboard } from './Keyboard'
import { SLOT_COLORS } from './slotStyles'

interface GameProps {
  room: Room
  self: SelfInfo | null
  error: string | null
  toast: Toast | null
  makeGuess: (guess: string) => void
  nextRound: () => void
}

export function Game({ room, self, error, toast, makeGuess, nextRound }: GameProps) {
  const [guess, setGuess] = useState('')
  const myGame = room.my
  const opponent = room.opponent
  const mySlot = self?.slot ?? 0
  const myDone = myGame.status !== 'playing'
  const inputActive = room.status === 'playing' && !myDone
  const opponentsDone = opponent.status !== 'playing'

  const submit = useCallback(() => {
    if (!inputActive || guess.length !== room.wordLength) return
    makeGuess(guess)
    setGuess('')
  }, [inputActive, guess, makeGuess, room.wordLength])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!inputActive) return
      if (e.key === 'Enter') {
        submit()
      } else if (e.key === 'Backspace') {
        setGuess((g) => g.slice(0, -1))
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        setGuess((g) =>
          g.length < room.wordLength ? g + e.key.toLowerCase() : g
        )
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [inputActive, submit, room.wordLength])

  const onKey = (key: string) => {
    if (!inputActive) return
    if (key === 'Enter') submit()
    else if (key === 'Backspace') setGuess((g) => g.slice(0, -1))
    else setGuess((g) => (g.length < room.wordLength ? g + key : g))
  }

  const me = room.players.find((p) => p.slot === mySlot)
  const opp = room.players.find((p) => p.slot !== mySlot)

  const roundOver = room.status === 'over'
  const iWon = roundOver && room.roundWinner === mySlot

  const modeLabel = room.mode === 'race' ? 'Race' : 'Duel'
  const modeHint =
    room.mode === 'race'
      ? 'Solve it first'
      : 'Solve your opponent\u2019s word'

  const myProgress = `${myGame.guessCount} guess${myGame.guessCount === 1 ? '' : 'es'}`
  const oppProgress = opponent.solvedIn != null
    ? `solved in ${opponent.solvedIn}`
    : opponent.status === 'failed'
      ? 'out of guesses'
      : `${opponent.guessCount} guess${opponent.guessCount === 1 ? '' : 'es'}`

  const playerCard = (
    p: (typeof room.players)[number],
    progress: string,
    done: boolean
  ) => {
    const colors = SLOT_COLORS[p.slot]
    const isMe = p.slot === mySlot
    return (
      <div
        key={p.id}
        className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-2 ${
          done
            ? `${colors.soft} ring-1`
            : 'border-zinc-200 dark:border-zinc-800'
        }`}
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <span className={`inline-block h-2 w-2 rounded-full ${colors.dot}`} />
          {p.name}
          {isMe && <span className="text-[10px] font-normal text-zinc-400">(you)</span>}
          {p.offline && (
            <span className="text-[10px] font-normal text-zinc-400">(offline)</span>
          )}
        </span>
        <span className={`text-lg font-black ${colors.text}`}>{room.scores[p.slot]}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{progress}</span>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <header className="flex w-full items-center justify-between">
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Room
          </p>
          <p className="font-mono text-sm font-bold tracking-widest text-zinc-900 dark:text-zinc-50">
            {room.code}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Round {room.round}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {myGame.status === 'playing'
              ? `${myGame.guessesRemaining} guess${myGame.guessesRemaining === 1 ? '' : 'es'} left`
              : myGame.status === 'solved'
                ? 'Solved!'
                : 'Out of guesses'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {modeLabel}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {modeHint}
          </p>
        </div>
      </header>

      <div className="flex w-full gap-3">
        {me && playerCard(me, myProgress, myDone)}
        {opp && playerCard(opp, oppProgress, opponentsDone)}
      </div>

      {opponent.offline && (
        <p className="w-full rounded-lg bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
          {opponent.name} disconnected. You can keep playing solo.
        </p>
      )}

      {roundOver ? (
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-2xl font-black">
            {iWon
              ? 'You win the round!'
              : room.roundWinner === null
                ? 'Round over'
                : `${opponent.name} wins the round!`}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The word was{' '}
            <span className="font-mono font-bold uppercase">{room.answer}</span>
          </p>
          {room.mode === 'duel' && room.duelWords && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-mono font-bold uppercase">{room.duelWords.theirs}</span>{' '}
              was the word you set for {opponent.name}.
            </p>
          )}
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {room.scores[0]} – {room.scores[1]}
          </p>
          <button
            type="button"
            onClick={nextRound}
            className="mt-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 dark:bg-zinc-50 dark:text-zinc-900"
          >
            Next round
          </button>
        </div>
      ) : (
        <>
          <Board
            board={myGame.board}
            maxGuesses={room.maxGuesses}
            wordLength={room.wordLength}
            currentGuess={guess}
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {myDone
              ? 'Waiting for your opponent to finish...'
              : opponentsDone
                ? `${opponent.name} already finished first.`
                : room.mode === 'race'
                  ? 'Race your opponent to solve the word!'
                  : 'Solve the word your opponent picked for you!'}
          </p>
        </>
      )}

      <Keyboard board={myGame.board} onKey={onKey} disabled={!inputActive} />

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
