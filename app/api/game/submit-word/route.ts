import { getGame } from "@/lib/gameStore";

export async function POST(req: Request) {
    const { gameId, playerId, word } = await req.json()
    const game = getGame(gameId)!

    game.players[playerId].secretWord = word.toLowerCase()

    if (Object.values(game.players).every(p => p.secretWord)) {
        game.status = 'in_progress'
    }

    return Response.json({ success: true })
}