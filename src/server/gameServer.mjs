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
    word: null,
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
  room.picks = [null, null]
  room.games = [emptyGame(), emptyGame()]
  room.roundWinner = null
  if (room.mode === 'duel') {
    room.status = 'picking'
    return
  }
  const word = pickWord()
  room.games[0].word = word
  room.games[1].word = word
  room.status = 'playing'
}

function personalRoom(room, slot) {
  const game = room.games[slot]
  const oppSlot = slot === 0 ? 1 : 0
  const oppPlayer = room.players[oppSlot]
  const oppGame = room.games[oppSlot]
  const myDone = game.status !== 'playing'
  const duel = room.mode === 'duel'

  return {
    code: room.code,
    round: room.round,
    scores: room.scores,
    wordLength: room.wordLength,
    maxGuesses: room.maxGuesses,
    mode: room.mode,
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
    ...(myDone ? { answer: game.word } : {}),
    ...(duel && room.status === 'picking'
      ? {
          picking: {
            myTurn:
              room.picks[slot] == null && (slot === 0 || room.picks[0] != null),
            myPicked: room.picks[slot] != null,
            oppPicked: room.picks[oppSlot] != null,
          },
        }
      : {}),
    ...(duel && room.status === 'over'
      ? { duelWords: { mine: game.word, theirs: oppGame.word } }
      : {}),
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
  const solved0 = g0.status === 'solved'
  const solved1 = g1.status === 'solved'
  if (solved0 && solved1) {
    if (g0.finishedAt === g1.finishedAt) return null
    return g0.finishedAt < g1.finishedAt ? 0 : 1
  }
  if (solved0) return 0
  if (solved1) return 1
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

function createRoom(ws, name, mode) {
  const code = randomCode()
  const room = {
    code,
    mode: mode === 'duel' ? 'duel' : 'race',
    wordLength: WORD_LENGTH,
    maxGuesses: MAX_GUESSES,
    round: 1,
    scores: [0, 0],
    games: [emptyGame(), emptyGame()],
    picks: [null, null],
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

  const word = game.word
  if (!word) return

  const feedback = computeFeedback(guess, word)
  game.board.push({ guess, feedback })

  const toasts = {}
  if (guess === word) {
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

function submitPick(ws, wordRaw) {
  const client = clients.get(ws)
  if (!client) return
  const room = rooms.get(client.code)
  if (!room || room.mode !== 'duel' || room.status !== 'picking') return
  const player = room.players.find((p) => p.ws === ws)
  if (!player) return
  const slot = player.slot
  const oppSlot = slot === 0 ? 1 : 0
  if (room.picks[slot] != null) return
  if (slot === 1 && room.picks[0] == null) {
    send(ws, {
      type: 'error',
      message: 'Wait for your opponent to submit a word first',
    })
    return
  }

  const word = (wordRaw || '').toLowerCase()
  if (!/^[a-z]{5}$/.test(word)) {
    send(ws, { type: 'error', message: 'Words must be 5 letters' })
    return
  }
  if (!validWords.has(word)) {
    send(ws, { type: 'error', message: `${word.toUpperCase()} is not a valid word` })
    return
  }

  room.picks[slot] = word
  room.games[oppSlot].word = word

  const toasts = {}
  if (room.picks[0] != null && room.picks[1] != null) {
    room.status = 'playing'
    toasts[slot] = { text: 'Word set. Game on!', kind: 'success' }
  } else {
    toasts[slot] = { text: 'Word set. Waiting for your opponent.', kind: 'success' }
    toasts[oppSlot] = { text: 'Your turn — pick a word for your opponent!', kind: 'info' }
  }

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

  if (room.mode === 'duel' && room.status === 'picking') {
    const oppSlot = player.slot === 0 ? 1 : 0
    if (room.picks[player.slot] == null) {
      room.picks[player.slot] = pickWord()
      room.games[oppSlot].word = room.picks[player.slot]
    }
    if (room.picks[0] != null && room.picks[1] != null) {
      room.status = 'playing'
    }
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
      createRoom(ws, msg.name, msg.mode)
      break
    case 'join-room':
      leaveRoom(ws)
      joinRoom(ws, msg.code, msg.name)
      break
    case 'make-guess':
      makeGuess(ws, msg.guess)
      break
    case 'pick-word':
      submitPick(ws, msg.word)
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
