import TaskCard from './TaskCard'

/**
 * TaskList — renders the task list, empty states, and section headers.
 * Props:
 *   tasks      — task[]
 *   allCount   — number (unfiltered)
 *   isFiltered — boolean
 *   onToggle   — (id) => void
 *   onEdit     — (task) => void
 *   onAddFirst — () => void
 */
export default function TaskList({ tasks, allCount, isFiltered, onToggle, onEdit, onAddFirst }) {
  const activeTasks = tasks.filter(t => !t.isCompleted)
  const doneTasks   = tasks.filter(t => t.isCompleted)

  // Completely empty (no tasks at all)
  if (allCount === 0) {
    return (
      <main className="task-list" id="task-list" aria-live="polite" aria-label="Task list">
        <div className="empty-state">
          <div className="empty-state__illustration" aria-hidden="true">🎯</div>
          <h2 className="empty-state__title">Your canvas is clear</h2>
          <p className="empty-state__subtitle">
            Add your first task and start making progress. One step at a time.
          </p>
          <button className="empty-state__cta" onClick={onAddFirst}>
            + Add First Task
          </button>
        </div>
      </main>
    )
  }

  // Filtered but nothing matches
  if (tasks.length === 0 && isFiltered) {
    return (
      <main className="task-list" id="task-list" aria-live="polite" aria-label="Task list">
        <div className="empty-state">
          <div className="empty-state__illustration" aria-hidden="true">🔍</div>
          <h2 className="empty-state__title">No matches found</h2>
          <p className="empty-state__subtitle">
            Try adjusting or clearing your filters.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="task-list" id="task-list" aria-live="polite" aria-label="Task list">
      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <>
          <p className="list-section-label" aria-label={`${activeTasks.length} active tasks`}>
            Active · {activeTasks.length}
          </p>
          {activeTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
            />
          ))}
        </>
      )}

      {/* Completed tasks */}
      {doneTasks.length > 0 && (
        <>
          <p className="list-section-label" aria-label={`${doneTasks.length} completed tasks`}>
            Completed · {doneTasks.length}
          </p>
          {doneTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
            />
          ))}
        </>
      )}
    </main>
  )
}
