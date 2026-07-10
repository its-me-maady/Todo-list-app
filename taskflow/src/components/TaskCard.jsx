import { useState, useCallback } from 'react'
import PriorityBadge from './PriorityBadge'

/**
 * TaskCard — renders a single task.
 * Props:
 *   task        — task object
 *   onToggle    — (id) => void
 *   onEdit      — (task) => void
 */
export default function TaskCard({ task, onToggle, onEdit }) {
  const [animating, setAnimating] = useState(false)

  const handleToggle = useCallback((e) => {
    e.stopPropagation()
    setAnimating(true)
    setTimeout(() => setAnimating(false), 300)
    onToggle(task.id)
  }, [task.id, onToggle])

  const handleCardClick = useCallback(() => {
    onEdit(task)
  }, [task, onEdit])

  const priorityCls = (task.priority || 'none').toLowerCase()

  return (
    <article
      className={`task-card task-card--${priorityCls} ${task.isCompleted ? 'task-card--completed' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. ${task.isCompleted ? 'Completed' : 'Incomplete'}. Tap to edit.`}
      onKeyDown={e => e.key === 'Enter' && handleCardClick()}
    >
      {/* Checkbox */}
      <button
        className={`task-checkbox ${task.isCompleted ? 'task-checkbox--checked' : ''} ${animating ? 'task-checkbox--animate' : ''}`}
        onClick={handleToggle}
        aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        aria-pressed={task.isCompleted}
      >
        <span className="task-checkbox__icon" aria-hidden="true">✓</span>
      </button>

      {/* Body */}
      <div className="task-card__body">
        {/* Meta row: priority + label */}
        {(task.priority !== 'NONE' || task.label) && (
          <div className="task-card__meta">
            <PriorityBadge priority={task.priority} />
            {task.label && (
              <span className="label-badge" aria-label={`Label: ${task.label}`}>
                🏷 {task.label}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="task-card__title">{task.title}</h3>

        {/* Description */}
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
      </div>
    </article>
  )
}
