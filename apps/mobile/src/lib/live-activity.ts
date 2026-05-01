import { Platform } from 'react-native'

interface LiveActivityPayload {
  sessionId: string
  taskName: string
  startedAt: string   // ISO timestamp
}

let ActivityModule: any = null

if (Platform.OS === 'ios') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ActivityModule = require('@lodev09/react-native-live-activities').LiveActivities
  } catch (_) {
    // package not installed yet — no-op
  }
}

export async function startLiveActivity(payload: LiveActivityPayload): Promise<string | null> {
  if (!ActivityModule) return null
  try {
    const id = await ActivityModule.startActivity('FocusTimerActivity', {
      sessionId: payload.sessionId,
      taskName:  payload.taskName,
      startedAt: payload.startedAt,
    })
    return id as string
  } catch {
    return null
  }
}

export async function endLiveActivity(activityId: string): Promise<void> {
  if (!ActivityModule || !activityId) return
  try {
    await ActivityModule.endActivity(activityId)
  } catch (_) {}
}
