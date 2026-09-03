'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  Home, 
  UserCircle, 
  Smartphone, 
  MessageSquareWarning, 
  BarChart3, 
  LogOut, 
  Coffee,
  Users,
  CreditCard,
  Menu as MenuIcon,
  X,
  Gift,
  QrCode,
  ShieldCheck,
  Star,
  Sparkles,
  Scissors,
  Globe,
  ExternalLink,
  Disc
} from 'lucide-react'
import { logout } from '@/app/auth/actions'
import NotificationBell from './NotificationBell'

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: string
  accent?: boolean
  adminOnly?: boolean
  section?: string
}

const baseNavItems: NavItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: Home, section: 'principal' },
  { name: 'Mi vCard', href: '/dashboard/vcard', icon: UserCircle, section: 'creaciones' },
  { name: 'Estudio QR (Imprimibles)', href: '/dashboard/qr-studio', icon: QrCode, badge: 'HD', section: 'creaciones' },
  { name: 'Reseñas Google & NFC', href: '/dashboard/devices', icon: Star, section: 'creaciones' },
  { name: 'Menú & Catálogo', href: '/dashboard/menus', icon: Coffee, section: 'creaciones' },
  { name: 'Agendas & Citas', href: '/dashboard/appointments', icon: Scissors, badge: 'Nuevo', section: 'creaciones' },
  { name: 'Fidelización & Sellos', href: '/dashboard/loyalty', icon: Gift, section: 'creaciones' },
  { name: 'Ruleta de Premios', href: '/dashboard/ruleta', icon: Disc, badge: 'VIP', section: 'creaciones' },
  { name: 'Contactos (CRM)', href: '/dashboard/leads', icon: Users, section: 'gestion' },
  { name: 'Quejas Privadas', href: '/dashboard/feedback', icon: MessageSquareWarning, section: 'gestion' },
  { name: 'Estadísticas', href: '/dashboard/analytics', icon: BarChart3, section: 'gestion' },
  { name: 'Suscripción', href: '/dashboard/billing', icon: CreditCard, accent: true, section: 'cuenta' },
]

export default function DashboardNavbar({ 
  userEmail,
  userId,
  isAdmin = false,
}: { 
  userEmail?: string 
  userId?: string
  isAdmin?: boolean
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ name: 'Panel Admin & Marketing', href: '/dashboard/admin', icon: ShieldCheck, adminOnly: true, section: 'admin' }] : [])
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

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="p-2 rounded-xl text-gray-700 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            title="Ir a la página principal de la web"
          >
            <Globe className="w-5 h-5" />
          </Link>

          <NotificationBell userId={userId} position="topbar" />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:text-black hover:bg-gray-100 transition-colors focus:outline-none flex items-center gap-1 font-bold text-xs"
            aria-label="Abrir menú"
          >
            <span>Menú</span>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. DRAWER MÓVIL (Slide-over menú completo) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl p-5 z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center font-bold text-base">
                  O
                </div>
                <span className="text-lg font-bold tracking-tight text-gray-900">Menú Principal</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userEmail && (
              <div className="px-3 py-2 bg-gray-50 rounded-xl mb-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Conectado como:</p>
                <p className="text-xs font-bold text-gray-800 truncate">{userEmail}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                    👑 Super Administrador
                  </span>
                )}
              </div>
            )}

            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      active
                        ? 'bg-black text-white font-bold shadow-xs'
                        : item.adminOnly
                        ? 'text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : item.adminOnly ? 'text-purple-600' : 'text-gray-500'}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        active ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="pt-3 border-t border-gray-100 mt-auto space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition"
                title="Ir a la página principal de la web"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span>Página Principal (Web)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <form action={logout}>
                <button 
                  type="submit" 
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIDEBAR DE ESCRITORIO (Visible solo en >= md) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0 min-h-screen sticky top-0 h-screen">
        <div className="p-6 pb-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">
              O
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">OmniTag</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="p-2 text-gray-500 hover:text-black rounded-xl hover:bg-gray-100 transition cursor-pointer"
              title="Ver Página Principal (Web)"
            >
              <Globe className="w-5 h-5" />
            </Link>
            <NotificationBell userId={userId} position="sidebar" />
          </div>
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active 
                    ? 'bg-black text-white shadow-xs font-bold' 
                    : item.adminOnly
                    ? 'text-purple-700 bg-purple-50/70 hover:bg-purple-100 font-bold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : item.adminOnly ? 'text-purple-600' : item.accent ? 'text-yellow-600' : 'text-gray-500'}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    active ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto space-y-1">
          <Link
            href="/"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition"
            title="Ver la página de inicio principal de OmniTag"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <span>Página Principal (Web)</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          <form action={logout}>
            <button 
              type="submit" 
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* 4. BARRA DE ACCIONES RÁPIDAS INFERIOR MÓVIL */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link 
          href="/dashboard"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
            pathname === '/dashboard' ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className={`w-5 h-5 ${pathname === '/dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Inicio</span>
        </Link>

        <Link 
          href="/dashboard/vcard"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
            pathname.startsWith('/dashboard/vcard') ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <UserCircle className={`w-5 h-5 ${pathname.startsWith('/dashboard/vcard') ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">vCard</span>
        </Link>

        <Link 
          href="/dashboard/qr-studio"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
            pathname.startsWith('/dashboard/qr-studio') ? 'text-purple-600 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <QrCode className={`w-5 h-5 ${pathname.startsWith('/dashboard/qr-studio') ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Estudio QR</span>
        </Link>

        <Link 
          href="/dashboard/devices"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
            pathname.startsWith('/dashboard/devices') ? 'text-amber-500 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Star className={`w-5 h-5 ${pathname.startsWith('/dashboard/devices') ? 'fill-amber-400 stroke-amber-500' : ''}`} />
          <span className="text-[10px] mt-0.5">Reseñas</span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-gray-500 hover:text-gray-900 transition"
        >
          <MenuIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">Más</span>
        </button>
      </nav>
    </>
  )
}
