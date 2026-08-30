'use client'

import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp, Check, X, CalendarCheck } from 'lucide-react'
import { ScheduleConfig, getBusinessLiveStatus, formatScheduleSummaryText } from '@/lib/schedule'

interface BusinessHoursWidgetProps {
  scheduleConfig?: ScheduleConfig | null
  legacyHoursText?: string | null
  theme: any
  btnRadiusClass?: string
}

export default function BusinessHoursWidget({
  scheduleConfig,
  legacyHoursText,
  theme
}: BusinessHoursWidgetProps) {
  const [showDetailedList, setShowDetailedList] = useState(false)

  // Si no hay scheduleConfig estructurado, mostrar el texto directo
  if (!scheduleConfig || !scheduleConfig.days) {
    if (!legacyHoursText) return null

    return (
      <div 
        className="p-4 rounded-2xl border border-black/10 flex items-start gap-3.5 text-left shadow-xs transition-all"
        style={{ backgroundColor: theme.is_dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
      >
        <Clock className="w-5 h-5 shrink-0 opacity-70 mt-0.5" style={{ color: theme.primary_color }} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">Horario de Atención</p>
          <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: theme.text_color }}>{legacyHoursText}</p>
        </div>
      </div>
    )
  }

  const liveStatus = getBusinessLiveStatus(scheduleConfig)
  const summaryText = formatScheduleSummaryText(scheduleConfig)

  return (
    <div 
      className="rounded-2xl border border-black/10 overflow-hidden text-left shadow-xs transition-all"
      style={{ backgroundColor: theme.is_dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
    >
      {/* Cabecera con Estado en Vivo & Resumen de Horarios */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Badge Estado en Vivo */}
          <div className="flex items-center gap-2">
            <span 
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-2xs ${
                liveStatus.isOpenNow
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  : 'bg-red-500/15 text-red-500 border border-red-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${liveStatus.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {liveStatus.statusBadgeText}
            </span>

            <span className="text-xs font-bold opacity-80" style={{ color: theme.text_color }}>
              • {liveStatus.statusDetailText}
            </span>
          </div>

          {/* Botón sutil para ver desglose por días */}
          <button
            type="button"
            onClick={() => setShowDetailedList(!showDetailedList)}
            className="text-[11px] font-bold opacity-70 hover:opacity-100 transition flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-black/5"
            style={{ color: theme.primary_color }}
          >
            <span>{showDetailedList ? 'Ver resumen' : 'Ver días'}</span>
            {showDetailedList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Resumen Claro y Directo del Horario */}
        {!showDetailedList ? (
          <div className="flex items-start gap-2.5 pt-0.5">
            <Clock className="w-4 h-4 shrink-0 opacity-70 mt-0.5" style={{ color: theme.primary_color }} />
            <div className="text-xs leading-relaxed font-medium" style={{ color: theme.text_color }}>
              <p className="font-bold opacity-90">{summaryText || 'Consultar horario directo con el negocio'}</p>
              {scheduleConfig.lunch_break?.enabled && (
                <p className="text-[11px] opacity-70 mt-0.5">
                  🥗 Pausa de almuerzo: {scheduleConfig.lunch_break.start} a {scheduleConfig.lunch_break.end}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Desglose Día por Día (Limpio y sin cortes) */
          <div 
            className="pt-2 border-t border-black/5 space-y-1 text-xs animate-in fade-in"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-60 pb-1">
              Horario Detallado
            </p>

            <div className="space-y-1">
              {liveStatus.weeklySchedule.map((day) => (
                <div 
                  key={day.key} 
                  className={`py-1.5 px-2.5 rounded-xl flex items-center justify-between text-xs transition ${
                    day.isToday 
                      ? 'bg-black/5 font-bold ring-1 ring-black/10' 
                      : 'opacity-85 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: theme.text_color }}>{day.label}</span>
                    {day.isToday && (
                      <span 
                        className="text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase text-white shadow-2xs"
                        style={{ backgroundColor: theme.primary_color }}
                      >
                        Hoy
                      </span>
                    )}
                  </div>

                  <div>
                    {day.enabled ? (
                      <span style={{ color: theme.text_color }}>
                        {day.open} - {day.close}
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold text-[11px]">
                        Cerrado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {scheduleConfig.lunch_break?.enabled && (
              <p className="text-[10px] opacity-70 italic pt-1.5">
                🥗 Pausa de comida: {scheduleConfig.lunch_break.start} a {scheduleConfig.lunch_break.end}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
