'use client'

import Link from 'next/link'
import { Lock, CreditCard, MessageCircle, Sparkles, ArrowRight, ShieldAlert, LogOut } from 'lucide-react'
import { logout } from '@/app/auth/actions'

export default function AccountLockedPaywall({ 
  userEmail,
  expiresAt
}: { 
  userEmail?: string
  expiresAt?: string | null
}) {
  const formattedDate = expiresAt 
    ? new Date(expiresAt).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'recientemente'

  const whatsappMessage = encodeURIComponent(
    `Hola OmniTag, mi periodo de prueba de 10 días ha finalizado (${userEmail || 'mi cuenta'}). Me gustaría solicitar una prórroga de 3 días para terminar de configurar mis herramientas.`
  )

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado con degradado y alerta */}
        <div className="bg-linear-to-r from-red-600 via-rose-600 to-amber-600 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 text-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            Acceso Restringido • Prueba Finalizada
          </span>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Tu periodo de prueba de 10 días concluyó
          </h1>
          <p className="text-sm sm:text-base text-rose-100 mt-2 max-w-lg mx-auto leading-relaxed">
            Tu acceso gratuito expiró el <span className="font-bold underline">{formattedDate}</span>. Para reactivar tu panel de control, enlaces y herramientas, activa tu membresía PRO.
          </p>
        </div>

        {/* Cuerpo con Opciones y Beneficios */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Opción 1: Suscripción Mensual */}
            <div className="p-5 rounded-2xl border-2 border-purple-200 bg-purple-50/40 hover:border-purple-400 transition space-y-3 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    Suscripción Mensual
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-gray-900">L. 550</span>
                  <span className="text-xs font-semibold text-gray-500"> / mes</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Acceso completo inmediato a vCards ilimitadas, menús interactivos, escudo de reseñas de Google 5★ y CRM de clientes.
                </p>
              </div>

              <Link
                href="/dashboard/billing#metodos-pago"
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <span>Ver Cuentas de Pago</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Opción 2: Tarjeta o Placa NFC Anual */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50 hover:border-gray-300 transition space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 bg-gray-200 px-2 py-0.5 rounded-md">
                    1 Año PRO Incluido
                  </span>
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-gray-900">L. 1,200</span>
                  <span className="text-xs font-semibold text-gray-500"> / pago único</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Incluye placa física o tarjeta NFC programada + 365 días de servicio PRO completo sin mensualidades.
                </p>
              </div>

              <Link
                href="/dashboard/billing"
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <span>Adquirir con Tarjeta NFC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Sección de Prórroga por WhatsApp */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-xs font-extrabold text-amber-900 flex items-center justify-center sm:justify-start gap-1.5">
                <span>¿Necesitas más tiempo para probar la plataforma?</span>
              </h4>
              <p className="text-[11px] text-amber-800/90 mt-0.5 leading-snug">
                Si aún estás configurando tu perfil o evaluando las herramientas, solicita una <strong>prórroga de cortesía de 3 días</strong> a nuestro equipo.
              </p>
            </div>
            <a
              href={`https://wa.me/50499000000?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shrink-0 shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Pedir Prórroga (+3d)</span>
            </a>
          </div>

          {/* Acciones de Navegación / Cerrar Sesión */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span className="truncate max-w-[200px] sm:max-w-xs">
              Sesión: <strong className="text-gray-700">{userEmail}</strong>
            </span>
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:text-red-600 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
