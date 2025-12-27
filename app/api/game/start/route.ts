import { getGame } from "@/lib/gameStore";

export async function POST(req: Request) {
    const { gameId } = await req.json()
    const game = getGame(gameId)

    if (!game) return new Response('Not Found', { status: 404 })
    
    game.status = 'word_submission'
    return Response.json({ success: true })
}