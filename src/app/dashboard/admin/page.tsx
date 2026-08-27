import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Users, Zap, Smartphone, Coffee, UserCircle, Activity, HeartHandshake, DollarSign, ArrowLeft, Gift } from 'lucide-react'
import AdminCreationsHub, { AdminCreationsData } from './AdminCreationsHub'
import { AdminUser } from './AdminUserTable'

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

  // Obtener métricas globales, usuarios, creaciones y contactos master mediante RPCs
  const [
    { data: metricsData }, 
    { data: usersData }, 
    { data: creationsData },
    { data: contactsData }
  ] = await Promise.all([
    supabase.rpc('get_admin_metrics'),
    supabase.rpc('get_admin_users_list'),
    supabase.rpc('get_admin_all_creations'),
    supabase.rpc('get_admin_master_contacts')
  ])

  const users: AdminUser[] = usersData || []
  const creations: AdminCreationsData = creationsData || {
    vcards: [],
    menus: [],
    loyalty: [],
    devices: []
  }

  const contacts = contactsData || {
    vcard_leads: [],
    loyalty_members: [],
    private_feedbacks: []
  }

  // Cálculos dinámicos garantizados para KPIs superiores
  const totalUsers = users.length || Number(metricsData?.total_users || 0)
  const totalProUsers = users.filter(u => u.out_plan === 'pro').length || Number(metricsData?.total_pro_users || 0)
  const totalFreeUsers = users.filter(u => u.out_plan !== 'pro').length || Number(metricsData?.total_free_users || 0)
  
  const totalCapturedContacts = 
    (contacts.vcard_leads?.length || 0) + 
    (contacts.loyalty_members?.length || 0) + 
    (contacts.private_feedbacks?.length || 0)

  const totalScans = Number(metricsData?.total_scans || 0) || users.reduce((acc, u) => acc + Number(u.out_scans_count || 0), 0)
  const totalDevices = creations.devices?.length || Number(metricsData?.total_devices || 0)

  // Tasa de conversión y estimación de ingresos
  const conversionRate = totalUsers > 0 
    ? ((totalProUsers / totalUsers) * 100).toFixed(1) 
    : '0.0'
  const estimatedMrr = totalProUsers * 29 // $29/mes por usuario PRO

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
              Base de Datos Master & Control Global
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Supervisa el crecimiento, <b>gestiona y descarga todos los contactos y prospectos capturados</b> en la plataforma y accede a todas las creaciones en vivo.
            </p>
          </div>
        </div>

        {/* KPIs Principales de Negocio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Usuarios */}
          <div className="bg-gray-50/90 p-5 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Usuarios Plataforma</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-emerald-600">{totalProUsers} PRO</span> • {totalFreeUsers} Gratuitos
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

          {/* Contactos Master Capturados */}
          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Base Master Clientes</span>
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-900">{totalCapturedContacts}</p>
            <p className="text-xs text-emerald-700 mt-1">
              vCards, Fidelización y Reseñas
            </p>
          </div>

          {/* Dispositivos y Escaneos */}
          <div className="bg-gray-50/90 p-5 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tráfico / Escaneos</span>
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{totalScans}</p>
            <p className="text-xs text-gray-500 mt-1">
              En <span className="font-semibold text-gray-800">{totalDevices}</span> QRs y placas activas
            </p>
          </div>
        </div>

        {/* Explorador de Creaciones & Contactos Master */}
        <div>
          <AdminCreationsHub 
            users={users} 
            creations={creations} 
            contacts={contacts}
          />
        </div>
      </div>
    </div>
  )
}
