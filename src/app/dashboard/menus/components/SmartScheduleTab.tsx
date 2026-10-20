'use client'

import { useState } from 'react'
import { Clock, Sparkles, CheckCircle2, AlertCircle, Save, Info } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import { saveAllCategorySchedules } from '../actions'
import { PRESET_SCHEDULES, CategoryScheduleConfig, resolveCategorySchedule, formatTime24To12 } from '@/lib/menuSchedule'

interface SmartScheduleTabProps {
  menu: any
  categories: any[]
}

export default function SmartScheduleTab({ menu, categories }: SmartScheduleTabProps) {
  const storedSchedules: Record<string, CategoryScheduleConfig> = 
    menu.catalog_settings?.category_schedules || {}

  const [schedules, setSchedules] = useState<Record<string, CategoryScheduleConfig>>(() => {
    const initial: Record<string, CategoryScheduleConfig> = {}
    categories.forEach(c => {
      initial[c.id] = resolveCategorySchedule(c.id, c.name, storedSchedules)
    })
    return initial
  })

  const handleTypeChange = (catId: string, type: 'all_day' | 'breakfast' | 'lunch' | 'dinner' | 'custom') => {
    setSchedules(prev => {
      const preset = PRESET_SCHEDULES[type]
      return {
        ...prev,
        [catId]: {
          type,
          start_time: preset ? preset.start : (prev[catId]?.start_time || '08:00'),
          end_time: preset ? preset.end : (prev[catId]?.end_time || '18:00'),
          label: preset ? preset.label.split('(')[0].trim() : 'Horario',
          updated_at: new Date().toISOString()
        }
      }
    })
  }

  const handleTimeChange = (catId: string, field: 'start_time' | 'end_time', value: string) => {
    setSchedules(prev => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        [field]: value,
        updated_at: new Date().toISOString()
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Explicación y Concepto */}
      <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
            ⏰
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <span>Menú Inteligente por Turnos de Comida</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Automático
              </span>
            </h3>
            <p className="text-xs text-gray-700 mt-1 max-w-2xl leading-relaxed">
              Configura qué categorías se muestran según la hora del día. Por ejemplo, de <b>7:00 a 10:30 am</b> se mostrarán los <b>Desayunos</b>, de <b>10:30 am a 3:00 pm</b> los <b>Almuerzos</b>, y los demás platos (bebidas, postres, entradas) estarán disponibles en <b>Todo el Día</b>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-gray-600">
          <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 font-medium">
            💡 En el móvil del cliente se filtrará automáticamente el turno activo.
          </span>
          <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 font-medium">
            👁️ Los clientes siempre pueden pulsar "Ver Todo el Menú" si desean explorar la carta completa.
          </span>
        </div>
      </div>

      {/* Listado de Categorías con sus Horarios */}
      {categories.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-sm font-bold text-gray-700">Aún no has creado categorías en tu menú</p>
          <p className="text-xs text-gray-500 mt-1">
            Primero agrega secciones (ej. Desayunos, Almuerzos) en la pestaña <b>"Menú & Platillos"</b>.
          </p>
        </div>
      ) : (
        <form action={saveAllCategorySchedules} className="space-y-4">
          <input type="hidden" name="menu_id" value={menu.id} />
          <input type="hidden" name="schedules_json" value={JSON.stringify(schedules)} />

          <div className="space-y-3">
            {categories.map((category) => {
              const current = schedules[category.id] || { type: 'all_day', start_time: '00:00', end_time: '23:59' }
              const isAllDay = current.type === 'all_day'

              return (
                <div 
                  key={category.id}
                  className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 transition"
                >
                  {/* Nombre y Platillos */}
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                        {category.name}
                      </h4>
                      <span className="text-xs font-bold text-gray-400">
                        ({category.menu_items?.length || 0} platos)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isAllDay 
                        ? '✨ Disponible todo el día' 
                        : `⏰ Visible de ${formatTime24To12(current.start_time)} a ${formatTime24To12(current.end_time)}`}
                    </p>
                  </div>

                  {/* Selector de Tipo de Turno */}
                  <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
                    <button
                      type="button"
                      onClick={() => handleTypeChange(category.id, 'all_day')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        current.type === 'all_day'
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ✨ Todo el día
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange(category.id, 'breakfast')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        current.type === 'breakfast'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      🍳 Desayunos (7-10:30 am)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange(category.id, 'lunch')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        current.type === 'lunch'
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      🍲 Almuerzos (10:30-3 pm)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange(category.id, 'dinner')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        current.type === 'dinner'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      🌙 Cenas (6-11 pm)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange(category.id, 'custom')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        current.type === 'custom'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ⚙️ Personalizado
                    </button>
                  </div>

                  {/* Inputs de Hora si no es All Day */}
                  {!isAllDay && (
                    <div className="flex items-center gap-2 shrink-0 bg-gray-50 p-2 rounded-xl border border-gray-200">
                      <input
                        type="time"
                        value={current.start_time || '08:00'}
                        onChange={(e) => handleTimeChange(category.id, 'start_time', e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-bold focus:border-black focus:outline-none"
                      />
                      <span className="text-xs font-bold text-gray-400">a</span>
                      <input
                        type="time"
                        value={current.end_time || '18:00'}
                        onChange={(e) => handleTimeChange(category.id, 'end_time', e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-bold focus:border-black focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex justify-end pt-4">
            <SaveButton
              label="Guardar Configuración de Horarios"
              loadingLabel="Guardando horarios..."
              className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 text-sm cursor-pointer shadow-md"
            />
          </div>
        </form>
      )}
    </div>
  )
}
