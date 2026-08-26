import Link from 'next/link'
import { Home, UserCircle, Smartphone, LogOut, Coffee, BarChart3, Users, MessageSquareWarning, CreditCard } from 'lucide-react'
import { logout } from '@/app/auth/actions'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight">OmniTag</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <Home className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Inicio</span>
          </Link>
          <Link href="/dashboard/vcard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <UserCircle className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Mi vCard</span>
          </Link>
          <Link href="/dashboard/leads" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Contactos (CRM)</span>
          </Link>
          <Link href="/dashboard/devices" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Mis Dispositivos</span>
          </Link>
          <Link href="/dashboard/feedback" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <MessageSquareWarning className="w-5 h-5 text-red-400" />
            <span className="font-medium">Quejas Privadas</span>
          </Link>
          <Link href="/dashboard/menus" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <Coffee className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Menú Digital</span>
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Estadísticas</span>
          </Link>
          <div className="pt-4 mt-4 border-t border-gray-100"></div>
          <Link href="/dashboard/billing" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Suscripción</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
