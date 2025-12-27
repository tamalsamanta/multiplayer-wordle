'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPlayerId } from '@/lib/getPlayerId'
import WordSubmission from '@/components/WordSubmission'
import WordGrid from '@/components/WordGrid'
import FinalResults from '@/components/FinalResults'
import { getOpponent } from '@/lib/getOpponent'

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const playerId = getPlayerId()!

  const [mounted, setMounted] = useState(false)
  const [game, setGame] = useState<any>(null)
  const [showOpponentToast, setShowOpponentToast] = useState(false)

  /** --------------------
   *  Mount guard
   * -------------------*/
  useEffect(() => {
    setMounted(true)
  }, [])

  /** --------------------
   *  Poll game state
   * -------------------*/
  useEffect(() => {
    if (!gameId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/state?gameId=${gameId}`)
        if (!res.ok) return
        const data = await res.json()
        setGame(data)
      } catch (err) {
        console.error(err)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameId])

  /** --------------------
   *  Opponent finished toast
   * -------------------*/
  useEffect(() => {
    if (!game || !playerId) return

    const player = game.players?.[playerId]
    const opponent = getOpponent(game, playerId)

    if (!player || !opponent) return

    if (opponent.finished && !player.finished) {
      setShowOpponentToast(true)
    }
  }, [game, playerId])

  /** --------------------
   *  Early exits AFTER hooks
   * -------------------*/
  if (!mounted) return null

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading game...
      </div>
    )
  }

  const players = Object.values(game.players)
  const player = game.players[playerId]

  /** --------------------
   *  Waiting for opponent
   * -------------------*/
  if (players.length < 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
        <h1 className="text-2xl font-bold">Waiting for opponent…</h1>
        <p>Share this game link:</p>
        <code className="bg-neutral-800 px-4 py-2 rounded">
          {typeof window !== 'undefined' && window.location.href}
        </code>
      </div>
    )
  }

  /** --------------------
   *  Creator start game
   * -------------------*/
  if (game.status === 'ready' && game.creatorId === playerId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
        <h1 className="text-2xl font-bold">Game ready!</h1>
        <button
          className="btn"
          onClick={async () => {
            await fetch('/api/game/start', {
              method: 'POST',
              body: JSON.stringify({ gameId }),
              headers: { 'Content-Type': 'application/json' }
            })
          }}
        >
          Start Game
        </button>
      </div>
    )
  }

  /** --------------------
   *  Word submission
   * -------------------*/
  if (game.status === 'word_submission' && player.secretWord == null) {
    return <WordSubmission gameId={gameId} playerId={playerId} />
  }

  if (game.status === 'word_submission') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Waiting for opponent to submit their word...
      </div>
    )
  }

  /** --------------------
   *  In progress
   * -------------------*/
  if (game.status === 'in_progress') {
    return (
      <div className="relative">
        {showOpponentToast && (
          <div className="fixed top-4 right-4 bg-neutral-900 text-white px-4 py-2 rounded shadow">
            Opponent has finished their game!
          </div>
        )}

        <WordGrid game={game} playerId={playerId} />
      </div>
    )
  }

  /** --------------------
   *  Finished
   * -------------------*/
  if (game.status === 'finished') {
    return <FinalResults game={game} playerId={playerId} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Unknown state
    </div>
  )
}
