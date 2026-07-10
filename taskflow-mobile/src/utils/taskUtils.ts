import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY, Priority, PRIORITY } from '../constants';

export interface Task {
  id: string;
  title: string;
  description: string;
  label: string;
  priority: Priority;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Load tasks from AsyncStorage ─────────────────────────────────────────────
export async function loadTasksAsync(): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('TaskFlowMobile: failed to load tasks', e);
    return [];
  }
}

// ─── Persist tasks to AsyncStorage ───────────────────────────────────────────
export async function saveTasksAsync(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('TaskFlowMobile: failed to save tasks', e);
  }
}

// ─── Generate a unique ID ─────────────────────────────────────────────────────
export function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Create a new task object ─────────────────────────────────────────────────
export function createTask({
  title,
  description = '',
  label = '',
  priority = PRIORITY.NONE as Priority,
}: {
  title: string;
  description?: string;
  label?: string;
  priority?: Priority;
}): Task {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    label: label.trim(),
    priority,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Priority sort order ─────────────────────────────────────────────────────
const PRIORITY_ORDER: Record<Priority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
  NONE: 3,
};

export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // incomplete first
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    // then priority
    const pa = PRIORITY_ORDER[a.priority] ?? 3;
    const pb = PRIORITY_ORDER[b.priority] ?? 3;
    if (pa !== pb) return pa - pb;
    // then newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
