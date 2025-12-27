import { getGame } from "@/lib/gameStore";

export async function POST(req: Request) {
    const { gameId, playerId } = await req.json()
    const game = getGame(gameId)

    if (!game || Object.keys(game.players).length >= 2) {
        return new Response('Invalid Game', { status: 400 })
    }

    game.players[playerId] = { guesses: [], finished: false, won: false, attempts: 0 }
    game.status = 'ready'

    return Response.json({ success: true })
}