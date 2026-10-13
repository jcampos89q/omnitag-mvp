'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Utensils, 
  Scissors, 
  Stethoscope, 
  ShoppingBag, 
  Briefcase, 
  Layers, 
  Check, 
  Loader2, 
  Sparkles,
  Building2
} from 'lucide-react'
import { 
  IndustryId, 
  INDUSTRIES, 
  normalizeIndustry, 
  getIndustryConfig 
} from '@/lib/industries'
import { updateIndustrySetting } from './actions'
import { showToast } from '@/components/GlobalToast'

const industryIcons: Record<IndustryId, any> = {
  restaurant: Utensils,
  beauty: Scissors,
  health: Stethoscope,
  retail: ShoppingBag,
  professional: Briefcase,
  general: Layers
}

interface IndustrySettingsFormProps {
  initialIndustry: string
}

export default function IndustrySettingsForm({ initialIndustry }: IndustrySettingsFormProps) {
  const router = useRouter()
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId>(normalizeIndustry(initialIndustry))
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const activeConfig = getIndustryConfig(selectedIndustry)

  async function handleSave(industryId: IndustryId) {
    setSelectedIndustry(industryId)
    setIsSaving(true)
    setErrorMsg('')
    setSavedSuccess(false)

    try {
      const formData = new FormData()
      formData.set('industry', industryId)
      await updateIndustrySetting(formData)
      setSavedSuccess(true)
      showToast(`Sector actualizado a: ${INDUSTRIES[industryId].name}`, 'success')
      router.refresh()
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el sector.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60 font-bold">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Sector / Giro del Negocio</h2>
            <p className="text-xs text-gray-500">Adapta los menús de navegación, textos y herramientas recomendadas a tu actividad comercial.</p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Sector actualizado con éxito! Tu panel se ha adaptado a <b>{activeConfig.name}</b>.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {(Object.keys(INDUSTRIES) as IndustryId[]).map((key) => {
          const item = INDUSTRIES[key]
          const Icon = industryIcons[key] || Layers
          const isSelected = selectedIndustry === key

          return (
            <button
              key={key}
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(key)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer group text-left relative ${
                isSelected 
                  ? 'border-black bg-gray-950 text-white shadow-md ring-2 ring-black/10' 
                  : 'border-gray-200 hover:border-gray-400 bg-gray-50/50 hover:bg-white text-gray-800'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                {isSelected ? (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Check className="w-3 h-3 stroke-[3]" /> Seleccionado
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-900 transition">
                    Activar
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-sm">{item.name}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${
                  isSelected ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100/20 text-[11px] font-medium opacity-90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{item.tagline}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <p>
          Al cambiar de sector, <b>no pierdes ninguna información</b> previamente creada (como menús, clientes o citas). Solo reorganizamos la navegación y prioridades para hacer tu día a día más eficiente.
        </p>
      </div>
    </div>
  )
}
