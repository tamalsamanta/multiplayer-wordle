import Link from 'next/link'

export default function Home() {
  return (
    <main className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl">Multiplayer Wordle</h1>
      <Link href="/game/create" className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">Create</Link>
      <Link href="/game/join" className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">Join</Link>
    </main>
  )
}
