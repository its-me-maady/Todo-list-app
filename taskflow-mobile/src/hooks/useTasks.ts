import { useReducer, useEffect, useCallback, useState } from 'react';
import { loadTasksAsync, saveTasksAsync, createTask, sortByPriority, Task } from '../utils/taskUtils';

// ─── Action Types ─────────────────────────────────────────────────────────────
const Actions = {
  INIT:    'INIT',
  ADD:     'ADD',
  UPDATE:  'UPDATE',
  DELETE:  'DELETE',
  TOGGLE:  'TOGGLE',
} as const;

type ActionType =
  | { type: typeof Actions.INIT; tasks: Task[] }
  | { type: typeof Actions.ADD; payload: any }
  | { type: typeof Actions.UPDATE; id: string; payload: any }
  | { type: typeof Actions.DELETE; id: string }
  | { type: typeof Actions.TOGGLE; id: string };

// ─── Reducer ──────────────────────────────────────────────────────────────────
function tasksReducer(state: Task[], action: ActionType): Task[] {
  switch (action.type) {
    case Actions.INIT:
      return action.tasks;

    case Actions.ADD:
      return [createTask(action.payload), ...state];

    case Actions.UPDATE:
      return state.map(task =>
        task.id === action.id
          ? { ...task, ...action.payload, updatedAt: new Date().toISOString() }
          : task
      );

    case Actions.DELETE:
      return state.filter(task => task.id !== action.id);

    case Actions.TOGGLE:
      return state.map(task =>
        task.id === action.id
          ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date().toISOString() }
          : task
      );

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTasks() {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    async function initTasks() {
      const storedTasks = await loadTasksAsync();
      dispatch({ type: Actions.INIT, tasks: storedTasks });
      setIsLoaded(true);
    }
    initTasks();
  }, []);

  // Persist to AsyncStorage on every change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveTasksAsync(tasks);
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback((payload: any) => {
    dispatch({ type: Actions.ADD, payload });
  }, []);

  const updateTask = useCallback((id: string, payload: any) => {
    dispatch({ type: Actions.UPDATE, id, payload });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: Actions.DELETE, id });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: Actions.TOGGLE, id });
  }, []);

  return {
    isLoaded,
    tasks: sortByPriority(tasks),
    rawTasks: tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}
