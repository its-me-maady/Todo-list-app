import { STORAGE_KEY, PRIORITY } from '../constants'

// ─── Load tasks from localStorage ─────────────────────────────────────────────
export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// ─── Persist tasks to localStorage ───────────────────────────────────────────
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('TaskFlow: failed to save tasks', e)
  }
}

// ─── Generate a unique ID ─────────────────────────────────────────────────────
export function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ─── Create a new task object ─────────────────────────────────────────────────
export function createTask({ title, description = '', label = '', priority = PRIORITY.NONE }) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    label: label.trim(),
    priority,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  }
}

// ─── Priority sort order ─────────────────────────────────────────────────────
const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2, NONE: 3 }

export function sortByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    // incomplete first
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1
    // then priority
    const pa = PRIORITY_ORDER[a.priority] ?? 3
    const pb = PRIORITY_ORDER[b.priority] ?? 3
    if (pa !== pb) return pa - pb
    // then newest first
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
}
