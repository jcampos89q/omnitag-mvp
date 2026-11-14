import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos de Servicio y Reembolsos | OmniTag',
  description: 'Condiciones generales de contratación, política de reembolsos y garantías de satisfacción para las suscripciones de software SaaS OmniTag.',
}

export default function TermsAndRefundsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-black selection:text-white">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="font-black text-xl tracking-tight text-gray-900">OmniTag</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Marco Legal y Garantía de Satisfacción
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">
            Condiciones de Servicio y Política de Reembolso
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Última actualización: Noviembre 2026. Transparencia total en tus suscripciones digitales con OmniTag.
          </p>
        </div>

        {/* 1. Condiciones del Servicio */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs space-y-4">
          <h2 className="text-xl font-black text-gray-950 flex items-center gap-2">
            <span>1. Condiciones de Servicio (Terms of Service)</span>
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            OmniTag es un servicio de software bajo la modalidad SaaS (Software as a Service). Al suscribirse a cualquiera de nuestros planes comerciales o licencias de agencia:
          </p>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><b>Activación Inmediata:</b> El acceso a las herramientas digitales (menús QR, reseñas, tarjetas interactivas y panel de control) se habilita instantáneamente al confirmarse el pago.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><b>Sin Permanencia Forzosa:</b> Las suscripciones mensuales pueden cancelarse en cualquier momento desde el panel de usuario o comunicándose a soporte sin penalizaciones.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><b>Disponibilidad y Actualizaciones:</b> Mantenemos una disponibilidad del servicio del 99.8% e incluimos soporte técnico y actualizaciones continuas sin costo adicional.</span>
            </li>
          </ul>
        </section>

        {/* 2. Política de Reembolso */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-gray-950">
              2. Política de Reembolso y Devoluciones (Refund Policy)
            </h2>
          </div>

          <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 text-sm text-purple-900 leading-relaxed font-medium">
            🛡️ <b>Garantía de Satisfacción de 7 Días:</b> Si contratas una suscripción a OmniTag o una licencia de agencia y consideras que el software no se ajusta a las necesidades operativas de tu negocio, tienes derecho a solicitar un <b>reembolso del 100% de tu dinero dentro de los primeros 7 días naturales</b> posteriores a tu compra inicial.
          </div>

          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <h3 className="font-bold text-gray-900">¿Cómo solicitar un reembolso?</h3>
            <p>
              Para procesar tu reembolso sin complicaciones ni preguntas incómodas:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-gray-600">
              <li>Envía un correo electrónico a <b>soporte@omnitag.site</b> con el asunto <i>"Solicitud de Reembolso"</i>.</li>
              <li>Indica el correo con el que realizaste el pago y el número de recibo o transacción de Paddle / Hotmart.</li>
              <li>Nuestro equipo procesará la solicitud en un plazo máximo de <b>24 a 48 horas hábiles</b>. El abono se reflejará directamente en la misma tarjeta o método de pago con el que realizaste la compra según los tiempos de tu entidad bancaria.</li>
            </ol>
          </div>
        </section>

        {/* 3. Cancelaciones */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs space-y-3">
          <h2 className="text-xl font-black text-gray-950">
            3. Cancelación de Suscripciones
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Puedes cancelar la renovación automática de tu suscripción en cualquier momento antes de la fecha de corte. Tras cancelar, mantendrás acceso completo a todas las funciones hasta que finalice el periodo mensual pagado, sin cargos adicionales a futuro.
          </p>
        </section>

        {/* Contacto */}
        <div className="text-center pt-4 space-y-2 text-xs text-gray-500">
          <p className="flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span>Soporte oficial: <b>soporte@omnitag.site</b></span>
          </p>
          <p>© {new Date().getFullYear()} OmniTag. Todos los derechos reservados.</p>
        </div>
      </main>
    </div>
  )
}
