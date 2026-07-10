import { PRIORITY_META } from '../constants'

/**
 * PriorityBadge — small coloured pill showing task priority.
 */
export default function PriorityBadge({ priority }) {
  if (!priority || priority === 'NONE') return null
  const meta = PRIORITY_META[priority]
  if (!meta) return null

  return (
    <span
      className={`priority-badge priority-badge--${meta.className}`}
      aria-label={`Priority: ${meta.label}`}
    >
      {meta.emoji} {priority}
    </span>
  )
}
