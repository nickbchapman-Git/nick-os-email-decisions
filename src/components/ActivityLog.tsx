import type { LogEntry } from '../types'

type Props = {
  entries: LogEntry[]
}

export function ActivityLog({ entries }: Props) {
  return (
    <aside className="email-decisions__log" aria-label="Decision log">
      <h3>LOG</h3>
      {entries.length === 0 ? (
        <p className="email-decisions__hint">
          Actions land here — Follow, todo, draft, defer, clear, rewrite, gated send.
        </p>
      ) : (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>
              {entry.at} · {entry.subject} — {entry.text}
            </li>
          ))}
        </ol>
      )}
    </aside>
  )
}
