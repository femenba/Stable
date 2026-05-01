import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type TaskCategory = 'work' | 'personal' | 'family' | 'health' | 'other'
export type TaskPriority  = 1 | 2 | 3  // 1 = high, 2 = medium, 3 = low

export type AllTask = {
  id:        string
  title:     string
  category:  TaskCategory
  priority:  TaskPriority
  done:      boolean
  createdAt: number
}

const KEY = 'stable:tasks'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useAllTasks() {
  const [tasks, setTasks] = useState<AllTask[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setTasks(JSON.parse(raw))
      setLoaded(true)
    })
  }, [])

  function persist(next: AllTask[]) {
    setTasks(next)
    AsyncStorage.setItem(KEY, JSON.stringify(next))
  }

  function addTask(
    title:    string,
    category: TaskCategory = 'work',
    priority: TaskPriority  = 2,
  ) {
    const trimmed = title.trim()
    if (!trimmed) return
    persist([
      { id: makeId(), title: trimmed, category, priority, done: false, createdAt: Date.now() },
      ...tasks,
    ])
  }

  function toggleTask(id: string) {
    persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function removeTask(id: string) {
    persist(tasks.filter((t) => t.id !== id))
  }

  const active    = tasks.filter((t) => !t.done).sort((a, b) => a.priority - b.priority)
  const completed = tasks.filter((t) => t.done)

  return { tasks, active, completed, addTask, toggleTask, removeTask, loaded }
}
