import { useReducer, useEffect, useCallback, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { loadTasksAsync, saveTasksAsync, createTask, sortByPriority, Task, fromAPI, toAPI } from '../utils/taskUtils';
import { useAuth } from './useAuth';
import { api, ApiError } from '../utils/api';

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
  | { type: typeof Actions.ADD; task: Task }
  | { type: typeof Actions.UPDATE; id: string; payload: any }
  | { type: typeof Actions.DELETE; id: string }
  | { type: typeof Actions.TOGGLE; id: string };

// ─── Reducer ──────────────────────────────────────────────────────────────────
function tasksReducer(state: Task[], action: ActionType): Task[] {
  switch (action.type) {
    case Actions.INIT:
      return action.tasks;

    case Actions.ADD:
      return [action.task, ...state];

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
  const { isLoggedIn, token, isAuthLoaded, logout } = useAuth();
  const hasInitialized = useRef(false);

  const handleApiError = useCallback((err: any) => {
    if (err instanceof ApiError && err.status === 401) {
      Alert.alert('Session Expired', 'Please log in again.');
      logout();
    } else {
      Alert.alert('Error', err.message || 'Failed to sync with cloud.');
    }
  }, [logout]);

  // 1. Load tasks on mount or auth change
  useEffect(() => {
    if (!isAuthLoaded) return;

    async function initTasks() {
      if (isLoggedIn && token) {
        try {
          const res = await api.get<{ data: any[] }>('/api/tasks', token);
          const mappedTasks = res.data.map(fromAPI);
          dispatch({ type: Actions.INIT, tasks: mappedTasks });
        } catch (err) {
          handleApiError(err);
        }
      } else {
        const storedTasks = await loadTasksAsync();
        dispatch({ type: Actions.INIT, tasks: storedTasks });
      }
      setIsLoaded(true);
      hasInitialized.current = true;
    }
    initTasks();
  }, [isLoggedIn, token, isAuthLoaded, handleApiError]);

  // 2. Persist to AsyncStorage ONLY in offline mode
  useEffect(() => {
    if (hasInitialized.current && !isLoggedIn) {
      saveTasksAsync(tasks);
    }
  }, [tasks, isLoggedIn]);

  const addTask = useCallback(async (payload: any) => {
    if (isLoggedIn && token) {
      try {
        const reqBody = toAPI(payload);
        const res = await api.post<{ data: any }>('/api/tasks', reqBody, token);
        dispatch({ type: Actions.ADD, task: fromAPI(res.data) });
      } catch (err) {
        handleApiError(err);
      }
    } else {
      dispatch({ type: Actions.ADD, task: createTask(payload) });
    }
  }, [isLoggedIn, token, handleApiError]);

  const updateTask = useCallback(async (id: string, payload: any) => {
    if (isLoggedIn && token) {
      try {
        const reqBody = toAPI(payload);
        await api.put(`/api/tasks/${id}`, reqBody, token);
        dispatch({ type: Actions.UPDATE, id, payload });
      } catch (err) {
        handleApiError(err);
      }
    } else {
      dispatch({ type: Actions.UPDATE, id, payload });
    }
  }, [isLoggedIn, token, handleApiError]);

  const deleteTask = useCallback(async (id: string) => {
    if (isLoggedIn && token) {
      try {
        await api.delete(`/api/tasks/${id}`, token);
        dispatch({ type: Actions.DELETE, id });
      } catch (err) {
        handleApiError(err);
      }
    } else {
      dispatch({ type: Actions.DELETE, id });
    }
  }, [isLoggedIn, token, handleApiError]);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (isLoggedIn && token) {
      try {
        const payload = { ...task, isCompleted: !task.isCompleted };
        const reqBody = toAPI(payload);
        await api.put(`/api/tasks/${id}`, reqBody, token);
        dispatch({ type: Actions.TOGGLE, id });
      } catch (err) {
        handleApiError(err);
      }
    } else {
      dispatch({ type: Actions.TOGGLE, id });
    }
  }, [tasks, isLoggedIn, token, handleApiError]);

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
