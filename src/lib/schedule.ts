export interface DaySchedule {
  enabled: boolean
  open: string // e.g. "09:00 AM"
  close: string // e.g. "07:00 PM"
}

export interface LunchBreakConfig {
  enabled: boolean
  start: string // e.g. "12:00 PM"
  end: string // e.g. "01:00 PM"
}

export interface ScheduleConfig {
  slot_interval: number // in minutes: 15, 30, 45, 60
  lunch_break: LunchBreakConfig
  days: {
    monday: DaySchedule
    tuesday: DaySchedule
    wednesday: DaySchedule
    thursday: DaySchedule
    friday: DaySchedule
    saturday: DaySchedule
    sunday: DaySchedule
  }
}

export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  slot_interval: 30,
  lunch_break: {
    enabled: true,
    start: '12:00 PM',
    end: '01:00 PM'
  },
  days: {
    monday: { enabled: true, open: '08:00 AM', close: '07:00 PM' },
    tuesday: { enabled: true, open: '08:00 AM', close: '07:00 PM' },
    wednesday: { enabled: true, open: '08:00 AM', close: '07:00 PM' },
    thursday: { enabled: true, open: '08:00 AM', close: '07:00 PM' },
    friday: { enabled: true, open: '08:00 AM', close: '08:00 PM' },
    saturday: { enabled: true, open: '09:00 AM', close: '07:00 PM' },
    sunday: { enabled: false, open: '09:00 AM', close: '02:00 PM' }
  }
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const parts = timeStr.trim().split(' ')
  const timePart = parts[0]
  const modifier = parts[1] || 'AM'
  let [hours, minutes] = timePart.split(':').map(Number)
  if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0
  return hours * 60 + (minutes || 0)
}

export function formatMinutesToTime(totalMinutes: number): string {
  let hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const modifier = hours >= 12 ? 'PM' : 'AM'
  if (hours > 12) hours -= 12
  if (hours === 0) hours = 12
  const formattedHours = hours.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')
  return `${formattedHours}:${formattedMinutes} ${modifier}`
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

export function getDayKeyForDate(dateStr: string): typeof DAY_KEYS[number] {
  // dateStr is YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return DAY_KEYS[date.getDay()]
}

export function isDayOpen(config: ScheduleConfig | null | undefined, dateStr: string): boolean {
  const schedule = config || DEFAULT_SCHEDULE_CONFIG
  const dayKey = getDayKeyForDate(dateStr)
  return schedule.days?.[dayKey]?.enabled ?? true
}

export function generateTimeSlotsForDate(
  config: ScheduleConfig | null | undefined,
  dateStr: string
): string[] {
  const schedule = config || DEFAULT_SCHEDULE_CONFIG
  const dayKey = getDayKeyForDate(dateStr)
  const dayConfig = schedule.days?.[dayKey]

  if (!dayConfig || !dayConfig.enabled) {
    return []
  }

  const openMin = parseTimeToMinutes(dayConfig.open || '08:00 AM')
  const closeMin = parseTimeToMinutes(dayConfig.close || '07:00 PM')
  const interval = schedule.slot_interval || 30

  const lunchEnabled = schedule.lunch_break?.enabled
  const lunchStart = lunchEnabled ? parseTimeToMinutes(schedule.lunch_break.start) : -1
  const lunchEnd = lunchEnabled ? parseTimeToMinutes(schedule.lunch_break.end) : -1

  const slots: string[] = []

  for (let current = openMin; current + interval <= closeMin; current += interval) {
    // Si coincide con la hora de almuerzo, omitir
    if (lunchEnabled && current >= lunchStart && current < lunchEnd) {
      continue
    }
    slots.push(formatMinutesToTime(current))
  }

  return slots
}
