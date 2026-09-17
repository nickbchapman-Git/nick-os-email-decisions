export type Status =
  | 'Needs decision'
  | 'Reviewing'
  | 'Waiting'
  | 'Deferred'
  | 'Cleared'

export type Owner = 'Nick' | 'James' | 'Nolan' | 'Joey' | 'Maya' | 'Unassigned'

export type MailMode = 'reply' | 'reply-all' | 'forward' | null

export type ThreadMessage = {
  id: string
  from: string
  time: string
  body: string
}

export type LinkedTodo = {
  id: string
  title: string
  project: string
}

export type EmailDecision = {
  id: string
  sender: string
  senderEmail: string
  recipients: string
  subject: string
  chainSummary: string
  labels: string[]
  time: string
  fifo: number
  status: Status
  owner: Owner
  next: string
  linked: string[]
  following: boolean
  archived: boolean
  mailMode: MailMode
  draft: string
  jarvisNote: string
  rewriteCount: number
  messages: ThreadMessage[]
  todos: LinkedTodo[]
  lastAction: string | null
}

export type LogEntry = {
  id: string
  at: string
  emailId: string
  subject: string
  text: string
}

export type ToastItem = {
  id: string
  kind: 'ok' | 'gate' | 'stub'
  text: string
}

export type NavId = 'sit-rep' | 'ledger' | 'work' | 'mail' | 'calendar' | 'later'

export const STATUSES: Status[] = [
  'Needs decision',
  'Reviewing',
  'Waiting',
  'Deferred',
  'Cleared',
]

export const OWNERS: Owner[] = [
  'Nick',
  'James',
  'Nolan',
  'Joey',
  'Maya',
  'Unassigned',
]
