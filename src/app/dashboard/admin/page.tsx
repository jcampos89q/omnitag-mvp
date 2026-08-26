import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Users, Zap, Smartphone, Coffee, UserCircle, Activity, HeartHandshake, DollarSign, ArrowLeft } from 'lucide-react'
import AdminUserTable, { AdminUser } from './AdminUserTable'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar si es administrador
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center max-w-lg mx-auto mt-12 shadow-sm">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
        <p className="text-gray-500 text-sm mb-6">
          Esta sección es exclusiva para los administradores de la plataforma OmniTag.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a mi panel
        </Link>
      </div>
    )
  }

  // Obtener métricas globales y lista de usuarios mediante RPC
  const [{ data: metricsData }, { data: usersData }] = await Promise.all([
    supabase.rpc('get_admin_metrics'),
    supabase.rpc('get_admin_users_list')
  ])

  const metrics = metricsData || {
    total_users: 0,
    total_pro_users: 0,
    total_free_users: 0,
    total_vcards: 0,
    total_menus: 0,
    total_devices: 0,
    total_scans: 0,
    total_leads: 0,
    total_feedbacks: 0
  }

  const users: AdminUser[] = usersData || []

  // Tasa de conversión y estimación de ingresos
  const conversionRate = metrics.total_users > 0 
    ? ((metrics.total_pro_users / metrics.total_users) * 100).toFixed(1) 
    : '0.0'
  const estimatedMrr = metrics.total_pro_users * 29 // $29/mes por usuario PRO

  return (
    <div className="space-y-8">
      {/* Cabecera del Panel de Control de Administración */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" /> PANEL DE SUPERADMINISTRADOR
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Métricas Globales y Base de Datos
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Supervisa el crecimiento de la plataforma, conversiones a planes de pago y exporta prospectos para marketing.
            </p>
          </div>
        </div>

        {/* KPIs Principales de Negocio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Usuarios */}
          <div className="bg-gray-50/90 p-5 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Registrados</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{metrics.total_users}</p>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-emerald-600">{metrics.total_pro_users} PRO</span> • {metrics.total_free_users} Gratuitos
            </p>
          </div>

          {/* Ingresos Mensuales Estimados */}
          <div className="bg-gray-50/90 p-5 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">MRR Estimado</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">${estimatedMrr}</p>
            <p className="text-xs text-gray-500 mt-1">
              Tasa de Conversión: <span className="font-bold text-gray-800">{conversionRate}%</span>
            </p>
          </div>

          {/* Dispositivos y Escaneos */}
          <div className="bg-gray-50/90 p-5 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tráfico / Escaneos</span>
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{metrics.total_scans}</p>
            <p className="text-xs text-gray-500 mt-1">
              En <span className="font-semibold text-gray-800">{metrics.total_devices}</span> QRs y placas activas
            </p>
          </div>

          {/* Leads y vCards */}
          <div className="bg-gray-50/90 p-5 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contactos / Leads</span>
              <HeartHandshake className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{metrics.total_leads}</p>
            <p className="text-xs text-gray-500 mt-1">
              Generados en <span className="font-semibold text-gray-800">{metrics.total_vcards}</span> vCards
            </p>
          </div>
        </div>

        {/* Resumen de Recursos Creados en la Plataforma */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50/60 rounded-2xl border border-gray-100 mb-8 text-center text-xs">
          <div>
            <span className="text-gray-400 font-medium">vCards Digitales:</span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{metrics.total_vcards}</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Menús Digitales:</span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{metrics.total_menus}</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Placas y QRs:</span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{metrics.total_devices}</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Quejas Privadas:</span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{metrics.total_feedbacks}</p>
          </div>
        </div>

        {/* Base de Datos de Usuarios & Marketing */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Base de Datos de Clientes y Marketing</h2>
            <p className="text-xs text-gray-500">
              Visualiza los usuarios registrados, sus números de contacto y exporta la lista para tus campañas publicitarias.
            </p>
          </div>

          <AdminUserTable users={users} />
        </div>
      </div>
    </div>
  )
}
