export type TaskStatus   = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 1 | 2 | 3  // 1=high, 2=medium, 3=low
export type TaskCategory = 'work' | 'personal' | 'family' | 'health' | 'other'
export type ReminderType = 'once' | 'repeating' | 'location'

export interface User {
  id: string
  clerkId: string
  email: string
  name: string | null
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  dueAt: string | null
  estimatedMinutes: number | null
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory
  parentTaskId: string | null
  aiGenerated: boolean
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  taskId: string | null
  userId: string
  remindAt: string
  type: ReminderType
  dismissed: boolean
  snoozeCount: number
  createdAt: string
}

export interface FocusSession {
  id: string
  userId: string
  taskId: string | null
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  completed: boolean
  createdAt: string
}
