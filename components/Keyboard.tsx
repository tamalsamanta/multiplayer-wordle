const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

export default function Keyboard({ onKey, onEnter, onDelete }: any) {
  return (
    <div className="mt-6">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1">
          {i === 2 && <button onClick={onEnter}>Enter</button>}
          {row.split('').map(k => (
            <button key={k} onClick={() => onKey(k)}>{k}</button>
          ))}
          {i === 2 && <button onClick={onDelete}>⌫</button>}
        </div>
      ))}
    </div>
  )
}
