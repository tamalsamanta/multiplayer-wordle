import { createGame } from "@/lib/gameStore";

export async function POST(req: Request) {
    const {playerId} = await req.json()
    const gameId = createGame(playerId)
    return Response.json({ gameId })
}