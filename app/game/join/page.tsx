'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPlayerId } from '@/lib/getPlayerId'

export default function JoinGame() {
  const [gameId, setGameId] = useState('')
  const router = useRouter()

  async function join() {
    if (!gameId) return

    const res = await fetch('/api/game/join', {
      method: 'POST',
      body: JSON.stringify({
        gameId: gameId.trim(),
        playerId: getPlayerId(),
      }),
    })

    if (!res.ok) {
      alert('Unable to join game. Invalid code or game full.')
      return
    }

    router.push(`/game/${gameId.trim()}`)
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Join Game</h1>

      <input
        className="px-3 py-2 rounded"
        placeholder="Enter Game Code"
        value={gameId}
        onChange={e => setGameId(e.target.value)}
      />

      <button onClick={join} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700;">
        Join
      </button>
    </main>
  )
}
