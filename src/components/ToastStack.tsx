import type { ToastItem } from '../types'

type Props = {
  toasts: ToastItem[]
}

export function ToastStack({ toasts }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast is-${toast.kind}`}>
          {toast.text}
        </div>
      ))}
    </div>
  )
}
