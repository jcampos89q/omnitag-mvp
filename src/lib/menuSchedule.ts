export interface CategoryScheduleConfig {
  type: 'all_day' | 'breakfast' | 'lunch' | 'dinner' | 'custom'
  start_time?: string // HH:mm (24h)
  end_time?: string   // HH:mm (24h)
  label?: string
  updated_at?: string
}

export const PRESET_SCHEDULES: Record<string, { label: string; start: string; end: string; icon: string }> = {
  all_day: {
    label: 'Todo el día (Siempre visible)',
    start: '00:00',
    end: '23:59',
    icon: '✨'
  },
  breakfast: {
    label: 'Desayunos (7:00 AM - 10:30 AM)',
    start: '07:00',
    end: '10:30',
    icon: '🍳'
  },
  lunch: {
    label: 'Almuerzos (10:30 AM - 3:00 PM)',
    start: '10:30',
    end: '15:00',
    icon: '🍲'
  },
  dinner: {
    label: 'Cenas (6:00 PM - 11:00 PM)',
    start: '18:00',
    end: '23:00',
    icon: '🌙'
  },
  custom: {
    label: 'Horario Personalizado',
    start: '08:00',
    end: '18:00',
    icon: '⏰'
  }
}

export function parseTimeToMinutes24(timeStr?: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function formatTime24To12(timeStr?: string): string {
  if (!timeStr) return ''
  const [hStr, mStr] = timeStr.split(':')
  let h = parseInt(hStr || '0', 10)
  const m = parseInt(mStr || '0', 10)
  const modifier = h >= 12 ? 'PM' : 'AM'
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return `${h}:${m.toString().padStart(2, '0')} ${modifier}`
}

/**
 * Obtiene la configuración de horario de una categoría, con auto-detección inteligente por nombre
 */
export function resolveCategorySchedule(
  categoryId: string,
  categoryName: string,
  storedSchedules?: Record<string, CategoryScheduleConfig>
): CategoryScheduleConfig {
  if (storedSchedules && storedSchedules[categoryId]) {
    const s = storedSchedules[categoryId]
    if (s.type === 'breakfast') {
      return {
        type: 'breakfast',
        start_time: s.start_time || '07:00',
        end_time: s.end_time || '10:30',
        label: s.label || 'Desayunos'
      }
    }
    if (s.type === 'lunch') {
      return {
        type: 'lunch',
        start_time: s.start_time || '10:30',
        end_time: s.end_time || '15:00',
        label: s.label || 'Almuerzos'
      }
    }
    if (s.type === 'dinner') {
      return {
        type: 'dinner',
        start_time: s.start_time || '18:00',
        end_time: s.end_time || '23:00',
        label: s.label || 'Cenas'
      }
    }
    if (s.type === 'custom') {
      return {
        type: 'custom',
        start_time: s.start_time || '08:00',
        end_time: s.end_time || '18:00',
        label: s.label || 'Horario Especial'
      }
    }
    return {
      type: 'all_day',
      start_time: '00:00',
      end_time: '23:59',
      label: 'Todo el día'
    }
  }

  // Detección automática por palabras clave en el nombre de la categoría
  const lower = (categoryName || '').toLowerCase()
  if (lower.includes('desayun')) {
    return {
      type: 'breakfast',
      start_time: '07:00',
      end_time: '10:30',
      label: 'Desayunos (7:00 AM - 10:30 AM)'
    }
  }
  if (lower.includes('almuerz')) {
    return {
      type: 'lunch',
      start_time: '10:30',
      end_time: '15:00',
      label: 'Almuerzos (10:30 AM - 3:00 PM)'
    }
  }
  if (lower.includes('cena')) {
    return {
      type: 'dinner',
      start_time: '18:00',
      end_time: '23:00',
      label: 'Cenas (6:00 PM - 11:00 PM)'
    }
  }

  return {
    type: 'all_day',
    start_time: '00:00',
    end_time: '23:59',
    label: 'Todo el día'
  }
}

/**
 * Evalúa si una categoría está activa en la hora provista
 */
export function isScheduleActiveNow(schedule: CategoryScheduleConfig, currentMinutes: number): boolean {
  if (schedule.type === 'all_day') return true
  
  const startMinutes = parseTimeToMinutes24(schedule.start_time)
  const endMinutes = parseTimeToMinutes24(schedule.end_time)

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
  } else {
    // Horario que cruza medianoche (ej: 20:00 a 03:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes
  }
}
