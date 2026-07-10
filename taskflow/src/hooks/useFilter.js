import { useState, useCallback } from 'react'

/**
 * useFilter — manages the active filter state (priority + label).
 * Returns filter state and helpers for the FilterBar + task list.
 */
export function useFilter(tasks) {
  const [activePriority, setActivePriority] = useState(null)
  const [activeLabel, setActiveLabel] = useState(null)

  const togglePriority = useCallback((priority) => {
    setActivePriority(prev => prev === priority ? null : priority)
  }, [])

  const toggleLabel = useCallback((label) => {
    setActiveLabel(prev => prev === label ? null : label)
  }, [])

  const clearFilters = useCallback(() => {
    setActivePriority(null)
    setActiveLabel(null)
  }, [])

  // Derive unique labels from current task list
  const availableLabels = [...new Set(
    tasks.map(t => t.label).filter(Boolean)
  )]

  const isFiltered = Boolean(activePriority || activeLabel)

  const filteredTasks = tasks.filter(task => {
    if (activePriority && task.priority !== activePriority) return false
    if (activeLabel && task.label !== activeLabel) return false
    return true
  })

  return {
    activePriority,
    activeLabel,
    availableLabels,
    isFiltered,
    filteredTasks,
    togglePriority,
    toggleLabel,
    clearFilters,
  }
}
