import { PRIORITY, PRIORITY_META } from '../constants'

/**
 * FilterBar — sticky horizontal chip filters for priority and labels.
 * Props:
 *   activePriority   — string | null
 *   activeLabel      — string | null
 *   availableLabels  — string[]
 *   isFiltered       — boolean
 *   onTogglePriority — (priority) => void
 *   onToggleLabel    — (label) => void
 *   onClear          — () => void
 */
export default function FilterBar({
  activePriority,
  activeLabel,
  availableLabels,
  isFiltered,
  onTogglePriority,
  onToggleLabel,
  onClear,
}) {
  const hasLabels = availableLabels.length > 0

  return (
    <nav className="filter-bar" aria-label="Filter tasks">
      {/* Priority filters */}
      <div className="filter-bar__section" role="group" aria-label="Filter by priority">
        {isFiltered && (
          <button
            className="filter-chip filter-chip--active"
            onClick={onClear}
            aria-label="Clear all filters"
          >
            ✕ Clear
          </button>
        )}
        {Object.entries(PRIORITY_META).map(([key, meta]) => (
          <button
            key={key}
            className={`filter-chip filter-chip--priority-${meta.className} ${activePriority === key ? 'filter-chip--active' : ''}`}
            onClick={() => onTogglePriority(key)}
            aria-pressed={activePriority === key}
            aria-label={`Filter by ${meta.label} priority`}
          >
            <span className="filter-chip__dot" aria-hidden="true" />
            {meta.label}
          </button>
        ))}
      </div>

      {/* Label filters — only shown when tasks have labels */}
      {hasLabels && (
        <div className="filter-bar__section" role="group" aria-label="Filter by label">
          {availableLabels.map(label => (
            <button
              key={label}
              className={`filter-chip ${activeLabel === label ? 'filter-chip--active' : ''}`}
              onClick={() => onToggleLabel(label)}
              aria-pressed={activeLabel === label}
              aria-label={`Filter by label: ${label}`}
            >
              🏷 {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
