'use client'

import { useState, useEffect } from 'react'
import { X, Clock, Sparkles, Check } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import { createCategory, updateCategory } from '../actions'
import { PRESET_SCHEDULES, CategoryScheduleConfig } from '@/lib/menuSchedule'

interface CategoryScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  menuId: string
  category?: {
    id: string
    name: string
  } | null
  currentSchedule?: CategoryScheduleConfig
}

export default function CategoryScheduleModal({
  isOpen,
  onClose,
  menuId,
  category,
  currentSchedule
}: CategoryScheduleModalProps) {
  const isEditing = Boolean(category?.id)

  const [scheduleType, setScheduleType] = useState<string>(currentSchedule?.type || 'all_day')
  const [startTime, setStartTime] = useState<string>(currentSchedule?.start_time || '07:00')
  const [endTime, setEndTime] = useState<string>(currentSchedule?.end_time || '10:30')

  useEffect(() => {
    if (currentSchedule) {
      setScheduleType(currentSchedule.type || 'all_day')
      setStartTime(currentSchedule.start_time || '07:00')
      setEndTime(currentSchedule.end_time || '10:30')
    } else {
      setScheduleType('all_day')
      setStartTime('07:00')
      setEndTime('10:30')
    }
  }, [currentSchedule, category])

  if (!isOpen) return null

  const handlePresetSelect = (typeKey: string) => {
    setScheduleType(typeKey)
    if (PRESET_SCHEDULES[typeKey]) {
      setStartTime(PRESET_SCHEDULES[typeKey].start)
      setEndTime(PRESET_SCHEDULES[typeKey].end)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span>{isEditing ? '✏️ Editar Categoría y Horario' : '➕ Nueva Categoría de Menú'}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing ? 'Cambia el nombre y define el turno en que se muestra esta sección.' : 'Crea una sección y asigna cuándo debe estar visible.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form 
          action={isEditing ? updateCategory : createCategory} 
          onSubmit={() => setTimeout(onClose, 800)} 
          className="overflow-y-auto flex-1 p-6 space-y-5"
        >
          <input type="hidden" name="menu_id" value={menuId} />
          {isEditing && <input type="hidden" name="category_id" value={category?.id} />}
          <input type="hidden" name="schedule_type" value={scheduleType} />

          {/* Nombre de la categoría */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={category?.name || ''}
              required
              placeholder="Ej. Desayunos, Almuerzos Ejecutivos, Postres, Bebidas..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold focus:border-black focus:outline-none"
            />
          </div>

          {/* Selector de Horario Inteligente */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Horario Inteligente / Turno de Servicio</span>
              </label>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Elige en qué franja horaria debe mostrarse esta categoría en el menú de los comensales.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(PRESET_SCHEDULES).map(([key, config]) => {
                const isSelected = scheduleType === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetSelect(key)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-black bg-black/5 ring-1 ring-black text-gray-900 font-bold'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{config.icon}</span>
                      <div>
                        <p className="text-xs font-bold leading-tight">{config.label.split('(')[0].trim()}</p>
                        {config.start && key !== 'all_day' && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {config.start} - {config.end}
                          </p>
                        )}
                        {key === 'all_day' && (
                          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Siempre activo</p>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Inputs de Horario Personalizado */}
            {(scheduleType === 'custom' || scheduleType === 'breakfast' || scheduleType === 'lunch' || scheduleType === 'dinner') && scheduleType !== 'all_day' && (
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl space-y-2">
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Rango exacto de horas (Formato 24 Horas)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Hora Inicio</label>
                    <input
                      type="time"
                      name="schedule_start"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      name="schedule_end"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <SaveButton
              label={isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
              loadingLabel="Guardando..."
              className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-sm"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
