'use client'

import { useState, useTransition } from 'react'
import { Hourglass, AlertTriangle, ExternalLink, Check, Copy, Building2, MapPin, Phone, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import GooglePlaceSearchInput, { PlaceDetails } from '@/components/GooglePlaceSearchInput'
import { activatePendingPlateWithGoogle } from './actions'

interface PendingPlateAlertProps {
  plate: {
    id: string
    tag_id?: string | null
    business_name?: string | null
    business_address?: string | null
    business_phone?: string | null
    is_active?: boolean | null
  }
  onActivated: (updatedDevice: any) => void
}

export default function PendingPlateAlert({ plate, onActivated }: PendingPlateAlertProps) {
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [activatedSuccess, setActivatedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const businessName = plate.business_name || 'Tu Negocio'
  const googleCreateUrl = `https://business.google.com/create?business_name=${encodeURIComponent(businessName)}`

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleActivate = () => {
    if (!selectedPlace) return
    setErrorMsg(null)

    startTransition(async () => {
      try {
        const res = await activatePendingPlateWithGoogle(
          plate.id,
          selectedPlace.place_id,
          selectedPlace.direct_review_url || `https://search.google.com/local/writereview?placeid=${selectedPlace.place_id}`,
          selectedPlace.name,
          selectedPlace.formatted_address,
          selectedPlace.formatted_phone_number,
          selectedPlace.types || []
        )
        if (res.success && res.device) {
          setActivatedSuccess(true)
          onActivated(res.device)
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al activar placa')
      }
    })
  }

  if (activatedSuccess) {
    return (
      <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-3xl p-6 text-emerald-950 space-y-3 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-emerald-900 text-base">
              ¡Placa Física Encendida y Lista para el Mostrador!
            </h3>
            <p className="text-xs text-emerald-700">
              La placa <b>{plate.tag_id}</b> ahora está vinculada exitosamente a <b>{selectedPlace?.name}</b> en Google Maps.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 animate-in fade-in">
      {/* Encabezado del estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Hourglass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-900 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>Placa en Espera de Aprobación de Google</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight mt-0.5">
              Placa NFC: {plate.tag_id} ({businessName})
            </h2>
          </div>
        </div>
      </div>

      {/* Advertencia Destacada: NO PONER EN MOSTRADOR */}
      <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 space-y-1">
          <p className="font-extrabold uppercase tracking-wide text-amber-900">
            Atención: No coloques esta placa en tu mostrador todavía
          </p>
          <p className="leading-relaxed">
            Tu placa física está registrada con <b>365 días de garantía y servicio PRO</b>. Mantenla guardada hasta que Google verifique y publique tu ficha oficial en Google Maps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        {/* PASO 1: Asistente para dar de alta la ficha en Google */}
        <div className="p-5 bg-white rounded-2xl border border-amber-200/60 shadow-xs space-y-3.5">
          <div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-black text-[10px] uppercase tracking-wider">
              Paso 1
            </span>
            <h4 className="font-black text-gray-900 text-sm mt-1">
              Tramita tu Ficha en Google Business
            </h4>
            <p className="text-[11px] text-gray-500">
              Abre el registro oficial de Google con un clic y usa estos botones para copiar tus datos sin escribir.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-bold text-gray-800 truncate">{businessName}</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(businessName, 'name')}
                className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-[11px] font-bold text-gray-700 flex items-center gap-1 transition shrink-0 shadow-xs cursor-pointer"
              >
                {copiedField === 'name' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'name' ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            {plate.business_address && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-700 truncate text-[11px]">{plate.business_address}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(plate.business_address!, 'address')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-[11px] font-bold text-gray-700 flex items-center gap-1 transition shrink-0 shadow-xs cursor-pointer"
                >
                  {copiedField === 'address' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'address' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            )}

            {plate.business_phone && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-700 truncate text-[11px]">{plate.business_phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(plate.business_phone!, 'phone')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-[11px] font-bold text-gray-700 flex items-center gap-1 transition shrink-0 shadow-xs cursor-pointer"
                >
                  {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'phone' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            )}
          </div>

          <a
            href={googleCreateUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition flex items-center justify-center gap-2 text-center shadow-xs"
          >
            <span>Abrir Registro en Google Business →</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* PASO 2: Vinculación final cuando Google aprueba */}
        <div className="p-5 bg-white rounded-2xl border border-amber-200/60 shadow-xs space-y-3.5">
          <div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase tracking-wider">
              Paso 2
            </span>
            <h4 className="font-black text-gray-900 text-sm mt-1">
              ¿Google ya aprobó tu negocio? Enciende tu placa
            </h4>
            <p className="text-[11px] text-gray-500">
              Busca tu local en Google Maps abajo para activarla en 1 clic y ponerla en tu mostrador.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-gray-700">
              Busca tu negocio aprobado en Google Maps:
            </label>
            <GooglePlaceSearchInput
              onPlaceSelected={(place) => setSelectedPlace(place)}
              initialPlace={selectedPlace}
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 font-bold">{errorMsg}</p>
          )}

          <button
            type="button"
            disabled={!selectedPlace || isPending}
            onClick={handleActivate}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isPending ? 'Vinculando y Encendiendo...' : '🚀 Vincular y Encender Mi Placa Física'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
