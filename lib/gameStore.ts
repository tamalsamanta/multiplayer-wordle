export type Player = {
    secretWord?: string,
    guesses: string[],
    finished: boolean,
    won: boolean, 
    attempts: number
}

export type Game = {
    id: string,
    status: 'waiting' | 'ready' | 'word_submission' | 'in_progress' | 'finished',
    creatorId: string,
    players: Record<string, Player>
}

const games = new Map<string, Game>()

export function createGame(playerId: string) {
    const id = crypto.randomUUID().slice(0,6)

    games.set(id, {
        id,
        status: 'waiting',
        creatorId: playerId,
        players: {
            [playerId]: { guesses: [], finished: false, won: false, attempts: 0 }
        }
    })

    return id
}

export function getGame(id: string) {
    return games.get(id)
}