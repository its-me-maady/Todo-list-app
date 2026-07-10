import { useReducer, useEffect, useCallback } from 'react'
import { loadTasks, saveTasks, createTask, sortByPriority } from '../utils/taskUtils'

// ─── Action Types ─────────────────────────────────────────────────────────────
const Actions = {
  INIT:    'INIT',
  ADD:     'ADD',
  UPDATE:  'UPDATE',
  DELETE:  'DELETE',
  TOGGLE:  'TOGGLE',
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function tasksReducer(state, action) {
  switch (action.type) {
    case Actions.INIT:
      return action.tasks

    case Actions.ADD:
      return [createTask(action.payload), ...state]

    case Actions.UPDATE:
      return state.map(task =>
        task.id === action.id
          ? { ...task, ...action.payload, updatedAt: new Date().toISOString() }
          : task
      )

    case Actions.DELETE:
      return state.filter(task => task.id !== action.id)

    case Actions.TOGGLE:
      return state.map(task =>
        task.id === action.id
          ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date().toISOString() }
          : task
      )

    default:
      return state
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTasks() {
  const [tasks, dispatch] = useReducer(tasksReducer, [], loadTasks)

  // Persist to localStorage on every change
  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = useCallback((payload) => {
    dispatch({ type: Actions.ADD, payload })
  }, [])

  const updateTask = useCallback((id, payload) => {
    dispatch({ type: Actions.UPDATE, id, payload })
  }, [])

  const deleteTask = useCallback((id) => {
    dispatch({ type: Actions.DELETE, id })
  }, [])

  const toggleTask = useCallback((id) => {
    dispatch({ type: Actions.TOGGLE, id })
  }, [])

  return {
    tasks: sortByPriority(tasks),
    rawTasks: tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  }
}
