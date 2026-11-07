'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Utensils, 
  Scissors, 
  Stethoscope, 
  ShoppingBag, 
  Briefcase, 
  Check, 
  Sparkles, 
  Lock, 
  ArrowRight,
  Loader2,
  ShieldCheck
} from 'lucide-react'
import { 
  INDUSTRIES, 
  SELECTABLE_INDUSTRY_IDS, 
  SelectableIndustryId 
} from '@/lib/industries'
import { lockInitialIndustryAction } from '@/app/dashboard/settings/actions'
import { showToast } from './GlobalToast'

const industryIcons: Record<SelectableIndustryId, any> = {
  restaurant: Utensils,
  beauty: Scissors,
  health: Stethoscope,
  retail: ShoppingBag,
  professional: Briefcase
}

interface IndustryOnboardingGateProps {
  userEmail?: string
  suggestedIndustry?: SelectableIndustryId
}

export default function IndustryOnboardingGate({
  userEmail,
  suggestedIndustry = 'restaurant'
}: IndustryOnboardingGateProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<SelectableIndustryId>(suggestedIndustry)
  const [confirmedCheck, setConfirmedCheck] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')

  const activeConfig = INDUSTRIES[selected]

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmedCheck) {
      setErrorMsg('Por favor confirma que este es el giro de tu negocio.')
      return
    }
    setErrorMsg('')

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set('industry', selected)
        await lockInitialIndustryAction(formData)
        showToast(`¡Giro configurado como ${activeConfig.name}!`, 'success')
        router.refresh()
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al configurar el giro de tu negocio.')
      }
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 max-w-3xl mx-auto my-4 space-y-6 animate-in fade-in zoom-in-95">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1">
              <Lock className="w-3 h-3" />
              <span>Paso Obligatorio de Activación</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Configura el Giro Oficial de tu Negocio
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Para activar tus herramientas específicas (sin menús confusos ni funciones ajenas a tu rubro), elige el sector exacto de tu negocio.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Tarjetas de los 5 Giros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {SELECTABLE_INDUSTRY_IDS.map((id) => {
          const item = INDUSTRIES[id]
          const Icon = industryIcons[id]
          const isSelected = selected === id

          return (
            <button
              key={id}
              type="button"
              disabled={isPending}
              onClick={() => setSelected(id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer relative ${
                isSelected
                  ? 'border-black bg-gray-950 text-white shadow-lg ring-2 ring-black/10'
                  : 'border-gray-200 hover:border-gray-400 bg-gray-50/60 hover:bg-white text-gray-800'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-white/15 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                {isSelected && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Seleccionado
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
            </button>
          )
        })}
      </div>

      {/* Resumen de herramientas que se habilitarán */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Herramientas que se instalarán para {activeConfig.shortName}:
          </span>
          <span className="text-[10px] font-bold text-gray-500 uppercase">Panel Especializado</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activeConfig.featuredCards.map((fc) => (
            <span
              key={fc.href}
              className="text-[11px] font-bold bg-white text-gray-800 border border-gray-200 px-2.5 py-1 rounded-lg shadow-2xs"
            >
              ✓ {fc.title}
            </span>
          ))}
        </div>
      </div>

      {/* Confirmación de bloqueo por 30 días */}
      <form onSubmit={handleConfirm} className="space-y-4 pt-2 border-t border-gray-100">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700 select-none bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl">
          <input
            type="checkbox"
            checked={confirmedCheck}
            onChange={(e) => setConfirmedCheck(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer shrink-0"
          />
          <span className="leading-relaxed">
            Confirmo que mi negocio pertenece al giro de <b>{activeConfig.name}</b>. Entiendo que mi panel se configurará con estas herramientas y que cualquier cambio posterior de giro solo podrá realizarse desde <b>Configuración cada 30 días</b>.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-gray-400">
            Cuenta: <b className="text-gray-600">{userEmail}</b>
          </span>

          <button
            type="submit"
            disabled={isPending || !confirmedCheck}
            className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparando tus herramientas...</span>
              </>
            ) : (
              <>
                <span>Confirmar Giro e Ingresar a mi Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
