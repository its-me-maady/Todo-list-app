// ─── Task Priority Levels ───────────────────────────────────────────────────
export const PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  NONE: 'NONE',
}

export const PRIORITY_META = {
  HIGH:   { label: '🔴 High',   className: 'high',   emoji: '🔴' },
  MEDIUM: { label: '🟡 Medium', className: 'medium', emoji: '🟡' },
  LOW:    { label: '🟢 Low',    className: 'low',    emoji: '🟢' },
  NONE:   { label: '⚪ None',   className: 'none',   emoji: '⚪' },
}

// ─── Preset Label Suggestions ────────────────────────────────────────────────
export const PRESET_LABELS = [
  'Work',
  'Personal',
  'Urgent',
  'Health',
  'Finance',
  'Learning',
  'Shopping',
  'Home',
]

// ─── localStorage Key ─────────────────────────────────────────────────────────
export const STORAGE_KEY = 'taskflow_tasks'
