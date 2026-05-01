import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
})

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleReminderNotification(
  reminderId: string,
  remindAt: string,  // ISO timestamp
  type: string,
): Promise<string | null> {
  const date = new Date(remindAt)
  if (date <= new Date()) return null
  const granted = await requestNotificationPermissions()
  if (!granted) return null
  const notifId = await Notifications.scheduleNotificationAsync({
    identifier: `reminder-${reminderId}`,
    content: {
      title: 'stable. Reminder',
      body:  `Time for your ${type} reminder`,
      data:  { reminderId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  })
  return notifId
}

export async function cancelReminderNotification(reminderId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`reminder-${reminderId}`)
}

// Focus session end notification
// Schedules a notification to fire exactly when the session timer hits zero.
// Call again on resume (with remaining seconds) to reschedule after a pause.
export async function scheduleFocusCompleteNotification(
  durationMinutes: number,
  fireAt: Date,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('focus-complete')
  const granted = await requestNotificationPermissions()
  if (!granted) return
  if (fireAt <= new Date()) return
  await Notifications.scheduleNotificationAsync({
    identifier: 'focus-complete',
    content: {
      title: 'Focus session complete!',
      body:  `${durationMinutes} min well spent. Take a short break.`,
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  })
}

export async function cancelFocusCompleteNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('focus-complete')
}
