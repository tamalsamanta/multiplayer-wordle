'use client'

type Player = {
  finished: boolean
  won: boolean
  attempts: number
  secretWord?: string
}

type Game = {
  players: Record<string, Player>
}

export default function FinishPopup({ game, playerId }: { game: Game, playerId: string }) {
  const me = game.players[playerId]
  const opponent = Object.entries(game.players).find(([id]) => id !== playerId)?.[1]

  if (!opponent?.finished) return null

  return (
    <div className="bg-black/70 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-6 rounded text-white text-center">
        <h2 className="text-xl font-bold mb-2">Opponent Finished</h2>
      </div>
    </div>
  )
}
