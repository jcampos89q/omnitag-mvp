'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Utensils, 
  Scissors, 
  Stethoscope, 
  ShoppingBag, 
  Briefcase, 
  Check, 
  Loader2, 
  Sparkles,
  Building2,
  Lock,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'
import { 
  INDUSTRIES, 
  SELECTABLE_INDUSTRY_IDS, 
  SelectableIndustryId,
  normalizeIndustry, 
  getIndustryConfig,
  INDUSTRY_COOLDOWN_DAYS
} from '@/lib/industries'
import { updateIndustrySetting } from './actions'
import { showToast } from '@/components/GlobalToast'

const industryIcons: Record<SelectableIndustryId, any> = {
  restaurant: Utensils,
  beauty: Scissors,
  health: Stethoscope,
  retail: ShoppingBag,
  professional: Briefcase
}

interface IndustrySettingsFormProps {
  initialIndustry: string
  lastChangedAt?: string | null
  isAdmin?: boolean
}

export default function IndustrySettingsForm({ 
  initialIndustry, 
  lastChangedAt,
  isAdmin = false 
}: IndustrySettingsFormProps) {
  const router = useRouter()
  const currentNormalized = normalizeIndustry(initialIndustry) as SelectableIndustryId
  const currentConfig = getIndustryConfig(currentNormalized)
  const CurrentIcon = industryIcons[currentNormalized] || Briefcase

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [targetIndustry, setTargetIndustry] = useState<SelectableIndustryId | null>(null)
  const [confirmationText, setConfirmationText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Calcular días restantes de bloqueo de 30 días
  let daysRemaining = 0
  let nextAllowedDate: Date | null = null
  if (!isAdmin && lastChangedAt) {
    const lastMs = new Date(lastChangedAt).getTime()
    const cooldownMs = INDUSTRY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    const elapsed = Date.now() - lastMs
    if (elapsed < cooldownMs) {
      daysRemaining = Math.ceil((cooldownMs - elapsed) / (1000 * 60 * 60 * 24))
      nextAllowedDate = new Date(lastMs + cooldownMs)
    }
  }

  const isLockedByCooldown = daysRemaining > 0 && !isAdmin
  const targetConfig = targetIndustry ? INDUSTRIES[targetIndustry] : null

  async function handleConfirmMigration(e: React.FormEvent) {
    e.preventDefault()
    if (!targetIndustry || targetIndustry === currentNormalized) return
    if (confirmationText.trim().toUpperCase() !== 'CAMBIAR GIRO') {
      setErrorMsg('Escribe exactamente CAMBIAR GIRO en el campo de confirmación.')
      return
    }

    setIsSaving(true)
    setErrorMsg('')
    setSavedSuccess(false)

    try {
      const formData = new FormData()
      formData.set('industry', targetIndustry)
      formData.set('confirmation_text', confirmationText)
      await updateIndustrySetting(formData)
      setSavedSuccess(true)
      setIsWizardOpen(false)
      setTargetIndustry(null)
      setConfirmationText('')
      showToast(`Giro migrado a: ${INDUSTRIES[targetIndustry].name}`, 'success')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al realizar el cambio de giro.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-5">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60 shrink-0">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-gray-900">Giro Oficial del Negocio</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                <Lock className="w-2.5 h-2.5" /> Protegido (30 días)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Define las herramientas exclusivas, rutas habilitadas y vocabulario técnico de tu panel comercial.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Migración técnica completada! Tu cuenta quedó configurada como <b>{currentConfig.name}</b> por los próximos 30 días.</span>
        </div>
      )}

      {/* Tarjeta del Giro Actual Activo */}
      <div className={`p-5 rounded-2xl border-2 border-black bg-gray-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md`}>
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/15">
            <CurrentIcon className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">
                ✓ Giro Activo
              </span>
              <span className="text-xs text-gray-400 font-semibold">{currentConfig.shortName}</span>
            </div>
            <h3 className="text-lg font-extrabold text-white mt-1">{currentConfig.name}</h3>
            <p className="text-xs text-gray-300 mt-0.5 max-w-xl leading-relaxed">
              {currentConfig.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          {isLockedByCooldown ? (
            <div className="bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <div>
                <div>Cambio disponible en {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}</div>
                {nextAllowedDate && (
                  <div className="text-[10px] text-gray-400 font-normal">
                    Habilitado el {nextAllowedDate.toLocaleDateString('es-HN')}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsWizardOpen(!isWizardOpen)
                setErrorMsg('')
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-extrabold transition cursor-pointer"
            >
              {isWizardOpen ? 'Cancelar Cambio' : 'Solicitar Cambio de Giro'}
            </button>
          )}
        </div>
      </div>

      {/* Herramientas actualmente instaladas en este giro */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block">
          Módulos Especializados Habilitados en tu Giro:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {currentConfig.featuredCards.map((fc) => (
            <span
              key={fc.href}
              className="text-xs font-bold bg-white text-gray-800 border border-gray-200 px-3 py-1 rounded-xl shadow-2xs"
            >
              ✓ {fc.title}
            </span>
          ))}
        </div>
      </div>

      {/* Asistente Técnico de Migración de Giro */}
      {isWizardOpen && !isLockedByCooldown && (
        <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/40 space-y-5 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-black shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">
                Asistente Técnico de Cambio de Giro (Regla de 30 Días)
              </h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Cambiar el giro de tu cuenta adapta la estructura técnica de tu negocio: oculta las herramientas que no corresponden al nuevo rubro, pausa sus enlaces públicos para evitar confusiones y activa los módulos del nuevo sector. <b>Una vez confirmado, no podrás volver a cambiarlo durante 30 días.</b>
              </p>
            </div>
          </div>

          {/* 1. Elegir nuevo giro */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-gray-800 uppercase tracking-wider">
              1. Selecciona el nuevo giro al que deseas migrar:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SELECTABLE_INDUSTRY_IDS.filter(id => id !== currentNormalized).map((id) => {
                const item = INDUSTRIES[id]
                const Icon = industryIcons[id]
                const isSelected = targetIndustry === id

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setTargetIndustry(id)
                      setErrorMsg('')
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-400 text-gray-800'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">{item.name}</div>
                      <p className={`text-[11px] mt-0.5 leading-snug ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Comparativa técnica de impacto */}
          {targetConfig && (
            <form onSubmit={handleConfirmMigration} className="space-y-4 pt-3 border-t border-amber-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-red-200 space-y-1.5">
                  <div className="font-extrabold text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Se ocultarán de tu panel actual ({currentConfig.shortName}):</span>
                  </div>
                  <ul className="text-[11px] text-gray-600 space-y-1 pl-4 list-disc">
                    {currentConfig.featuredCards
                      .filter(c => !targetConfig.priorityHrefs.includes(c.href))
                      .map(c => (
                        <li key={c.href}><b>{c.title}</b> (se pausará su vista en el menú)</li>
                      ))}
                    {currentConfig.featuredCards.filter(c => !targetConfig.priorityHrefs.includes(c.href)).length === 0 && (
                      <li>Se adaptarán los nombres al nuevo vocabulario.</li>
                    )}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1.5">
                  <div className="font-extrabold text-emerald-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Se activarán para {targetConfig.shortName}:</span>
                  </div>
                  <ul className="text-[11px] text-gray-600 space-y-1 pl-4 list-disc">
                    {targetConfig.featuredCards.map(c => (
                      <li key={c.href}><b>{c.title}</b></li>
                    ))}
                  </ul>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">
                  2. Para confirmar la migración y el bloqueo por 30 días, escribe <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 text-red-700">CAMBIAR GIRO</span>:
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Escribe CAMBIAR GIRO"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-mono font-bold text-gray-900 focus:border-black focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSaving || confirmationText.trim().toUpperCase() !== 'CAMBIAR GIRO'}
                    className="bg-black hover:bg-gray-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Migrando Giro...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar y Bloquear por 30 Días</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
