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
  slot_interval?: number // in minutes: 15, 30, 45, 60
  lunch_break?: LunchBreakConfig
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

export interface WeeklyScheduleDayItem {
  key: string
  label: string
  enabled: boolean
  open: string
  close: string
  isToday: boolean
}

export interface BusinessLiveStatus {
  isOpenNow: boolean
  statusBadgeText: string
  statusDetailText: string
  todayScheduleText: string
  weeklySchedule: WeeklyScheduleDayItem[]
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

export const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
}

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

  const lunchEnabled = !!schedule.lunch_break?.enabled
  const lunchStart = lunchEnabled && schedule.lunch_break?.start ? parseTimeToMinutes(schedule.lunch_break.start) : -1
  const lunchEnd = lunchEnabled && schedule.lunch_break?.end ? parseTimeToMinutes(schedule.lunch_break.end) : -1

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

export function formatScheduleSummaryText(config: ScheduleConfig | null | undefined): string {
  const schedule = config || DEFAULT_SCHEDULE_CONFIG
  const days = schedule.days
  if (!days) return ''

  const mon = days.monday
  const tue = days.tuesday
  const wed = days.wednesday
  const thu = days.thursday
  const fri = days.friday
  const sat = days.saturday
  const sun = days.sunday

  const weekdaySame = mon?.enabled && tue?.enabled && wed?.enabled && thu?.enabled && fri?.enabled &&
    mon.open === tue.open && mon.close === tue.close &&
    mon.open === wed.open && mon.close === wed.close &&
    mon.open === thu.open && mon.close === thu.close &&
    mon.open === fri.open && mon.close === fri.close

  const parts: string[] = []
  if (weekdaySame) {
    parts.push(`Lunes a Viernes de ${mon.open} a ${mon.close}`)
  } else {
    const activeDays: string[] = []
    if (mon?.enabled) activeDays.push(`Lun (${mon.open}-${mon.close})`)
    if (tue?.enabled) activeDays.push(`Mar (${tue.open}-${tue.close})`)
    if (wed?.enabled) activeDays.push(`Mié (${wed.open}-${wed.close})`)
    if (thu?.enabled) activeDays.push(`Jue (${thu.open}-${thu.close})`)
    if (fri?.enabled) activeDays.push(`Vie (${fri.open}-${fri.close})`)
    if (activeDays.length > 0) parts.push(activeDays.join(', '))
  }

  if (sat?.enabled) {
    parts.push(`Sábados de ${sat.open} a ${sat.close}`)
  } else {
    parts.push(`Sábados: Cerrado`)
  }

  if (sun?.enabled) {
    parts.push(`Domingos de ${sun.open} a ${sun.close}`)
  } else {
    parts.push(`Domingos: Cerrado`)
  }

  return parts.join(' • ')
}

export function getBusinessLiveStatus(config: ScheduleConfig | null | undefined): BusinessLiveStatus {
  const schedule = config || DEFAULT_SCHEDULE_CONFIG
  const now = new Date()
  const currentDayIndex = now.getDay() // 0 = Sunday, 1 = Monday...
  const currentDayKey = DAY_KEYS[currentDayIndex]
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const dayConfig = schedule.days?.[currentDayKey]
  const isOpenToday = dayConfig?.enabled ?? false

  let isOpenNow = false
  let statusDetailText = ''

  if (!isOpenToday) {
    isOpenNow = false
    statusDetailText = 'Cerrado hoy'
  } else {
    const openMin = parseTimeToMinutes(dayConfig.open || '08:00 AM')
    const closeMin = parseTimeToMinutes(dayConfig.close || '07:00 PM')
    const lunchEnabled = !!schedule.lunch_break?.enabled
    const lunchStart = lunchEnabled && schedule.lunch_break?.start ? parseTimeToMinutes(schedule.lunch_break.start) : -1
    const lunchEnd = lunchEnabled && schedule.lunch_break?.end ? parseTimeToMinutes(schedule.lunch_break.end) : -1

    if (lunchEnabled && currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
      isOpenNow = false
      statusDetailText = `En pausa de comida hasta las ${schedule.lunch_break?.end || ''}`
    } else if (currentMinutes >= openMin && currentMinutes < closeMin) {
      isOpenNow = true
      statusDetailText = `Abierto hasta las ${dayConfig.close}`
    } else if (currentMinutes < openMin) {
      isOpenNow = false
      statusDetailText = `Abre hoy a las ${dayConfig.open}`
    } else {
      isOpenNow = false
      statusDetailText = `Cerró hoy a las ${dayConfig.close}`
    }
  }

  const orderKeys: Array<typeof DAY_KEYS[number]> = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const weeklySchedule: WeeklyScheduleDayItem[] = orderKeys.map(key => {
    const d = schedule.days?.[key] || { enabled: false, open: '08:00 AM', close: '07:00 PM' }
    return {
      key,
      label: DAY_LABELS[key] || key,
      enabled: d.enabled,
      open: d.open || '08:00 AM',
      close: d.close || '07:00 PM',
      isToday: key === currentDayKey
    }
  })

  const todayScheduleText = isOpenToday 
    ? `${dayConfig?.open} - ${dayConfig?.close}`
    : 'Cerrado'

  return {
    isOpenNow,
    statusBadgeText: isOpenNow ? 'Abierto Ahora' : 'Cerrado Ahora',
    statusDetailText,
    todayScheduleText,
    weeklySchedule
  }
}
