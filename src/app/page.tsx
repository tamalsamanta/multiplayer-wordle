'use client'

import { Game } from '@/components/Game'
import { Lobby } from '@/components/Lobby'
import { WaitingRoom } from '@/components/WaitingRoom'
import { useGameSocket } from '@/components/useGameSocket'

export default function Home() {
  const game = useGameSocket()

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      {!game.connected ? (
        <div className="flex flex-col items-center gap-3 text-zinc-500 dark:text-zinc-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50" />
          <p className="text-sm">Connecting to server...</p>
        </div>
      ) : !game.room ? (
        <Lobby error={game.error} createRoom={game.createRoom} joinRoom={game.joinRoom} />
      ) : game.room.status === 'waiting' ? (
        <WaitingRoom room={game.room} />
      ) : (
        <Game
          room={game.room}
          self={game.self}
          error={game.error}
          toast={game.toast}
          makeGuess={game.makeGuess}
          nextRound={game.nextRound}
        />
      )}
    </main>
  )
}
