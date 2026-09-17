import { useEffect, useMemo, useState } from 'react'
import { ChromeShell, StubPage } from './components/ChromeShell'
import { EmailDetail } from './components/EmailDetail'
import { EmailList } from './components/EmailList'
import { ToastStack } from './components/ToastStack'
import { SEED_EMAILS } from './data/emails'
import { rewriteDraft } from './lib/rewrite'
import type {
  EmailDecision,
  LogEntry,
  NavId,
  ToastItem,
} from './types'

const SEND_GATE = 'Send blocked — needs Approve-before-act'

export default function App() {
  const [emails, setEmails] = useState<EmailDecision[]>(SEED_EMAILS)
  const [openId, setOpenId] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [nav, setNav] = useState<NavId>('sit-rep')
  const [navOpen, setNavOpen] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [draftFocusToken, setDraftFocusToken] = useState(0)
  const [sendGate, setSendGate] = useState<string | null>(null)
  const [clock, setClock] = useState(formatClock())

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openId) {
        setOpenId(null)
        setSendGate(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId])

  const selected = emails.find((email) => email.id === openId) ?? null
  const queue = useMemo(
    () => [...emails].sort((a, b) => a.fifo - b.fifo),
    [emails],
  )

  const titleMeta =
    nav !== 'sit-rep'
      ? 'stub'
      : selected
        ? 'list → detail · Make pattern'
        : 'full-screen change'

  function notify(kind: ToastItem['kind'], text: string) {
    const id = crypto.randomUUID()
    setToasts((current) => [...current.slice(-3), { id, kind, text }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4200)
  }

  function record(email: EmailDecision, text: string) {
    setLog((current) => [
      {
        id: crypto.randomUUID(),
        at: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        emailId: email.id,
        subject: email.subject,
        text,
      },
      ...current,
    ].slice(0, 12))
  }

  function patchEmail(id: string, patch: Partial<EmailDecision>, note?: string) {
    const email = emails.find((item) => item.id === id)
    setEmails((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, ...patch, lastAction: note ?? item.lastAction }
          : item,
      ),
    )
    if (note && email) record({ ...email, ...patch }, note)
  }

  function openEmail(id: string) {
    setOpenId(id)
    setHighlightId(id)
    setSendGate(null)
    const email = emails.find((item) => item.id === id)
    if (email) {
      record(email, 'Opened detail')
      notify('ok', `Opened ${email.subject}`)
    }
  }

  function goSitRep() {
    setNav('sit-rep')
    setNavOpen(false)
  }

  return (
    <div className="app-root">
      <ChromeShell
        active={nav}
        titleMeta={titleMeta}
        clock={clock}
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((open) => !open)}
        onNav={(id) => {
          setNav(id)
          setNavOpen(false)
          if (id !== 'sit-rep') {
            notify('stub', `${labelNav(id)} is a stub — decisions live on Sit-rep`)
          }
        }}
      >
        {nav !== 'sit-rep' ? (
          <StubPage name={labelNav(nav)} onBack={goSitRep} />
        ) : selected ? (
          <EmailDetail
            email={selected}
            draftFocusToken={draftFocusToken}
            sendGate={sendGate}
            onBack={() => {
              setOpenId(null)
              setSendGate(null)
              record(selected, 'Back to list')
            }}
            onPatch={(patch) => {
              const note = describePatch(patch) ?? patch.lastAction ?? undefined
              patchEmail(selected.id, patch, note)
              if (note) notify('ok', note)
            }}
            onFollow={() => {
              const following = !selected.following
              patchEmail(
                selected.id,
                { following },
                following ? 'Follow — watching thread' : 'Follow removed',
              )
              notify('ok', following ? 'Watching this thread' : 'No longer watching')
            }}
            onCreateTodo={() => {
              const todo = {
                id: crypto.randomUUID(),
                title: selected.next || selected.subject,
                project: 'Work',
              }
              const linked = selected.linked.includes('Work · todo')
                ? selected.linked
                : [...selected.linked, 'Work · todo']
              patchEmail(
                selected.id,
                { todos: [...selected.todos, todo], linked },
                `Created todo → Work · ${todo.title}`,
              )
              notify('ok', `Todo created in Work: ${todo.title}`)
            }}
            onReplyDraft={() => {
              setDraftFocusToken((token) => token + 1)
              patchEmail(
                selected.id,
                { mailMode: selected.mailMode ?? 'reply', status: selected.status === 'Cleared' ? selected.status : 'Reviewing' },
                'Reply draft — using draft below',
              )
              notify('ok', 'Draft focused — edit, Rewrite, or gated Send')
            }}
            onDefer={() => {
              patchEmail(
                selected.id,
                { status: 'Deferred', next: selected.next || 'Later' },
                'Deferred — later',
              )
              notify('ok', 'Deferred. Status is Later.')
            }}
            onClear={() => {
              patchEmail(selected.id, { status: 'Cleared', next: 'Done' }, 'Cleared — done')
              notify('ok', 'Cleared. Row will show done on the list.')
            }}
            onMailAction={(mode) => {
              if (mode === 'archive') {
                const archived = !selected.archived
                patchEmail(
                  selected.id,
                  { archived },
                  archived ? 'Archived (mock)' : 'Unarchived (mock)',
                )
                notify('ok', archived ? 'Archived — mock state only' : 'Returned from archive')
                return
              }
              setDraftFocusToken((token) => token + 1)
              const prefix =
                mode === 'forward'
                  ? `Fwd: ${selected.subject}\n\n`
                  : mode === 'reply-all'
                    ? `Reply all · ${selected.recipients}\n\n`
                    : ''
              const draft = selected.draft.startsWith('Fwd:') || selected.draft.startsWith('Reply all')
                ? selected.draft
                : `${prefix}${selected.draft}`
              patchEmail(
                selected.id,
                { mailMode: mode, draft },
                `${labelMail(mode)} — compose mode set`,
              )
              notify('ok', `${labelMail(mode)} armed. Draft is local only.`)
            }}
            onRewrite={() => {
              const first = selected.sender.split(' ')[0] ?? 'there'
              const draft = rewriteDraft(
                selected.draft,
                selected.jarvisNote,
                first,
                selected.rewriteCount,
              )
              patchEmail(
                selected.id,
                { draft, rewriteCount: selected.rewriteCount + 1 },
                `Rewrite #${selected.rewriteCount + 1} from draft + Jarvis note`,
              )
              notify('ok', 'Jarvis rewrote the draft from the current box')
            }}
            onSend={() => {
              setSendGate(SEND_GATE)
              record(selected, SEND_GATE)
              notify('gate', SEND_GATE)
            }}
          />
        ) : (
          <EmailList
            emails={queue}
            selectedId={highlightId}
            log={log}
            onOpen={openEmail}
          />
        )}
      </ChromeShell>
      <ToastStack toasts={toasts} />
    </div>
  )
}

function formatClock() {
  return `as of · ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
}

function labelNav(id: NavId) {
  if (id === 'sit-rep') return 'Sit-rep'
  if (id === 'later') return 'Later…'
  return id.charAt(0).toUpperCase() + id.slice(1)
}

function labelMail(mode: 'reply' | 'reply-all' | 'forward') {
  if (mode === 'reply-all') return 'Reply All'
  if (mode === 'forward') return 'Forward'
  return 'Reply'
}

function describePatch(patch: Partial<EmailDecision>) {
  if (patch.status) return `Status → ${patch.status}`
  if (patch.owner) return `Owner → ${patch.owner}`
  return undefined
}
