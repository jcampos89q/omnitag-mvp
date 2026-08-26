import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserCircle, Smartphone, Coffee, Users, BarChart3, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener conteos básicos para KPIs rápidos
  const [{ count: devicesCount }, { count: leadsCount }] = await Promise.all([
    supabase.from('devices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('leads').select('*, vcards!inner(user_id)', { count: 'exact', head: true }).eq('vcards.user_id', user.id)
  ])

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
          ¡Hola! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Bienvenido a tu panel de control de OmniTag, <span className="font-semibold text-gray-800">{user.email}</span>.
        </p>
        
        {/* Accesos Rápidos en Grid Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/vcard" 
            className="group p-5 border border-gray-100 rounded-xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-lg flex items-center justify-center text-gray-800 mb-3 group-hover:scale-105 transition-transform">
                <UserCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-gray-900 mb-1">Mi vCard Digital</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Configura tu tarjeta virtual, enlaces y captura de contactos.</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-black inline-flex items-center gap-1 group-hover:underline">
              Editar Perfil <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link 
            href="/dashboard/menus" 
            className="group p-5 border border-gray-100 rounded-xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-lg flex items-center justify-center text-gray-800 mb-3 group-hover:scale-105 transition-transform">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-gray-900 mb-1">Menú Digital</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Catálogo interactivo con fotos y pedidos directos a WhatsApp.</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-black inline-flex items-center gap-1 group-hover:underline">
              Gestionar Menú <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link 
            href="/dashboard/devices" 
            className="group p-5 border border-gray-100 rounded-xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between sm:col-span-2 lg:col-span-1"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-lg flex items-center justify-center text-gray-800 mb-3 group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-gray-900 mb-1">Dispositivos y QRs</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Placas Tap-to-Rate NFC, reseñas de Google y enlaces dinámicos.</p>
            </div>
            <span className="mt-4 text-xs font-semibold text-black inline-flex items-center gap-1 group-hover:underline">
              Ver Dispositivos ({devicesCount || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
