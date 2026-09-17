import type { ReactNode } from 'react'
import type { NavId } from '../types'

const NAV: { id: NavId; label: string }[] = [
  { id: 'sit-rep', label: 'Sit-rep' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'work', label: 'Work' },
  { id: 'mail', label: 'Mail' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'later', label: 'Later…' },
]

type Props = {
  active: NavId
  titleMeta: string
  clock: string
  navOpen: boolean
  onToggleNav: () => void
  onNav: (id: NavId) => void
  children: ReactNode
}

export function ChromeShell({
  active,
  titleMeta,
  clock,
  navOpen,
  onToggleNav,
  onNav,
  children,
}: Props) {
  const title = active === 'sit-rep' ? 'Sit-rep' : NAV.find((item) => item.id === active)?.label

  return (
    <div className={`chrome${navOpen ? ' is-nav-open' : ''}`}>
      <div className="chrome__atmosphere" aria-hidden="true">
        <div className="chrome__heat chrome__heat--floor" />
        <div className="chrome__heat chrome__heat--top" />
        <div className="chrome__vignette" />
      </div>

      <button type="button" className="chrome__menu" onClick={onToggleNav}>
        {navOpen ? 'Close nav' : 'NICK OS'}
      </button>

      <nav className="chrome__nav" aria-label="Nick OS">
        <div className="chrome__nav-glow" />
        <div className="chrome__mark">NICK OS</div>
        <div className="chrome__nav-list">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chrome__nav-item${active === item.id ? ' is-active' : ''}`}
              onClick={() => onNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="chrome__nav-foot">stubs · later</div>
      </nav>

      <header className="chrome__title">
        <div className="chrome__title-copy">
          <h1>{title}</h1>
          <span className="chrome__title-meta">{titleMeta}</span>
        </div>
        <div className="chrome__title-right">{clock}</div>
        <div className="chrome__hairline" />
      </header>

      <div className="chrome__canvas-wrap">
        <div className="chrome__canvas">{children}</div>
      </div>
    </div>
  )
}

export function StubPage({
  name,
  onBack,
}: {
  name: string
  onBack: () => void
}) {
  return (
    <div className="chrome__stub">
      <h2>{name} is a later stub</h2>
      <p>
        Email decisions live on Sit-rep — not as a Mail home. This chrome item is
        reserved so the Night Forge shell matches the stamped Ledger nav.
      </p>
      <button type="button" onClick={onBack}>
        Back to Sit-rep
      </button>
    </div>
  )
}
