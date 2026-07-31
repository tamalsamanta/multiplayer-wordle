# Wordle Duel

A simple 2-player multiplayer Wordle built with Next.js (App Router) and WebSockets.

## How it works

- One player creates a room and shares the 4-letter room code.
- The second player joins with that code.
- Both players race to solve the same word on their own boards. Fewer guesses wins the round; if the guess counts tie, the first to finish wins. Rounds continue and scores accumulate.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in two browser windows to play against yourself, or on two machines on the same network.

## Production

```bash
npm run build
npm start
```

## Architecture

- `server.mjs` — custom Next.js server that also hosts a WebSocket server on `/ws`.
- `src/server/gameServer.mjs` — in-memory room/game state, per-player race handling, round scoring, and Wordle feedback logic.
- `src/server/words.mjs` — word list used for answers and guesses.
- `src/lib/types.ts` — shared client message/state types.
- `src/components/` — React client: `useGameSocket` hook, lobby, waiting room, board, and keyboard.
