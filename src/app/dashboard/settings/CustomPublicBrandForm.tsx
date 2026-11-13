'use client'

import { useState } from 'react'
import { Sparkles, Check, Loader2 } from 'lucide-react'
import { updateCustomPublicBrandAction } from './actions'

export default function CustomPublicBrandForm({
  initialBrand,
  inheritedBrand,
}: {
  initialBrand: string
  inheritedBrand: string
}) {
  const [brand, setBrand] = useState(initialBrand)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setSavedMsg(null)
    setErrorMsg(null)
    try {
      const fd = new FormData()
      fd.set('custom_public_brand', brand.trim())
      const res = await updateCustomPublicBrandAction(fd)
      setBrand(res.customPublicBrand)
      setSavedMsg(
        res.customPublicBrand
          ? `¡Listo! Todas tus herramientas públicas mostrarán "${res.customPublicBrand}".`
          : `Restaurado al nombre por defecto (${inheritedBrand}).`
      )
    } catch (err: any) {
      setErrorMsg(err?.message || 'No se pudo guardar la marca.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Marca Propia en Herramientas Públicas
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Personaliza el nombre que aparece al pie de tu vCard, Menú Digital, Agenda de Citas, Club de Sellos, Ruleta y Gift Cards. Si lo dejas vacío, se mostrará <b>{inheritedBrand}</b>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Nombre de Marca en Pie de Página (Opcional)
          </label>
          <input
            type="text"
            name="custom_public_brand"
            maxLength={60}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder={`Ej. Mi Negocio Digital (por defecto: ${inheritedBrand})`}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Vista previa: <i>Digitalizado por <b>{brand.trim() || inheritedBrand}</b></i>
          </p>
        </div>

        {savedMsg && (
          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-60 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{saving ? 'Guardando...' : 'Guardar Marca Pública'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
