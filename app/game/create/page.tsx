'use client'
import { getPlayerId } from '@/lib/getPlayerId'
import { useRouter } from 'next/navigation'

export default function Create() {
  const router = useRouter()

  async function create() {
    const res = await fetch('/api/game/create', {
      method: 'POST',
      body: JSON.stringify({ playerId: getPlayerId() }),
    })
    const { gameId } = await res.json()
    router.push(`/game/${gameId}`)
  }

  return <button onClick={create}>Create Game</button>
}
