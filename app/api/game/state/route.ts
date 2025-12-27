import { getGame } from '@/lib/gameStore'

export async function GET(req: Request) {
    const gameId = new URL(req.url).searchParams.get('gameId')

    if (!gameId) {
        return Response.json(
        { error: 'Missing gameId' },
        { status: 400 }
        )
    }

    const game = getGame(gameId)

    if (!game) {
        return Response.json(
        { error: 'Game not found' },
        { status: 404 }
        )
    }

    return Response.json(game)
}
