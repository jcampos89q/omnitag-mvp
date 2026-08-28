export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserCircle, Smartphone, Coffee, Users, BarChart3, ArrowRight, Zap, Sparkles, Star, QrCode, Gift, Check, ShieldCheck, Clock, AlertTriangle, Scissors } from 'lucide-react'
import { getUserPlanInfo } from '@/lib/plans'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Obtener plan, contador de días restantes y privilegios del usuario
  const { isPro, isAdmin, expiresAt, daysLeft, isExpired } = await getUserPlanInfo(supabase, user.id)

  // 2. Obtener conteos básicos para KPIs rápidos
  const [
    { count: devicesCount }, 
    { count: leadsCount },
    { count: menusCount },
    { count: vcardsCount }
  ] = await Promise.all([
    supabase.from('devices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('leads').select('*, vcards!inner(user_id)', { count: 'exact', head: true }).eq('vcards.user_id', user.id),
    supabase.from('menus').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('vcards').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  ])

  return (
    <div className="space-y-6">
      {/* 1. TARJETA DE BIENVENIDA Y ESTADO DEL PLAN */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                ¡Hola! 👋
              </h1>
              {isPro ? (
                <span className="bg-linear-to-r from-purple-600 to-indigo-600 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> PLAN PRO ILIMITADO
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                  Plan Básico ($0)
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Bienvenido a tu suite digital de OmniTag, <span className="font-semibold text-gray-800">{user.email}</span>.
            </p>
          </div>

          {!isPro && (
            <Link
              href="/dashboard/billing#metodos-pago"
              className="bg-black text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>Mejorar a PRO por L. 550 / $20</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* CONTADOR DE TIEMPO / ESTADO MENSUAL PRO */}
        {isPro && !isAdmin && expiresAt && (
          <div className={`mb-6 p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            daysLeft <= 5 
              ? 'bg-amber-50 border-amber-200 text-amber-950' 
              : 'bg-purple-50/80 border-purple-200 text-purple-950'
          }`}>
            <div className="flex items-center gap-2.5">
              <Clock className={`w-5 h-5 shrink-0 ${daysLeft <= 5 ? 'text-amber-600' : 'text-purple-600'}`} />
              <div>
                <p className="font-extrabold text-sm">
                  {daysLeft > 0 
                    ? `Suscripción Activa: ${daysLeft} ${daysLeft === 1 ? 'día restante' : 'días restantes'}`
                    : 'Suscripción por vencer hoy'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Vence el <b>{new Date(expiresAt).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' })}</b>. Se renueva con tu pago mensual por transferencia BAC o efectivo.
                </p>
              </div>
            </div>

            {daysLeft <= 7 && (
              <Link
                href="/dashboard/billing#metodos-pago"
                className="bg-black text-white font-bold px-3 py-1.5 rounded-xl text-xs shrink-0 hover:bg-gray-800 transition shadow-2xs"
              >
                Renovar con BAC →
              </Link>
            )}
          </div>
        )}

        {/* AVISO DE PLAN EXPIRADO */}
        {isExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs flex items-center justify-between text-red-950">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-bold">Tu periodo mensual de Plan PRO ha finalizado</p>
                <p className="text-[11px] opacity-80">Realiza tu transferencia por BAC o paga en efectivo para reactivar tus herramientas PRO de inmediato.</p>
              </div>
            </div>
            <Link
              href="/dashboard/billing#metodos-pago"
              className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shrink-0 hover:bg-red-700 transition"
            >
              Reactivar PRO →
            </Link>
          </div>
        )}

        {/* BANNER INFORMATIVO FREEMIUM SOLO SI ES BÁSICO */}
        {!isPro && !isExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-purple-50/80 via-amber-50/60 to-white border border-purple-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Límites de tu Plan Básico Gratuito
              </span>
              <Link href="/dashboard/billing#metodos-pago" className="text-purple-700 font-extrabold hover:underline">
                Ver Beneficios PRO →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-gray-600">
              <div className="p-2 bg-white rounded-xl border border-gray-100">
                <p className="font-bold text-gray-900">vCards: {vcardsCount || 0}/1</p>
                <p className="text-[10px] text-gray-400">1 activa en Básico</p>
              </div>
              <div className="p-2 bg-white rounded-xl border border-gray-100">
                <p className="font-bold text-gray-900">Menús: {menusCount || 0}/1</p>
                <p className="text-[10px] text-gray-400">Hasta 10 platos</p>
              </div>
              <div className="p-2 bg-white rounded-xl border border-gray-100">
                <p className="font-bold text-gray-900">Placas NFC: {devicesCount || 0}/1</p>
                <p className="text-[10px] text-gray-400">Enlace directo Google</p>
              </div>
              <div className="p-2 bg-white rounded-xl border border-gray-100">
                <p className="font-bold text-gray-900">Escudo 5★: Bloqueado</p>
                <p className="text-[10px] text-purple-600 font-semibold">Exclusivo PRO</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 2. ACCESOS RÁPIDOS A LAS HERRAMIENTAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* vCard */}
          <Link 
            href="/dashboard/vcard" 
            className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform">
                <UserCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Mi vCard Digital</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Tu tarjeta de presentación virtual interactiva para guardar contactos en la agenda.</p>
            </div>
            <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
              Gestionar vCard <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Estudio QR */}
          <Link 
            href="/dashboard/qr-studio" 
            className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-bold text-base text-gray-900">Estudio QR (Impresión)</h3>
                <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded">HD</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">Diseña códigos QR con degradados estilo Instagram, tu logo central y marcos para imprenta.</p>
            </div>
            <span className="mt-4 text-xs font-bold text-purple-700 inline-flex items-center gap-1 group-hover:underline">
              Diseñar e Imprimir <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Reseñas Google & NFC */}
          <Link 
            href="/dashboard/devices" 
            className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-amber-500 mb-3 group-hover:scale-105 transition-transform">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Reseñas Google & NFC</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Placas Tap-to-Rate con Escudo Anti-Quejas para multiplicar tus 5 estrellas en Google Maps.</p>
            </div>
            <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
              Configurar Placas ({devicesCount || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Menú Digital */}
          <Link 
            href="/dashboard/menus" 
            className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Menú & Catálogo</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Catálogo con fotos, categorías, precios y botón para recibir pedidos directos a WhatsApp.</p>
            </div>
            <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
              Gestionar Menú <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Fidelización & Sellos */}
          <Link 
            href="/dashboard/loyalty" 
            className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Fidelización & Sellos</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Tarjeta de sellos digitales para premiar a clientes frecuentes y aumentar visitas repetidas.</p>
            </div>
            <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
              Club de Premios <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Agendas & Citas (Barberías / Salones) */}
          <Link 
            href="/dashboard/appointments" 
            className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                <Scissors className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-bold text-base text-gray-900">Agendas & Citas</h3>
                <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded">NUEVO</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">Reserva de turnos para Barberías, Salones y Spas con selección y calificación de especialistas.</p>
            </div>
            <span className="mt-4 text-xs font-bold text-purple-700 inline-flex items-center gap-1 group-hover:underline">
              Gestionar Agenda <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Contactos CRM */}
          <Link 
            href="/dashboard/leads" 
            className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Contactos & CRM</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Base de datos de personas que intercambiaron datos contigo o se registraron en tus tarjetas.</p>
            </div>
            <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
              Ver Contactos ({leadsCount || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
