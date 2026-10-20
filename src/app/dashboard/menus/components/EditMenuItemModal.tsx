'use client'

import { useState, useEffect } from 'react'
import { X, Save, Clock, Leaf, Flame, WheatOff, Sparkles, Trash2, Image as ImageIcon } from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import SaveButton from '@/components/SaveButton'
import { updateMenuItem } from '../actions'

interface EditMenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: any | null
  categories: any[]
  currencySymbol: string
  businessType: string
}

export default function EditMenuItemModal({
  isOpen,
  onClose,
  item,
  categories,
  currencySymbol,
  businessType
}: EditMenuItemModalProps) {
  const [removeImage, setRemoveImage] = useState(false)

  useEffect(() => {
    setRemoveImage(false)
  }, [item])

  if (!isOpen || !item) return null

  const isRestaurant = businessType === 'restaurant'
  const isSalonOrDental = businessType === 'salon' || businessType === 'dental'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <span>✏️ Editar {isSalonOrDental ? 'Servicio' : 'Platillo'}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Modifica los detalles, precio, foto o disponibilidad en el menú.
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
        <form action={updateMenuItem} onSubmit={() => setTimeout(onClose, 800)} className="overflow-y-auto flex-1 p-6 space-y-4">
          <input type="hidden" name="item_id" value={item.id} />
          {removeImage && <input type="hidden" name="remove_image" value="true" />}

          {/* Categoría & Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Categoría
              </label>
              <select
                name="category_id"
                defaultValue={item.category_id}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium focus:border-black focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Nombre del {isSalonOrDental ? 'Servicio' : 'Platillo'} *
              </label>
              <input
                type="text"
                name="name"
                defaultValue={item.name}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Precio y tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Precio ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                defaultValue={item.price}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            {isSalonOrDental ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tipo de Tarifa
                </label>
                <select
                  name="price_type"
                  defaultValue={item.price_type || 'fixed'}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  <option value="fixed">Precio Fijo</option>
                  <option value="starting_at">Desde $ (Precio base)</option>
                  <option value="consultation">Previa Valoración</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Disponibilidad
                </label>
                <select
                  name="is_available"
                  defaultValue={item.is_available === false ? 'false' : 'true'}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none font-medium"
                >
                  <option value="true">🟢 Disponible para pedir</option>
                  <option value="false">🔴 Agotado / Pausado temporalmente</option>
                </select>
              </div>
            )}
          </div>

          {/* Duración (Salón / Dental) */}
          {isSalonOrDental && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Duración Estimada
              </label>
              <input
                type="text"
                name="duration_minutes"
                defaultValue={item.duration_minutes || ''}
                placeholder="Ej. 30 min, 1 hora..."
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Descripción e Ingredientes
            </label>
            <textarea
              name="description"
              defaultValue={item.description || ''}
              rows={2}
              placeholder="Describe los ingredientes, preparación o beneficios..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none resize-none"
            />
          </div>

          {/* Subida o Cambio de Foto */}
          <div>
            <ImageUploadInput
              name="image"
              label="Foto del Platillo / Servicio"
              defaultValue={removeImage ? null : item.image_url}
              shape="square"
              helpText="Sube una foto atractiva. Si deseas quitar la imagen actual, puedes usar la opción inferior."
            />
            {item.image_url && !removeImage && (
              <button
                type="button"
                onClick={() => setRemoveImage(true)}
                className="mt-1 text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Quitar foto actual
              </button>
            )}
            {removeImage && (
              <p className="mt-1 text-xs text-amber-600 font-medium">
                La foto actual será eliminada al guardar los cambios.
              </p>
            )}
          </div>

          {/* Destacado / Plato del Día */}
          <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={item.is_featured}
                className="w-4 h-4 mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-current" />
                  <span>Plato del Día / Platillo Destacado ⭐</span>
                </span>
                <p className="text-[11px] text-amber-800/80 mt-0.5 leading-snug">
                  Muestra este platillo con insignia dorada y prioridad visible en tu menú digital.
                </p>
              </div>
            </label>
          </div>

          {/* Tags y Alérgenos */}
          {isRestaurant && (
            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs text-gray-700">
              <label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  name="allergen_vegan"
                  defaultChecked={item.allergens?.includes('vegan')}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <Leaf className="w-3.5 h-3.5 text-green-600" /> Vegano
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  name="allergen_spicy"
                  defaultChecked={item.allergens?.includes('spicy')}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <Flame className="w-3.5 h-3.5 text-red-500" /> Picante
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  name="allergen_gluten_free"
                  defaultChecked={item.allergens?.includes('gluten_free')}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <WheatOff className="w-3.5 h-3.5 text-orange-500" /> Sin Gluten
              </label>
            </div>
          )}

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
              label="Guardar Cambios"
              loadingLabel="Guardando..."
              className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-sm"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
