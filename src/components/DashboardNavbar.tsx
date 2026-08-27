'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  UserCircle, 
  Smartphone, 
  LogOut, 
  Coffee, 
  BarChart3, 
  Users, 
  MessageSquareWarning, 
  CreditCard,
  Menu as MenuIcon,
  X,
  Gift,
  ShieldCheck
} from 'lucide-react'
import { logout } from '@/app/auth/actions'

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: string
  accent?: boolean
  adminOnly?: boolean
}

const baseNavItems: NavItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Mi vCard', href: '/dashboard/vcard', icon: UserCircle },
  { name: 'Contactos (CRM)', href: '/dashboard/leads', icon: Users },
  { name: 'Fidelización & Sellos', href: '/dashboard/loyalty', icon: Gift },
  { name: 'Menú & Catálogo', href: '/dashboard/menus', icon: Coffee },
  { name: 'Mis Dispositivos', href: '/dashboard/devices', icon: Smartphone },
  { name: 'Quejas Privadas', href: '/dashboard/feedback', icon: MessageSquareWarning },
  { name: 'Estadísticas', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Suscripción', href: '/dashboard/billing', icon: CreditCard, accent: true },
]

export default function DashboardNavbar({ 
  userEmail,
  isAdmin = false,
}: { 
  userEmail?: string 
  isAdmin?: boolean
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ name: 'Panel Admin & Marketing', href: '/dashboard/admin', icon: ShieldCheck, adminOnly: true }] : [])
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* 1. TOP BAR MÓVIL (Visible solo en < md) */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">
            O
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">OmniTag</span>
          {isAdmin && (
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          )}
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-colors focus:outline-none"
          aria-label="Abrir menú"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </header>

      {/* 2. DRAWER MÓVIL (Slide-over menú) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl p-6 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">
                  O
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">OmniTag</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userEmail && (
              <div className="px-3 py-2 bg-gray-50 rounded-lg mb-4">
                <p className="text-xs text-gray-500 font-medium">Conectado como:</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{userEmail}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                    👑 Super Administrador
                  </span>
                )}
              </div>
            )}

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      active
                        ? 'bg-black text-white shadow-xs'
                        : item.adminOnly 
                        ? 'text-purple-700 bg-purple-50/70 hover:bg-purple-100 font-bold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : item.adminOnly ? 'text-purple-600' : item.accent ? 'text-yellow-600' : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="pt-4 mt-auto border-t border-gray-100">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIDEBAR DE ESCRITORIO (Visible solo en >= md) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="p-6 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">
              O
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">OmniTag</span>
          </Link>
        </div>

        {userEmail && (
          <div className="px-6 py-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium">Cuenta activa</p>
              {isAdmin && (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">{userEmail}</p>
          </div>
        )}
        
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active 
                    ? 'bg-black text-white shadow-xs' 
                    : item.adminOnly
                    ? 'text-purple-700 bg-purple-50/70 hover:bg-purple-100 font-bold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : item.adminOnly ? 'text-purple-600' : item.accent ? 'text-yellow-600' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* 4. BARRA DE NAVEGACIÓN RÁPIDA INFERIOR (Mobile Bottom Bar en móviles) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center justify-around py-2 px-1 shadow-lg">
        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center py-1 px-2 text-xs font-medium ${
            isActive('/dashboard') ? 'text-black font-bold' : 'text-gray-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Inicio</span>
        </Link>
        <Link 
          href="/dashboard/vcard" 
          className={`flex flex-col items-center py-1 px-2 text-xs font-medium ${
            isActive('/dashboard/vcard') ? 'text-black font-bold' : 'text-gray-500'
          }`}
        >
          <UserCircle className="w-5 h-5 mb-0.5" />
          <span>vCard</span>
        </Link>
        <Link 
          href="/dashboard/menus" 
          className={`flex flex-col items-center py-1 px-2 text-xs font-medium ${
            isActive('/dashboard/menus') ? 'text-black font-bold' : 'text-gray-500'
          }`}
        >
          <Coffee className="w-5 h-5 mb-0.5" />
          <span>Menú</span>
        </Link>
        <Link 
          href="/dashboard/devices" 
          className={`flex flex-col items-center py-1 px-2 text-xs font-medium ${
            isActive('/dashboard/devices') ? 'text-black font-bold' : 'text-gray-500'
          }`}
        >
          <Smartphone className="w-5 h-5 mb-0.5" />
          <span>QRs</span>
        </Link>
        {isAdmin ? (
          <Link
            href="/dashboard/admin"
            className={`flex flex-col items-center py-1 px-2 text-xs font-medium ${
              isActive('/dashboard/admin') ? 'text-purple-700 font-bold' : 'text-purple-600'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span>Admin</span>
          </Link>
        ) : (
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center py-1 px-2 text-xs font-medium text-gray-500 hover:text-black focus:outline-none"
          >
            <MenuIcon className="w-5 h-5 mb-0.5" />
            <span>Más</span>
          </button>
        )}
      </nav>
    </>
  )
}
