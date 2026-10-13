'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  Disc,
  MapPin,
  ShoppingBag,
  Stethoscope,
  ChevronDown
} from 'lucide-react'
import { logout } from '@/app/auth/actions'
import NotificationBell from './NotificationBell'
import { UserPlanInfo } from '@/lib/plans'
import IndustrySwitcher from './IndustrySwitcher'
import { getIndustryConfig, normalizeIndustry, IndustryId } from '@/lib/industries'

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: string
  accent?: boolean
  adminOnly?: boolean
  section?: string
  priority?: boolean
}

const baseNavItems: NavItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: Home, section: 'principal' },
  { name: 'Mi vCard', href: '/dashboard/vcard', icon: UserCircle, section: 'creaciones' },
  { name: 'Estudio QR (Imprimibles)', href: '/dashboard/qr-studio', icon: QrCode, badge: 'HD', section: 'creaciones' },
  { name: 'Reseñas Google & NFC', href: '/dashboard/devices', icon: Star, section: 'creaciones' },
  { name: 'Google Maps & SEO Local', href: '/dashboard/google-business', icon: MapPin, badge: 'IA', section: 'creaciones' },
  { name: 'Menú & Catálogo', href: '/dashboard/menus', icon: Coffee, section: 'creaciones' },
  { name: 'Agendas & Citas', href: '/dashboard/appointments', icon: Scissors, badge: 'Nuevo', section: 'creaciones' },
  { name: 'Tarjetas de Regalo', href: '/dashboard/gift-cards', icon: Gift, badge: 'Nuevo', section: 'creaciones' },
  { name: 'Fidelización & Sellos', href: '/dashboard/loyalty', icon: Sparkles, section: 'creaciones' },
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
  userIndustry = 'general',
  accountType = 'professional',
  planInfo
}: { 
  userEmail?: string 
  userId?: string
  isAdmin?: boolean
  userIndustry?: string
  accountType?: string
  planInfo?: UserPlanInfo
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const normalizedIndustry = normalizeIndustry(userIndustry)
  const industryConfig = getIndustryConfig(userIndustry)

  // Filtrado de navegación según el plan real y compra de hardware
  let filteredBaseItems: NavItem[] = []

  const canAccessProSuite = Boolean(isAdmin || planInfo?.canAccessProSuite)
  const hasNfc = Boolean(planInfo?.hasNfcCard || accountType === 'professional')
  const hasPlate = Boolean(planInfo?.hasReviewPlate || accountType === 'review_plate')

  if (isAdmin) {
    // 1. EL SUPERADMINISTRADOR TIENE ACCESO TOTAL A TODAS LAS HERRAMIENTAS
    filteredBaseItems = [...baseNavItems]
    filteredBaseItems.splice(5, 0, { name: 'Pacientes', href: '/dashboard/patients', icon: Stethoscope, badge: 'Salud', section: 'gestion' })
  } else if (canAccessProSuite) {
    // 2. PLAN PRO ACTIVO O PRUEBA GRATUITA:
    filteredBaseItems = baseNavItems.filter(item => {
      // Pacientes solo para salud o administradores
      if (normalizedIndustry !== 'health' && item.href === '/dashboard/patients') return false
      return true
    })

    if (normalizedIndustry === 'health') {
      filteredBaseItems.splice(1, 0, { 
        name: 'Pacientes & ECE', 
        href: '/dashboard/patients', 
        icon: Stethoscope, 
        badge: 'Médico', 
        section: 'creaciones' 
      })
    }
  } else {
    // 3. SIN SUSCRIPCIÓN MENSUAL (FUERA DEL MES GRATIS): SOLO HARDWARE FÍSICO ACTIVO
    const allowedHrefs: string[] = ['/dashboard']

    if (hasNfc) {
      allowedHrefs.push('/dashboard/vcard', '/dashboard/leads', '/dashboard/analytics')
    }

    if (hasPlate) {
      if (!allowedHrefs.includes('/dashboard/devices')) allowedHrefs.push('/dashboard/devices')
      if (!allowedHrefs.includes('/dashboard/feedback')) allowedHrefs.push('/dashboard/feedback')
      if (!allowedHrefs.includes('/dashboard/analytics')) allowedHrefs.push('/dashboard/analytics')
    }

    if (!hasNfc && !hasPlate) {
      allowedHrefs.push('/dashboard/analytics')
    }

    allowedHrefs.push('/dashboard/billing')
    filteredBaseItems = baseNavItems.filter(item => allowedHrefs.includes(item.href))
  }

  // 4. Adaptar nombres, iconos y badges según la industria del usuario
  filteredBaseItems = filteredBaseItems.map(item => {
    const override = industryConfig.routeLabels[item.href]
    let currentIcon = item.icon

    // Iconos contextuales
    if (item.href === '/dashboard/menus' && normalizedIndustry === 'retail') {
      currentIcon = ShoppingBag
    } else if (item.href === '/dashboard/appointments' && normalizedIndustry === 'health') {
      currentIcon = Stethoscope
    }

    return {
      ...item,
      name: override?.name || item.name,
      badge: override?.badge || item.badge,
      icon: currentIcon,
      priority: industryConfig.priorityHrefs.includes(item.href)
    }
  })

  // 5. Ordenar según la prioridad de la industria
  if (canAccessProSuite || isAdmin) {
    filteredBaseItems.sort((a, b) => {
      const indexA = industryConfig.priorityHrefs.indexOf(a.href)
      const indexB = industryConfig.priorityHrefs.indexOf(b.href)
      
      const posA = indexA === -1 ? 999 : indexA
      const posB = indexB === -1 ? 999 : indexB

      return posA - posB
    })
  }

  // Añadir Configuración al final
  filteredBaseItems.push({ name: 'Configuración', href: '/dashboard/settings', icon: UserCircle, section: 'cuenta' })

  const navItems = [
    ...filteredBaseItems,
    ...(isAdmin ? [
      { name: '🏷️ Lotes Tarjetas NFC', href: '/dashboard/admin?tab=nfc-batches', icon: CreditCard, adminOnly: true, section: 'admin' },
      { name: 'Panel Admin & Marketing', href: '/dashboard/admin', icon: ShieldCheck, adminOnly: true, section: 'admin' }
    ] : [])
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  // Obtener icono dinámico para la barra inferior
  const getBottomIcon = (iconKey: string) => {
    switch (iconKey) {
      case 'home': return Home
      case 'menu': return normalizedIndustry === 'retail' ? ShoppingBag : Coffee
      case 'star': return Star
      case 'scissors': return Scissors
      case 'stethoscope': return Stethoscope
      case 'vcard': return UserCircle
      case 'leads': return Users
      case 'gift': return Gift
      case 'loyalty': return Sparkles
      case 'ruleta': return Disc
      case 'analytics': return BarChart3
      case 'shop': return ShoppingBag
      default: return Home
    }
  }

  // Obtener los accesos directos para la barra móvil según si tiene Pro Suite o solo Hardware
  const allowedBottomBar = !canAccessProSuite
    ? (hasPlate
        ? [
            { name: 'Inicio', href: '/dashboard', icon: 'home' },
            { name: 'Mi Placa', href: '/dashboard/devices', icon: 'star' },
            { name: 'Quejas', href: '/dashboard/feedback', icon: 'alert' },
            { name: 'Métricas', href: '/dashboard/analytics', icon: 'analytics' }
          ]
        : hasNfc
        ? [
            { name: 'Inicio', href: '/dashboard', icon: 'home' },
            { name: 'vCard', href: '/dashboard/vcard', icon: 'vcard' },
            { name: 'Contactos', href: '/dashboard/leads', icon: 'leads' },
            { name: 'Métricas', href: '/dashboard/analytics', icon: 'analytics' }
          ]
        : industryConfig.bottomBar)
    : industryConfig.bottomBar

  return (
    <>
      {/* 1. TOP BAR MÓVIL (Visible solo en < md) */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 min-w-0">
          <Image
            src="/logo-light.png"
            alt="OmniTag"
            width={28}
            height={28}
            className="w-7 h-7 shrink-0 object-contain"
            priority
          />
          <span className="text-lg font-black tracking-tight text-gray-900 truncate">OmniTag</span>
          {isAdmin && (
            <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded-sm shrink-0">
              ADMIN
            </span>
          )}
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Selector de Industria compacto en Topbar móvil */}
          <IndustrySwitcher currentIndustry={userIndustry} variant="compact" />

          <NotificationBell userId={userId} position="topbar" />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 px-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors flex items-center gap-1 font-bold text-xs cursor-pointer ml-0.5"
            aria-label="Abrir menú"
          >
            <span className="hidden xs:inline">Menú</span>
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
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
                <Image
                  src="/logo-light.png"
                  alt="OmniTag"
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
                <span className="text-lg font-bold tracking-tight text-gray-900">Menú Principal</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Industria en el Drawer */}
            <div className="mb-3">
              <IndustrySwitcher currentIndustry={userIndustry} variant="banner" className="py-2.5 px-3" />
            </div>

            {userEmail && (
              <div className="px-3 py-2 bg-gray-50 rounded-xl mb-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Conectado como:</p>
                <p className="text-xs font-bold text-gray-800 truncate">{userEmail}</p>
                {isAdmin ? (
                  <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                    👑 Super Administrador
                  </span>
                ) : planInfo?.isTrial ? (
                  <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    ⚡ Mes Gratis Full ({planInfo.trialDaysLeft}d)
                  </span>
                ) : planInfo?.isMonthlyPro ? (
                  <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                    💎 Plan PRO Activo
                  </span>
                ) : planInfo?.isHardwareActive ? (
                  <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    🏷️ {planInfo.hasReviewPlate ? 'Placa NFC (1 Año)' : 'Tarjeta NFC (1 Año)'}
                  </span>
                ) : null}
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
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
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
        <div className="px-4 py-3.5 pb-3 flex items-center justify-between border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={32}
              height={32}
              className="w-8 h-8 shrink-0 object-contain"
              priority
            />
            <span className="text-xl font-black tracking-tight text-gray-900 truncate">OmniTag</span>
          </Link>

          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/"
              className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition cursor-pointer"
              title="Ver Página Principal (Web)"
            >
              <Globe className="w-4 h-4" />
            </Link>
            <NotificationBell userId={userId} position="sidebar" />
          </div>
        </div>

        {/* Banner de Giro de Negocio / Switcher en Sidebar */}
        <div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Modo de Negocio</span>
          </div>
          <IndustrySwitcher currentIndustry={userIndustry} variant="compact" className="w-full justify-between" />
        </div>

        {userEmail && (
          <div className="px-4 py-2 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cuenta</p>
              {isAdmin ? (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded">
                  ADMIN
                </span>
              ) : planInfo?.isTrial ? (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded">
                  MES GRATIS ({planInfo.trialDaysLeft}d)
                </span>
              ) : planInfo?.isMonthlyPro ? (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded">
                  PRO ACTIVO
                </span>
              ) : planInfo?.isHardwareActive ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                  1 AÑO ACTIVO
                </span>
              ) : null}
            </div>
            <p className="text-xs font-semibold text-gray-800 truncate mt-0.5">{userEmail}</p>
          </div>
        )}
        
        <nav className="flex-1 px-3.5 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                  active 
                    ? 'bg-black text-white shadow-xs font-bold' 
                    : item.adminOnly
                    ? 'text-purple-700 bg-purple-50/70 hover:bg-purple-100 font-bold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : item.adminOnly ? 'text-purple-600' : item.accent ? 'text-yellow-600' : 'text-gray-500'}`} />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                    active ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-3.5 border-t border-gray-200 mt-auto space-y-1">
          <Link
            href="/"
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition"
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
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* 4. BARRA DE ACCIONES RÁPIDAS INFERIOR MÓVIL (Adaptada por industria) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {/* Renderizado dinámico de los 4 accesos rápidos según el giro del negocio o hardware */}
        {allowedBottomBar.map((btn) => {
          const Icon = getBottomIcon(btn.icon)
          const active = isActive(btn.href)
          return (
            <Link 
              key={btn.href}
              href={btn.href}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
                active ? 'text-black font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5 truncate max-w-[64px]">{btn.name}</span>
            </Link>
          )
        })}

        {/* Botón 5: Menú completo / Drawer */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-gray-500 hover:text-gray-900 transition cursor-pointer"
        >
          <MenuIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">Más</span>
        </button>
      </nav>
    </>
  )
}
