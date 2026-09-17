import { ActivityLog } from './ActivityLog'
import type { EmailDecision, LogEntry } from '../types'

type Props = {
  emails: EmailDecision[]
  selectedId: string | null
  log: LogEntry[]
  onOpen: (id: string) => void
}

export function EmailList({ emails, selectedId, log, onOpen }: Props) {
  const openCount = emails.filter((email) => email.status !== 'Cleared' && !email.archived).length

  return (
    <div className="email-decisions">
      <div className="email-decisions__list">
        <header className="email-decisions__list-head">
          <p className="email-decisions__kicker">EMAIL DECISIONS</p>
          <p className="email-decisions__hint">
            FIFO · click row → detail · {openCount} open of {emails.length}
          </p>
        </header>

        {emails.length === 0 ? (
          <div className="email-decisions__empty">
            <h2>Queue is clear</h2>
            <p>No mock decisions left. Refresh to restore the FIFO seed.</p>
          </div>
        ) : (
          emails.map((email) => (
            <button
              key={email.id}
              type="button"
              className={[
                'email-decisions__row',
                selectedId === email.id ? 'is-selected' : '',
                email.status === 'Cleared' ? 'is-cleared' : '',
                email.archived ? 'is-archived' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onOpen(email.id)}
            >
              <span className="email-decisions__row-from">{email.sender}</span>
              <span className="email-decisions__row-to">{email.recipients}</span>
              <span className="email-decisions__row-subject">{email.subject}</span>
              <span className="email-decisions__row-summary">
                <span>{email.chainSummary}</span>
                {email.following ? <span className="email-decisions__pill">Watching</span> : null}
                {email.status === 'Deferred' ? (
                  <span className="email-decisions__pill">Deferred</span>
                ) : null}
                {email.status === 'Cleared' ? (
                  <span className="email-decisions__pill is-dim">Cleared</span>
                ) : null}
                {email.archived ? (
                  <span className="email-decisions__pill is-dim">Archived</span>
                ) : null}
                {email.todos.length > 0 ? (
                  <span className="email-decisions__pill">{email.todos.length} todo</span>
                ) : null}
              </span>
            </button>
          ))
        )}
      </div>
      <ActivityLog entries={log} />
    </div>
  )
}
