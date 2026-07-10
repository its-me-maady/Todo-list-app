import { useState, useCallback, useEffect } from 'react'
import { useTasks } from './hooks/useTasks'
import { useFilter } from './hooks/useFilter'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import TaskModal from './components/TaskModal'

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div className="splash" role="status" aria-label="TaskFlow loading">
      <div className="splash__logo" aria-hidden="true">⚡</div>
      <h1 className="splash__title">TaskFlow</h1>
      <p className="splash__tagline">Stay in the flow.</p>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ total, done }) {
  return (
    <header className="header">
      <div className="header__top">
        <div className="header__logo">
          <div className="header__logo-icon" aria-hidden="true">⚡</div>
          <h1 className="header__title">TaskFlow</h1>
        </div>
        <span className="header__stats" aria-label={`${done} of ${total} tasks completed`}>
          {done}/{total} done
        </span>
      </div>
      <div className="header__divider" aria-hidden="true" />
    </header>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks()

  const {
    activePriority,
    activeLabel,
    availableLabels,
    isFiltered,
    filteredTasks,
    togglePriority,
    toggleLabel,
    clearFilters,
  } = useFilter(tasks)

  // Show splash for 1.4 s
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1400)
    return () => clearTimeout(t)
  }, [])

  // ── Handlers ──
  const openAdd = useCallback(() => {
    setEditingTask(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((task) => {
    setEditingTask(task)
    setModalOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setModalOpen(false)
    setEditingTask(null)
  }, [])

  const handleSave = useCallback((formData) => {
    if (editingTask) {
      updateTask(editingTask.id, formData)
    } else {
      addTask(formData)
    }
  }, [editingTask, updateTask, addTask])

  const handleDelete = useCallback((id) => {
    deleteTask(id)
  }, [deleteTask])

  // ── Stats ──
  const totalCount = tasks.length
  const doneCount  = tasks.filter(t => t.isCompleted).length

  if (splash) return <SplashScreen />

  return (
    <div className="app-layout">
      <Header total={totalCount} done={doneCount} />

      <FilterBar
        activePriority={activePriority}
        activeLabel={activeLabel}
        availableLabels={availableLabels}
        isFiltered={isFiltered}
        onTogglePriority={togglePriority}
        onToggleLabel={toggleLabel}
        onClear={clearFilters}
      />

      <TaskList
        tasks={filteredTasks}
        allCount={totalCount}
        isFiltered={isFiltered}
        onToggle={toggleTask}
        onEdit={openEdit}
        onAddFirst={openAdd}
      />

      {/* FAB */}
      <div className="fab">
        <button
          className="fab__button"
          onClick={openAdd}
          aria-label="Add new task"
          aria-controls="task-list"
        >
          <span className="fab__icon" aria-hidden="true">+</span>
          Add Task
        </button>
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={modalOpen}
        task={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    </div>
  )
}
