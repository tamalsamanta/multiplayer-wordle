import { Game, Player } from "./gameStore"

export function getOpponent(
  game: Game,
  playerId: string
): Player | undefined {
  for (const [id, player] of Object.entries(game.players)) {
    if (id !== playerId) {
      return player
    }
  }
  return undefined
}
