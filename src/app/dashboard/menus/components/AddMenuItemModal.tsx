'use client'

import { useState } from 'react'
import { X, Plus, Clock, Leaf, Flame, WheatOff } from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import SaveButton from '@/components/SaveButton'
import { createMenuItem } from '../actions'

interface AddMenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  category: any | null
  categories: any[]
  currencySymbol: string
  businessType: string
}

export default function AddMenuItemModal({
  isOpen,
  onClose,
  category,
  categories,
  currencySymbol,
  businessType
}: AddMenuItemModalProps) {
  if (!isOpen || !category) return null

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
              <span>+ Nuevo {isSalonOrDental ? 'Servicio' : 'Platillo'}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Se agregará a la categoría: <b className="text-gray-900 font-bold">{category.name}</b>
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
        <form action={createMenuItem} onSubmit={() => setTimeout(onClose, 800)} className="overflow-y-auto flex-1 p-6 space-y-4">
          <input type="hidden" name="category_id" value={category.id} />

          {/* Categoría & Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Categoría
              </label>
              <select
                name="category_id"
                defaultValue={category.id}
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
                placeholder={isSalonOrDental ? 'Ej. Corte de Cabello + Barba' : 'Ej. Tacos al Pastor, Enchiladas...'}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {/* Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Precio ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                placeholder="45.00"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            {isSalonOrDental && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tipo de Tarifa
                </label>
                <select
                  name="price_type"
                  defaultValue="fixed"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  <option value="fixed">Precio Fijo</option>
                  <option value="starting_at">Desde $ (Precio base)</option>
                  <option value="consultation">Previa Valoración</option>
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
              rows={2}
              placeholder="Describe los ingredientes, acompañamientos o preparación..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none resize-none"
            />
          </div>

          {/* Foto */}
          <div>
            <ImageUploadInput
              name="image"
              label="Foto del Platillo (Recomendado)"
              shape="square"
              helpText="Sube una foto atractiva del platillo o resultado."
            />
          </div>

          {/* Tags y Alérgenos */}
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs text-gray-700">
            <label className="flex items-center gap-1.5 cursor-pointer bg-yellow-50 px-2.5 py-1.5 rounded-xl border border-yellow-200 text-yellow-800 font-bold">
              <input
                type="checkbox"
                name="is_featured"
                className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
              />
              ⭐ Destacar Platillo
            </label>

            {isRestaurant && (
              <>
                <label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    name="allergen_vegan"
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <Leaf className="w-3.5 h-3.5 text-green-600" /> Vegano
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    name="allergen_spicy"
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <Flame className="w-3.5 h-3.5 text-red-500" /> Picante
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    name="allergen_gluten_free"
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <WheatOff className="w-3.5 h-3.5 text-orange-500" /> Sin Gluten
                </label>
              </>
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
              label="Guardar Platillo"
              loadingLabel="Guardando..."
              className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-sm"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
