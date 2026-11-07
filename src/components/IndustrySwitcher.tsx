'use client'

import Link from 'next/link'
import { 
  Utensils, 
  Scissors, 
  Stethoscope, 
  ShoppingBag, 
  Briefcase, 
  Layers, 
  Lock,
  Settings
} from 'lucide-react'
import { 
  IndustryId, 
  getIndustryConfig, 
  normalizeIndustry 
} from '@/lib/industries'

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

/**
 * Insignia de Giro de Negocio (Bloqueada en panel).
 * El giro del negocio se define al activar la cuenta y solo puede modificarse
 * cada 30 días desde el módulo de Configuración con confirmación técnica.
 */
export default function IndustrySwitcher({
  currentIndustry,
  variant = 'pill',
  className = ''
}: IndustrySwitcherProps) {
  const normalized = normalizeIndustry(currentIndustry)
  const currentConfig = getIndustryConfig(currentIndustry)
  const CurrentIcon = industryIcons[normalized] || Layers

  // Variante Banner (para la parte superior del dashboard)
  if (variant === 'banner') {
    return (
      <div className={`p-4 rounded-2xl border transition-all ${currentConfig.badgeClass} bg-opacity-40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-gray-200/80 flex items-center justify-center shrink-0">
            <CurrentIcon className="w-5 h-5" style={{ color: currentConfig.accentColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-white border border-gray-200 shadow-2xs flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-gray-500" />
                Giro Configurado
              </span>
              <span className="font-extrabold text-sm text-gray-900">{currentConfig.name}</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">{currentConfig.tagline}</p>
          </div>
        </div>

        <Link
          href="/dashboard/settings"
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:text-black transition shadow-2xs flex items-center gap-1.5 shrink-0"
          title="Ver configuración del giro de negocio"
        >
          <Settings className="w-3.5 h-3.5 text-gray-500" />
          <span>Configuración</span>
        </Link>
      </div>
    )
  }

  // Variante Pill / Compacta (solo lectura para navbar y sidebar)
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border select-none ${
        variant === 'compact'
          ? 'bg-gray-50 text-gray-800 border-gray-200'
          : `${currentConfig.badgeClass}`
      } ${className}`}
      title={`Giro activo: ${currentConfig.name}`}
    >
      <div className="flex items-center gap-1.5 truncate">
        <CurrentIcon className="w-3.5 h-3.5 shrink-0" style={{ color: currentConfig.accentColor }} />
        <span className="truncate max-w-[130px] sm:max-w-none">{currentConfig.shortName}</span>
      </div>
      <Lock className="w-3 h-3 text-gray-400 shrink-0 ml-1" />
    </div>
  )
}

