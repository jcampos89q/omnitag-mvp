'use client'

import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp, Check, X, Sparkles } from 'lucide-react'
import { ScheduleConfig, getBusinessLiveStatus } from '@/lib/schedule'

interface BusinessHoursWidgetProps {
  scheduleConfig?: ScheduleConfig | null
  legacyHoursText?: string | null
  theme: any
  btnRadiusClass: string
}

export default function BusinessHoursWidget({
  scheduleConfig,
  legacyHoursText,
  theme,
  btnRadiusClass
}: BusinessHoursWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Si no hay scheduleConfig estructurado, mostrar el texto tradicional
  if (!scheduleConfig || !scheduleConfig.days) {
    if (!legacyHoursText) return null

    return (
      <div 
        className={`p-4 border border-black/5 flex items-start gap-3.5 ${btnRadiusClass}`} 
        style={{ backgroundColor: theme.is_dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
      >
        <Clock className="w-5 h-5 shrink-0 opacity-70 mt-0.5" style={{ color: theme.primary_color }} />
        <div className="text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">Horario de Atención</p>
          <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: theme.text_color }}>{legacyHoursText}</p>
        </div>
      </div>
    )
  }

  const liveStatus = getBusinessLiveStatus(scheduleConfig)

  return (
    <div 
      className={`border border-black/10 overflow-hidden transition-all text-left shadow-xs ${btnRadiusClass}`}
      style={{ backgroundColor: theme.is_dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}
    >
      {/* Cabecera Principal / Estado en Vivo */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ 
              backgroundColor: liveStatus.isOpenNow ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: liveStatus.isOpenNow ? '#10B981' : '#EF4444'
            }}
          >
            <Clock className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span 
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-2xs ${
                  liveStatus.isOpenNow
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-600 border border-red-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${liveStatus.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {liveStatus.statusBadgeText}
              </span>
            </div>

            <p className="text-xs font-bold" style={{ color: theme.text_color }}>
              {liveStatus.statusDetailText}
            </p>
          </div>
        </div>

        {/* Botón para Desplegar Horario Semanal */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-2.5 py-1.5 rounded-lg border border-black/10 text-xs font-extrabold flex items-center gap-1.5 shrink-0 hover:bg-black/5 transition cursor-pointer"
          style={{ color: theme.primary_color }}
          title="Ver horario de toda la semana"
        >
          <span>{isOpen ? 'Ocultar' : 'Ver Semana'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Acordeón Desplegable con la Semana Completa */}
      {isOpen && (
        <div 
          className="px-4 pb-4 pt-2 border-t border-black/5 space-y-1.5 text-xs animate-in fade-in"
          style={{ backgroundColor: theme.is_dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)' }}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-60 pb-1">
            Horario de Atención Semanal
          </p>

          <div className="divide-y divide-black/5">
            {liveStatus.weeklySchedule.map((day) => (
              <div 
                key={day.key} 
                className={`py-1.5 px-2 rounded-lg flex items-center justify-between text-xs transition ${
                  day.isToday 
                    ? 'bg-black/5 font-bold shadow-2xs' 
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
                    <span className="text-gray-700 font-semibold" style={{ color: theme.text_color }}>
                      {day.open} - {day.close}
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold flex items-center gap-1 text-[11px]">
                      <X className="w-3 h-3" /> Cerrado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {scheduleConfig.lunch_break?.enabled && (
            <p className="text-[10px] text-gray-500 italic pt-1 border-t border-black/5">
              🥗 Pausa de almuerzo: {scheduleConfig.lunch_break.start} a {scheduleConfig.lunch_break.end}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
