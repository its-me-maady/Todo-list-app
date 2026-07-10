// ─── Task Priority Levels ───────────────────────────────────────────────────
export const PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  NONE: 'NONE',
} as const;

export type Priority = typeof PRIORITY[keyof typeof PRIORITY];

export const PRIORITY_META = {
  HIGH:   { label: '🔴 High',   color: '#ff4444', emoji: '🔴' },
  MEDIUM: { label: '🟡 Medium', color: '#ffbb33', emoji: '🟡' },
  LOW:    { label: '🟢 Low',    color: '#00C851', emoji: '🟢' },
  NONE:   { label: '⚪ None',   color: '#aaa',    emoji: '⚪' },
};

// ─── Preset Label Suggestions ────────────────────────────────────────────────
export const PRESET_LABELS = [
  'Personal',
  'Work',
  'Urgent',
  'Health',
  'Finance',
  'Learning',
  'Shopping',
  'Home',
];

// ─── AsyncStorage Key ─────────────────────────────────────────────────────────
export const STORAGE_KEY = 'taskflow_tasks_native';
