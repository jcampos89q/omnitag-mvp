'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface ProFeaturePaywallProps {
  featureName: string
  featureDescription?: string
  hardwareType?: 'vcard' | 'review_plate' | 'both' | null
}

export default function ProFeaturePaywall({
  featureName,
  featureDescription,
  hardwareType
}: ProFeaturePaywallProps) {
  const isVcardHardware = hardwareType === 'vcard' || hardwareType === 'both'
  const isPlateHardware = hardwareType === 'review_plate' || hardwareType === 'both'

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-10 bg-white rounded-3xl border border-gray-200 shadow-sm text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 bg-purple-100 text-purple-800 rounded-full inline-block">
          Función de Suscripción PRO
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
          {featureName} está reservada para el Plan PRO
        </h2>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          {featureDescription || 'Esta funcionalidad avanzada requiere una suscripción mensual activa para potenciar las ventas de tu negocio.'}
        </p>
      </div>

      {/* Explicación clara sobre su compra física */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm text-gray-700 space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tu hardware físico sigue 100% activo:</span>
        </div>
        <ul className="space-y-1.5 pl-6 list-disc text-gray-600">
          {isVcardHardware && (
            <li>Tu <b>Tarjeta Inteligente NFC</b>, perfil <b>vCard</b>, <b>CRM de Contactos</b> y <b>Estadísticas</b> están activos por 1 año completo.</li>
          )}
          {isPlateHardware && (
            <li>Tu <b>Placa de Reseñas NFC</b>, sistema de <b>Quejas Privadas</b> y <b>Métricas de Escaneos</b> están activos por 1 año completo.</li>
          )}
          <li>El primer mes gratis de prueba completa ha concluido. Para reactivar la ruleta de premios, tarjetas de sellos, agendas de citas y menús, solo requieres la suscripción mensual.</li>
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/dashboard/billing"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black hover:bg-gray-800 text-white font-extrabold text-sm rounded-xl transition shadow-md cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Activar Suscripción Mensual
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition"
        >
          Volver a Mi Panel
        </Link>
      </div>
    </div>
  )
}
