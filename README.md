# Wordle Duel

A simple 2-player multiplayer Wordle built with Next.js (App Router) and WebSockets.

## How it works

- One player picks a game mode (Race or Duel), enters a name, and creates a room.
- The creator gets a copyable invite link and shares it (only the creator sees it).
- The second player opens the link and joins the game directly — no code or mode selection needed.
- Both players race to solve the word on their own boards. Whoever solves it first wins the round; rounds continue and scores accumulate.

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
