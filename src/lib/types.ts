export type Feedback = 'correct' | 'present' | 'absent'

export interface GuessRow {
  guess: string
  feedback: Feedback[]
}

export type GameStatus = 'playing' | 'solved' | 'failed'

export interface MyGame {
  board: GuessRow[]
  status: GameStatus
  guessesRemaining: number
  guessCount: number
  solvedIn: number | null
}

export interface OpponentView {
  name: string
  offline: boolean
  guessCount: number
  status: GameStatus
  solvedIn: number | null
}

export interface PublicPlayer {
  id: string
  name: string
  slot: 0 | 1
  offline: boolean
}

export interface Room {
  code: string
  round: number
  scores: [number, number]
  wordLength: number
  maxGuesses: number
  status: 'waiting' | 'playing' | 'over'
  roundWinner: 0 | 1 | null
  players: PublicPlayer[]
  my: MyGame
  opponent: OpponentView
  answer?: string
}

export interface SelfInfo {
  id: string
  name: string
  slot: 0 | 1
}

export type ToastKind = 'info' | 'success' | 'error'

export interface Toast {
  text: string
  kind: ToastKind
}

export type ServerMessage =
  | { type: 'room'; self: SelfInfo; room: Room; toast?: Toast }
  | { type: 'error'; message: string }

export type ClientMessage =
  | { type: 'create-room'; name: string }
  | { type: 'join-room'; code: string; name: string }
  | { type: 'make-guess'; guess: string }
  | { type: 'next-round' }
