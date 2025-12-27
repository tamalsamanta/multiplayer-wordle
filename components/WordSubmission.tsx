'use client'
import { useState } from 'react'

export default function WordSubmission({ gameId, playerId }: any) {
  const [word, setWord] = useState('')

  async function submit() {
    if (word.length !== 5) return
    await fetch('/api/game/submit-word', {
      method: 'POST',
      body: JSON.stringify({ gameId, playerId, word }),
    })
  }

  return (
    <div>
      <input value={word} maxLength={5} onChange={e => setWord(e.target.value.toUpperCase())} />
      <button onClick={submit}>Submit</button>
    </div>
  )
}
