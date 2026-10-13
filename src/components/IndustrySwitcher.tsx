'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Utensils, 
  Scissors, 
  Stethoscope, 
  ShoppingBag, 
  Briefcase, 
  Layers, 
  Check, 
  ChevronDown, 
  Sparkles, 
  Loader2,
  Building2,
  X
} from 'lucide-react'
import { 
  IndustryId, 
  INDUSTRIES, 
  getIndustryConfig, 
  normalizeIndustry 
} from '@/lib/industries'
import { updateIndustrySetting } from '@/app/dashboard/settings/actions'
import { showToast } from '@/components/GlobalToast'

const industryIcons: Record<IndustryId, any> = {
  restaurant: Utensils,
  beauty: Scissors,
  health: Stethoscope,
  retail: ShoppingBag,
  professional: Briefcase,
  general: Layers
}

interface IndustrySwitcherProps {
  currentIndustry?: string
  variant?: 'pill' | 'banner' | 'compact'
  className?: string
}

export default function IndustrySwitcher({
  currentIndustry,
  variant = 'pill',
  className = ''
}: IndustrySwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const normalized = normalizeIndustry(currentIndustry)
  const currentConfig = getIndustryConfig(currentIndustry)
  const CurrentIcon = industryIcons[normalized] || Layers

  const handleSelect = async (industryId: IndustryId) => {
    if (industryId === normalized) {
      setIsOpen(false)
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set('industry', industryId)
        await updateIndustrySetting(formData)
        showToast(`Giro cambiado a ${INDUSTRIES[industryId].name}. La interfaz se ha adaptado.`, 'success')
        setIsOpen(false)
        router.refresh()
      } catch (err: any) {
        showToast(err.message || 'Error al cambiar giro del negocio', 'error')
      }
    })
  }

  // Variante Banner (ideal para la parte superior de la página del dashboard)
  if (variant === 'banner') {
    return (
      <>
        <div className={`p-4 rounded-2xl border transition-all ${currentConfig.badgeClass} bg-opacity-40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-gray-200/80 flex items-center justify-center shrink-0">
              <CurrentIcon className="w-5 h-5" style={{ color: currentConfig.accentColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-white border border-gray-200 shadow-2xs">
                  Modo de Negocio
                </span>
                <span className="font-extrabold text-sm text-gray-900">{currentConfig.name}</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">{currentConfig.tagline}</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            disabled={isPending}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white text-gray-800 border border-gray-300 hover:border-black hover:bg-gray-50 transition shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span>Cambiar Giro</span>
          </button>
        </div>

        {isOpen && renderModal()}
      </>
    )
  }

  // Variante Pill (ideal para navbar / sidebars)
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
          variant === 'compact'
            ? 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
            : `${currentConfig.badgeClass} hover:opacity-90`
        } ${className}`}
        title="Cambiar tipo de negocio"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CurrentIcon className="w-3.5 h-3.5 shrink-0" />
        )}
        <span className="truncate max-w-[120px] sm:max-w-none">{currentConfig.shortName}</span>
        <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
      </button>

      {isOpen && renderModal()}
    </>
  )

  function renderModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div 
          className="fixed inset-0" 
          onClick={() => !isPending && setIsOpen(false)} 
        />
        <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-xl w-full p-6 z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Adaptar Panel a tu Negocio</h3>
                <p className="text-xs text-gray-500">Selecciona el rubro de tu empresa para personalizar módulos y accesos directos.</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            {(Object.keys(INDUSTRIES) as IndustryId[]).map((key) => {
              const item = INDUSTRIES[key]
              const Icon = industryIcons[key] || Layers
              const isSelected = normalized === key

              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  disabled={isPending}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer group ${
                    isSelected 
                      ? 'border-black bg-gray-900 text-white shadow-md' 
                      : 'border-gray-200 hover:border-gray-400 bg-gray-50/50 hover:bg-white text-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/10 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow-2xs'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Activo
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-extrabold text-sm flex items-center justify-between">
                      <span>{item.name}</span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-snug line-clamp-2 ${
                      isSelected ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400">
              💡 Puedes cambiar de giro en cualquier momento sin perder ninguna información ni configuración creada.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
