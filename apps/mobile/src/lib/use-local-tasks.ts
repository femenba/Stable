import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type LocalTask = { id: string; title: string; done: boolean }

const KEY = 'stable:today-tasks'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useLocalTasks() {
  const [tasks, setTasks] = useState<LocalTask[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setTasks(JSON.parse(raw))
      setLoaded(true)
    })
  }, [])

  function persist(next: LocalTask[]) {
    setTasks(next)
    AsyncStorage.setItem(KEY, JSON.stringify(next))
  }

  function addTask(title: string) {
    const trimmed = title.trim()
    if (!trimmed || tasks.length >= 3) return
    persist([...tasks, { id: makeId(), title: trimmed, done: false }])
  }

  function toggleTask(id: string) {
    persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function removeTask(id: string) {
    persist(tasks.filter((t) => t.id !== id))
  }

  return { tasks, addTask, toggleTask, removeTask, loaded }
}
