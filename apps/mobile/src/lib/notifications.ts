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
