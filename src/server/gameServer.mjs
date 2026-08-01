import { WebSocket } from 'ws'
import { WORDS } from './words.mjs'

const validWords = new Set(WORDS)

const rooms = new Map()
const clients = new Map()

const WORD_LENGTH = 5
const MAX_GUESSES = 6

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function randomCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code
  do {
    code = Array.from(
      { length: 4 },
      () => letters[Math.floor(Math.random() * letters.length)]
    ).join('')
  } while (rooms.has(code))
  return code
}

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

function makePlayer(ws, name, slot) {
  return {
    id: makeId(),
    name: (name || 'Player').trim().slice(0, 20),
    slot,
    offline: false,
    ws,
  }
}

function emptyGame() {
  return {
    board: [],
    status: 'playing',
    solvedIn: null,
    finishedAt: null,
  }
}

function computeFeedback(guess, word) {
  const result = new Array(WORD_LENGTH).fill('absent')
  const remaining = {}
  for (let i = 0; i < WORD_LENGTH; i++) {
    remaining[word[i]] = (remaining[word[i]] || 0) + 1
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === word[i]) {
      result[i] = 'correct'
      remaining[guess[i]]--
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue
    if (remaining[guess[i]] > 0) {
      result[i] = 'present'
      remaining[guess[i]]--
    }
  }
  return result
}

function send(ws, msg) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

function newRound(room) {
  room.word = pickWord()
  room.games = [emptyGame(), emptyGame()]
  room.status = 'playing'
  room.roundWinner = null
}

function personalRoom(room, slot) {
  const game = room.games[slot]
  const oppSlot = slot === 0 ? 1 : 0
  const oppPlayer = room.players[oppSlot]
  const oppGame = room.games[oppSlot]
  const myDone = game.status !== 'playing'

  return {
    code: room.code,
    round: room.round,
    scores: room.scores,
    wordLength: room.wordLength,
    maxGuesses: room.maxGuesses,
    status: room.status,
    roundWinner: room.roundWinner,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      slot: p.slot,
      offline: p.offline,
    })),
    my: {
      board: game.board,
      status: game.status,
      guessesRemaining: room.maxGuesses - game.board.length,
      guessCount: game.board.length,
      solvedIn: game.solvedIn,
    },
    opponent: oppPlayer
      ? {
          name: oppPlayer.name,
          offline: oppPlayer.offline,
          guessCount: oppGame.board.length,
          status: oppGame.status,
          solvedIn: oppGame.solvedIn,
        }
      : {
          name: 'Waiting...',
          offline: false,
          guessCount: 0,
          status: 'playing',
          solvedIn: null,
        },
    ...(myDone ? { answer: room.word } : {}),
  }
}

function notifyRoom(room, toasts = {}) {
  for (const p of room.players) {
    if (!p.ws) continue
    send(p.ws, {
      type: 'room',
      self: { id: p.id, name: p.name, slot: p.slot },
      room: personalRoom(room, p.slot),
      ...(toasts[p.slot] ? { toast: toasts[p.slot] } : {}),
    })
  }
}

function computeRoundWinner(room) {
  const g0 = room.games[0]
  const g1 = room.games[1]
  if (!g0 || !g1) return null
  if (g0.status === 'solved' && g1.status === 'solved') {
    if (g0.solvedIn !== g1.solvedIn) {
      return g0.solvedIn < g1.solvedIn ? 0 : 1
    }
    return g0.finishedAt <= g1.finishedAt ? 0 : 1
  }
  if (g0.status === 'solved') return 0
  if (g1.status === 'solved') return 1
  return null
}

function maybeFinishRound(room) {
  const g0 = room.games[0]
  const g1 = room.games[1]
  if (!g0 || !g1) return
  if (g0.status === 'playing' || g1.status === 'playing') return
  room.status = 'over'
  room.roundWinner = computeRoundWinner(room)
  if (room.roundWinner !== null) {
    room.scores[room.roundWinner]++
  }
}

function createRoom(ws, name) {
  const code = randomCode()
  const room = {
    code,
    wordLength: WORD_LENGTH,
    maxGuesses: MAX_GUESSES,
    round: 1,
    scores: [0, 0],
    word: null,
    games: [emptyGame(), emptyGame()],
    status: 'waiting',
    roundWinner: null,
    players: [makePlayer(ws, name, 0)],
  }
  rooms.set(code, room)
  clients.set(ws, { code })
  notifyRoom(room)
}

function joinRoom(ws, codeRaw, name) {
  const code = (codeRaw || '').trim().toUpperCase()
  const room = rooms.get(code)
  if (!room) {
    send(ws, { type: 'error', message: 'Room not found' })
    return
  }

  const cleanName = (name || '').trim().toLowerCase()
  const rejoin = room.players.find(
    (p) => p.offline && p.name.toLowerCase() === cleanName
  )
  if (rejoin) {
    rejoin.offline = false
    rejoin.ws = ws
    if (name) rejoin.name = name.trim().slice(0, 20)
    clients.set(ws, { code })
    if (room.status === 'waiting' && room.players.length === 2) newRound(room)
    notifyRoom(room)
    return
  }

  if (room.players.length >= 2) {
    send(ws, { type: 'error', message: 'Room is full' })
    return
  }

  const player = makePlayer(ws, name, room.players.length)
  room.players.push(player)
  clients.set(ws, { code })
  if (room.players.length === 2) newRound(room)
  notifyRoom(room)
}

function makeGuess(ws, guessRaw) {
  const client = clients.get(ws)
  if (!client) return
  const room = rooms.get(client.code)
  if (!room || room.status !== 'playing') return
  const player = room.players.find((p) => p.ws === ws)
  if (!player) return
  const game = room.games[player.slot]
  if (game.status !== 'playing') return

  const guess = (guessRaw || '').toLowerCase()
  if (!/^[a-z]{5}$/.test(guess)) {
    send(ws, { type: 'error', message: 'Guesses must be 5 letters' })
    return
  }
  if (!validWords.has(guess)) {
    notifyRoom(room, {
      [player.slot]: {
        text: `${guess.toUpperCase()} is not a valid word`,
        kind: 'error',
      },
    })
    return
  }

  const feedback = computeFeedback(guess, room.word)
  game.board.push({ guess, feedback })

  const toasts = {}
  if (guess === room.word) {
    game.status = 'solved'
    game.solvedIn = game.board.length
    game.finishedAt = Date.now()
    toasts[player.slot] = {
      text: `You solved it in ${game.solvedIn} tries!`,
      kind: 'success',
    }
    const oppSlot = player.slot === 0 ? 1 : 0
    toasts[oppSlot] = {
      text: `${player.name} solved it in ${game.solvedIn} tries!`,
      kind: 'info',
    }
  } else if (game.board.length >= room.maxGuesses) {
    game.status = 'failed'
    game.finishedAt = Date.now()
    toasts[player.slot] = {
      text: 'You ran out of guesses.',
      kind: 'info',
    }
  }

  if (game.status !== 'playing') maybeFinishRound(room)

  notifyRoom(room, toasts)
}

function nextRound(ws) {
  const client = clients.get(ws)
  if (!client) return
  const room = rooms.get(client.code)
  if (!room || room.status !== 'over') return
  room.round++
  newRound(room)
  notifyRoom(room)
}

function leaveRoom(ws) {
  const client = clients.get(ws)
  if (!client) return
  const room = rooms.get(client.code)
  clients.delete(ws)
  if (!room) return
  const player = room.players.find((p) => p.ws === ws)
  if (!player) return

  player.ws = null
  player.offline = true

  const online = room.players.filter((p) => p.ws)
  if (online.length === 0) {
    rooms.delete(room.code)
    return
  }

  // Forfeit an unfinished game so the round can still conclude
  const game = room.games[player.slot]
  if (game && game.status === 'playing') {
    game.status = 'failed'
    game.finishedAt = Date.now()
    maybeFinishRound(room)
  }

  notifyRoom(room)
}

function handleMessage(ws, msg) {
  if (!msg || typeof msg.type !== 'string') return
  switch (msg.type) {
    case 'create-room':
      leaveRoom(ws)
      createRoom(ws, msg.name)
      break
    case 'join-room':
      leaveRoom(ws)
      joinRoom(ws, msg.code, msg.name)
      break
    case 'make-guess':
      makeGuess(ws, msg.guess)
      break
    case 'next-round':
      nextRound(ws)
      break
    default:
      break
  }
}

export function attachGameServer(wss) {
  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      let msg
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        return
      }
      handleMessage(ws, msg)
    })
    ws.on('close', () => leaveRoom(ws))
    ws.on('error', () => {})
  })
}
