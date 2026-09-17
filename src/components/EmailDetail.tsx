import { useEffect, useRef } from 'react'
import { OWNERS, STATUSES, type EmailDecision, type Owner, type Status } from '../types'

type Props = {
  email: EmailDecision
  draftFocusToken: number
  sendGate: string | null
  onBack: () => void
  onPatch: (patch: Partial<EmailDecision>) => void
  onFollow: () => void
  onCreateTodo: () => void
  onReplyDraft: () => void
  onDefer: () => void
  onClear: () => void
  onMailAction: (mode: NonNullable<EmailDecision['mailMode']> | 'archive') => void
  onRewrite: () => void
  onSend: () => void
}

export function EmailDetail({
  email,
  draftFocusToken,
  sendGate,
  onBack,
  onPatch,
  onFollow,
  onCreateTodo,
  onReplyDraft,
  onDefer,
  onClear,
  onMailAction,
  onRewrite,
  onSend,
}: Props) {
  const draftRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (draftFocusToken === 0) return
    draftRef.current?.focus()
    draftRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [draftFocusToken])

  return (
    <div className="email-decisions">
      <div className="email-decisions__detail-shell">
        <div className="email-decisions__mail-bar">
          <button type="button" className="email-decisions__back" onClick={onBack}>
            ← Email decisions
          </button>
          <button
            type="button"
            className={`email-decisions__mail-bar-action${email.mailMode === 'reply' ? ' is-on' : ''}`}
            onClick={() => onMailAction('reply')}
          >
            Reply
          </button>
          <button
            type="button"
            className={`email-decisions__mail-bar-action${email.mailMode === 'reply-all' ? ' is-on' : ''}`}
            onClick={() => onMailAction('reply-all')}
          >
            Reply All
          </button>
          <button
            type="button"
            className={`email-decisions__mail-bar-action${email.mailMode === 'forward' ? ' is-on' : ''}`}
            onClick={() => onMailAction('forward')}
          >
            Forward
          </button>
          <button
            type="button"
            className={`email-decisions__mail-bar-action${email.archived ? ' is-on' : ''}`}
            onClick={() => onMailAction('archive')}
          >
            Archive
          </button>
          <span className="email-decisions__mail-bar-spacer" />
          <span className="email-decisions__mail-state">
            {email.mailMode ? `Compose · ${labelMode(email.mailMode)}` : 'Read'}
            {email.archived ? ' · archived' : ''}
          </span>
        </div>

        <div className="email-decisions__detail">
          <article className="email-decisions__body">
            <div className="email-decisions__sender-row">
              <h2 className="email-decisions__sender">{email.sender}</h2>
              <span className="email-decisions__time">{email.time}</span>
            </div>
            <p className="email-decisions__recipients">{email.recipients}</p>
            <div className="email-decisions__labels">
              {email.labels.map((label) => (
                <span key={label} className="email-decisions__chip">
                  {label}
                </span>
              ))}
              {email.following ? <span className="email-decisions__chip">Watching</span> : null}
            </div>
            <h3 className="email-decisions__subject">{email.subject}</h3>
            {email.messages.map((message) => (
              <section key={message.id} className="email-decisions__thread-msg">
                <div className="email-decisions__thread-who">
                  {message.from}
                  <span>{message.time}</span>
                </div>
                <p>{message.body}</p>
              </section>
            ))}
          </article>

          <aside className="email-decisions__actions">
            <p className="email-decisions__actions-kicker">ACTIONS</p>

            <div className="email-decisions__field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={email.status}
                onChange={(event) => onPatch({ status: event.target.value as Status })}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="email-decisions__field">
              <label htmlFor="owner">Owner</label>
              <select
                id="owner"
                value={email.owner}
                onChange={(event) => onPatch({ owner: event.target.value as Owner })}
              >
                {OWNERS.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </div>

            <div className="email-decisions__field">
              <label htmlFor="next">Next</label>
              <input
                id="next"
                value={email.next}
                onChange={(event) => onPatch({ next: event.target.value })}
                onBlur={(event) => onPatch({ next: event.target.value, lastAction: `Next → ${event.target.value}` })}
              />
            </div>

            <div className="email-decisions__field">
              <label htmlFor="linked">Linked</label>
              <input
                id="linked"
                value={email.linked.join(' · ')}
                onChange={(event) =>
                  onPatch({
                    linked: event.target.value
                      .split('·')
                      .map((part) => part.trim())
                      .filter(Boolean),
                  })
                }
                onBlur={(event) =>
                  onPatch({
                    linked: event.target.value
                      .split('·')
                      .map((part) => part.trim())
                      .filter(Boolean),
                    lastAction: `Linked → ${event.target.value.trim() || '(none)'}`,
                  })
                }
              />
            </div>

            <div className="email-decisions__linked">
              {email.linked.map((item) => (
                <span key={item} className="email-decisions__chip">
                  {item}
                </span>
              ))}
            </div>

            <div className="email-decisions__rule" />

            <button
              type="button"
              className={`email-decisions__action${email.following ? ' is-on' : ''}`}
              onClick={onFollow}
            >
              Follow
              <small>{email.following ? 'on watch' : 'Watch'}</small>
            </button>
            <button type="button" className="email-decisions__action" onClick={onCreateTodo}>
              Create todo
              <small>→ Work</small>
            </button>
            <button type="button" className="email-decisions__action" onClick={onReplyDraft}>
              Reply draft
              <small>draft below</small>
            </button>
            <button
              type="button"
              className={`email-decisions__action${email.status === 'Deferred' ? ' is-on' : ''}`}
              onClick={onDefer}
            >
              Defer
              <small>later</small>
            </button>
            <button
              type="button"
              className={`email-decisions__action${email.status === 'Cleared' ? ' is-on' : ''}`}
              onClick={onClear}
            >
              Clear
              <small>done</small>
            </button>

            {email.todos.length > 0 ? (
              <ul className="email-decisions__todos">
                {email.todos.map((todo) => (
                  <li key={todo.id}>
                    {todo.project} · {todo.title}
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>
        </div>

        <section
          className={`email-decisions__draft${draftFocusToken > 0 ? ' is-focus' : ''}`}
        >
          <div className="email-decisions__draft-head">
            <span>DRAFT</span>
            <small>Jarvis: {email.jarvisNote}</small>
          </div>
          <textarea
            ref={draftRef}
            value={email.draft}
            onChange={(event) => onPatch({ draft: event.target.value })}
            aria-label="Reply draft"
          />
          <div className="email-decisions__draft-actions">
            {sendGate ? <p className="email-decisions__gate">{sendGate}</p> : <span />}
            <button type="button" className="email-decisions__btn-rewrite" onClick={onRewrite}>
              Rewrite
            </button>
            <button type="button" className="email-decisions__btn-send" onClick={onSend}>
              Send
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function labelMode(mode: NonNullable<EmailDecision['mailMode']>) {
  if (mode === 'reply-all') return 'Reply All'
  if (mode === 'forward') return 'Forward'
  return 'Reply'
}
