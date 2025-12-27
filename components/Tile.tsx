type TileState = 'correct' | 'present' | 'absent'

type TileProps = {
  letter?: string
  state?: TileState
}

export default function Tile({ letter, state }: TileProps) {
  const colors: Record<TileState, string> = {
    correct: 'bg-green-600',
    present: 'bg-yellow-500',
    absent: 'bg-neutral-700',
  }

  return (
    <div
      className={`w-14 h-14 border border-neutral-600 flex items-center justify-center text-2xl font-bold uppercase
        ${state ? colors[state] : ''}`}
    >
      {letter}
    </div>
  )
}
