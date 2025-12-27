'use client'

import { useEffect, useState } from 'react'
import Keyboard from './Keyboard'

type Player = {
  guesses: string[]
  finished: boolean
  secretWord?: string,
  won: boolean,
  attempts: number
}

type Game = {
  id: string
  status: 'playing' | string
  creatorId: string
  players: Record<string, Player>
}

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

type TileColor = 'correct' | 'present' | 'absent' | ''

export default function WordGrid({ game, playerId }: { game: Game, playerId: string }) {
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [tileColors, setTileColors] = useState<TileColor[][]>([])
  const playerSecretWord = Object.entries(game.players)
    .find(([id]) => id !== playerId)?.[1].secretWord

    const me = game.players[playerId]
    const opponent = Object.entries(game.players).find(([id]) => id !== playerId)?.[1]

  // Poll game state every 1s
  useEffect(() => {
    const i = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/state?gameId=${game.id}`)
        const data = await res.json()
        setGuesses(data.players[playerId].guesses || [])
      } catch (err) { console.error(err) }
    }, 1000)
    return () => clearInterval(i)
  }, [game.id, playerId])

  function evaluateGuess(guessUpper: string) {
    const guess = guessUpper.toLowerCase()
    if (!playerSecretWord) return []
    const colors: TileColor[] = []
    const secretArr = playerSecretWord.split('')
    const guessArr = guess.split('')

    // Mark correct letters first
    const secretUsed = Array(secretArr.length).fill(false)
    guessArr.forEach((l, i) => {
      if (secretArr[i] === l) {
        colors[i] = 'correct'
        secretUsed[i] = true
      }
    })

    // Mark present / absent
    guessArr.forEach((l, i) => {
      if (colors[i]) return
      const index = secretArr.findIndex((s, j) => s === l && !secretUsed[j])
      if (index >= 0) {
        colors[i] = 'present'
        secretUsed[index] = true
      } else {
        colors[i] = 'absent'
      }
    })
    return colors
  }

  function submitGuess() {
    if (currentGuess.length !== 5) return alert('Guess must be 5 letters')
    fetch('/api/game/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: game.id, playerId, guess: currentGuess.toUpperCase() })
    })
    setCurrentGuess('')
  }

  // Update tile colors whenever guesses change
  useEffect(() => {
    setTileColors(guesses.map(g => evaluateGuess(g)))
  }, [guesses, playerSecretWord])

  return (
    <div className="min-h-screen flex flex-col items-center justify-start gap-4 py-8 text-white">
      <h1 className="text-2xl font-bold">Wordle vs Opponent</h1>

      {/* Word Grid */}
      <div className="grid gap-2">
        {guesses.map((guess, i) => (
          <div key={i} className="grid grid-cols-5 gap-2">
            {guess.split('').map((letter, j) => (
              <div
                key={j}
                className={`w-12 h-12 flex items-center justify-center font-bold text-xl rounded ${
                  tileColors[i]?.[j] === 'correct'
                    ? 'bg-green-600'
                    : tileColors[i]?.[j] === 'present'
                    ? 'bg-yellow-500'
                    : tileColors[i]?.[j] === 'absent'
                    ? 'bg-neutral-700'
                    : 'bg-neutral-800'
                }`}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Input */}
      {!me.finished && (
        <div className="flex gap-2 mt-4">
            <input
            type="text"
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value.toUpperCase())}
            maxLength={5}
            className="px-2 py-1 w-32 text-center"
            />
            <button className="px-4 py-2 bg-green-600 rounded hover:bg-green-700" onClick={submitGuess}>
            Submit
            </button>
        </div>
      )}
      {me.finished && !me.won && (
        <p className='mt-4 text-red-400'>
            The word was : <b>{opponent?.secretWord}</b>
        </p>
      )}
    </div> 
  )
}
