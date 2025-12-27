import { getGame } from "@/lib/gameStore";
import { evaluateGuess } from "@/lib/evaluateGuess";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { gameId, playerId, guess } = await req.json()
    const game = getGame(gameId)!
    const player = game.players[playerId]

    if (player.finished) {
        return NextResponse.json({ ok: true })
    }

    const opponentId = Object.keys(game.players).find(id => id !== playerId)!
    const target = game.players[opponentId].secretWord!

    player.guesses.push(guess)
    player.attempts += 1
    const evaluation = evaluateGuess(guess, target)

    if (guess === target.toUpperCase()) {
        player.won = true
        player.finished = true
        game.players[playerId].finished = true
    }
    if (player.attempts > 6) {
        player.finished = true
        player.won = false
    }

    const allFinished = Object.values(game.players).every(p => p.finished)
    if (allFinished) {
        game.status = 'finished'
    }

    return Response.json({ evaluation })
}