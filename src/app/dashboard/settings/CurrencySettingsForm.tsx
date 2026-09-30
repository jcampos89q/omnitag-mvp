'use client'

import { useState } from 'react'
import { Coins, Check, Loader2, Sparkles } from 'lucide-react'
import { SUPPORTED_CURRENCIES, formatMoney } from '@/lib/currency'
import { updateCurrencySetting } from './actions'

interface CurrencySettingsFormProps {
  initialCurrencyCode: string
  initialCurrencySymbol: string
}

export default function CurrencySettingsForm({
  initialCurrencyCode,
  initialCurrencySymbol
}: CurrencySettingsFormProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrencyCode || 'HNL')
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const currentOption = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    setSavedSuccess(false)

    try {
      const formData = new FormData()
      formData.set('currency', selectedCurrency)
      await updateCurrencySetting(formData)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la moneda.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60 font-bold">
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Moneda del Sistema & Precios</h2>
            <p className="text-xs text-gray-500">Configura la moneda en la que se cobran tus consultas, servicios y menús.</p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Moneda actualizada exitosamente! Todos tus precios y reportes ahora se muestran en {currentOption.label}.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
            Moneda Principal (Por defecto: Lempiras L.)
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            {SUPPORTED_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.label} {curr.code === 'HNL' ? '⭐️ (Recomendado / Por Defecto)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Vista previa en vivo */}
        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 space-y-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Vista Previa de Precios en tu Sistema
          </p>
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-gray-400 text-[10px] block">Consulta / Servicio:</span>
              <span className="font-extrabold text-gray-900 text-sm">{formatMoney(800, currentOption.symbol)}</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-gray-400 text-[10px] block">Platillo / Producto:</span>
              <span className="font-extrabold text-gray-900 text-sm">{formatMoney(150, currentOption.symbol)}</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-gray-400 text-[10px] block">Total Ingresos:</span>
              <span className="font-extrabold text-emerald-600 text-sm">{formatMoney(12500, currentOption.symbol)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Guardar Configuración de Moneda</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
