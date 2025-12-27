'use client'

import { Game, Player } from "@/lib/gameStore"

export default function FinalResults({ game, playerId }: { game: Game, playerId: string}) {
  const me: Player = game.players[playerId]
  const opponent: Player = Object.entries(game.players).find(([id]) => id !== playerId)![1]

  let result = 'Draw'
  if (me.won && !opponent?.won) result = 'You Win!'
  if (!me.won && opponent.won) result = 'You Lose!'
  if (me.won && opponent.won) {
    if (me.attempts === opponent.attempts) result = 'Draw'
    else result = me.attempts < opponent.attempts ? 'You Win!' : 'You Lose!'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
      <h1 className="text-3xl font-bold">{result}</h1>

      <div className="bg-neutral-800 p-4 rounded">
        <p>You: {me.won ? `Solved in ${me.attempts}` : 'Failed'}</p>
        <p>Opponent: {opponent.won ? `Solved in ${opponent.attempts}` : 'Failed'}</p>
      </div>
    </div>
  )
}
