/** Mock Jarvis rewrite — regenerates from the current draft box + a stamped note. */
export function rewriteDraft(
  current: string,
  jarvisNote: string,
  senderFirst: string,
  rewriteCount: number,
): string {
  const cleaned = current
    .replace(/^\[Jarvis rewrite #\d+\][^\n]*\n+/i, '')
    .trim()

  const next = rewriteCount + 1
  const beats = [
    `${senderFirst} — ${tighten(cleaned)} Confirm back so I can close the loop.`,
    `${senderFirst} — Decision: ${decisionLine(cleaned)} ${clockLine(jarvisNote)}`,
    `${senderFirst} — ${ownerLine(cleaned)} ${jarvisNote.split('.')[0]}.`,
  ]

  return `[Jarvis rewrite #${next}] ${jarvisNote}\n\n${beats[rewriteCount % beats.length]}`
}

function tighten(text: string): string {
  const clipped = text
    .replace(/^[^—–-]*[—–-]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (clipped.length <= 140) return clipped
  return `${clipped.slice(0, 137).trim()}…`
}

function decisionLine(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('approved') || lower.includes('sign') || lower.includes('keep')) {
    return 'yes — proceed as written.'
  }
  if (lower.includes('hold') || lower.includes('later')) {
    return 'hold until the related call lands.'
  }
  return 'I have the thread — next step is below.'
}

function clockLine(note: string): string {
  const match = note.match(/\b(noon|6p|today|tonight|Friday|EOD)\b/i)
  return match ? `Clock: ${match[1]}.` : 'Clock: today.'
}

function ownerLine(text: string): string {
  if (/nolan/i.test(text)) return 'Nolan covers.'
  if (/james/i.test(text)) return 'James stays on the thread.'
  if (/maya/i.test(text)) return 'Maya holds the broker.'
  return 'I own the next move.'
}
