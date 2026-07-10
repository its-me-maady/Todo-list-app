import { useState, useCallback } from 'react';
import { Task } from '../utils/taskUtils';
import { Priority } from '../constants';

/**
 * useFilter — manages the active filter state (priority + label).
 * Returns filter state and helpers for the FilterBar + task list.
 */
export function useFilter(tasks: Task[]) {
  const [activePriority, setActivePriority] = useState<Priority | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const togglePriority = useCallback((priority: Priority) => {
    setActivePriority(prev => prev === priority ? null : priority);
  }, []);

  const toggleLabel = useCallback((label: string) => {
    setActiveLabel(prev => prev === label ? null : label);
  }, []);

  const clearFilters = useCallback(() => {
    setActivePriority(null);
    setActiveLabel(null);
  }, []);

  // Derive unique labels from current task list
  const availableLabels = [...new Set(
    tasks.map(t => t.label).filter(Boolean)
  )];

  const isFiltered = Boolean(activePriority || activeLabel);

  const filteredTasks = tasks.filter(task => {
    if (activePriority && task.priority !== activePriority) return false;
    if (activeLabel && task.label !== activeLabel) return false;
    return true;
  });

  return {
    activePriority,
    activeLabel,
    availableLabels,
    isFiltered,
    filteredTasks,
    togglePriority,
    toggleLabel,
    clearFilters,
  };
}
