'use client'

import { useState } from 'react'
import { Game } from '@/components/Game'
import { JoinScreen } from '@/components/JoinScreen'
import { Lobby } from '@/components/Lobby'
import { ModeSelect } from '@/components/ModeSelect'
import { WaitingRoom } from '@/components/WaitingRoom'
import { DuelPicking } from '@/components/DuelPicking'
import { useGameSocket } from '@/components/useGameSocket'
import type { Mode } from '@/lib/types'

export default function Home() {
  const game = useGameSocket()
  const [mode, setMode] = useState<Mode | null>(null)

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      {!game.connected ? (
        <div className="flex flex-col items-center gap-3 text-zinc-500 dark:text-zinc-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50" />
          <p className="text-sm">Connecting to server...</p>
        </div>
      ) : game.room?.status === 'waiting' ? (
        <WaitingRoom room={game.room} isCreator={game.self?.slot === 0} />
      ) : game.room?.status === 'picking' ? (
        <DuelPicking
          room={game.room}
          self={game.self}
          error={game.error}
          toast={game.toast}
          pickWord={game.pickWord}
        />
      ) : game.room ? (
        <Game
          room={game.room}
          self={game.self}
          error={game.error}
          toast={game.toast}
          makeGuess={game.makeGuess}
          nextRound={game.nextRound}
        />
      ) : game.joinCode ? (
        <JoinScreen error={game.error} joinRoom={game.joinRoom} />
      ) : !mode ? (
        <ModeSelect onSelect={setMode} />
      ) : (
        <Lobby
          mode={mode}
          error={game.error}
          createRoom={game.createRoom}
          onBack={() => setMode(null)}
        />
      )}
    </main>
  )
}
