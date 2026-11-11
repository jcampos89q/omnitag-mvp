'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
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
  UtensilsCrossed,
  Building2,
  LayoutGrid,
  ArrowLeft,
  X,
  Crown,
  ChevronRight
} from 'lucide-react'
import { logout } from '@/app/auth/actions'
import NotificationBell from './NotificationBell'
import { UserPlanInfo } from '@/lib/plans'
import { getIndustryConfig, normalizeIndustry } from '@/lib/industries'
import type { WhiteLabelBrandConfig } from '@/lib/whitelabel'

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: string
  accent?: boolean
  adminOnly?: boolean
  section?: string
  priority?: boolean
  colorClass?: string
  iconBgClass?: string
  description?: string
}

const baseNavItems: NavItem[] = [
  {
    name: 'Menú Principal',
    href: '/dashboard',
    icon: LayoutGrid,
    section: 'principal',
    colorClass: 'from-slate-50 to-white border-slate-200',
    iconBgClass: 'bg-slate-900 text-white',
    description: 'Cuadrícula visual de todas tus herramientas'
  },
  {
    name: 'Mi vCard Digital',
    href: '/dashboard/vcard',
    icon: UserCircle,
    section: 'creaciones',
    colorClass: 'from-violet-50/80 to-white border-violet-200',
    iconBgClass: 'bg-violet-600 text-white',
    description: 'Tarjeta de contacto digital y redes'
  },
  {
    name: 'Estudio QR (Imprimibles)',
    href: '/dashboard/qr-studio',
    icon: QrCode,
    badge: 'HD',
    section: 'creaciones',
    colorClass: 'from-indigo-50/80 to-white border-indigo-200',
    iconBgClass: 'bg-indigo-600 text-white',
    description: 'Diseña e imprime QRs para mesas o mostrador'
  },
  {
    name: 'Reseñas Google & NFC',
    href: '/dashboard/devices',
    icon: Star,
    section: 'creaciones',
    colorClass: 'from-amber-50/80 to-white border-amber-200',
    iconBgClass: 'bg-amber-500 text-white',
    description: 'Escudo 5★ y placas inteligentes NFC'
  },
  {
    name: 'Google Maps & SEO',
    href: '/dashboard/google-business',
    icon: MapPin,
    badge: 'IA',
    section: 'creaciones',
    colorClass: 'from-sky-50/80 to-white border-sky-200',
    iconBgClass: 'bg-sky-600 text-white',
    description: 'Posicionamiento local de tu negocio'
  },
  {
    name: 'Menú & Catálogo',
    href: '/dashboard/menus',
    icon: Coffee,
    section: 'creaciones',
    colorClass: 'from-orange-50/80 to-white border-orange-200',
    iconBgClass: 'bg-orange-500 text-white',
    description: 'Productos, platos, precios y turnos'
  },
  {
    name: 'Comandas & Ventas',
    href: '/dashboard/comandas',
    icon: UtensilsCrossed,
    badge: 'En Vivo',
    section: 'creaciones',
    colorClass: 'from-emerald-50/80 to-white border-emerald-200',
    iconBgClass: 'bg-emerald-600 text-white',
    description: 'Pedidos recibidos en tiempo real'
  },
  {
    name: 'Agendas & Citas',
    href: '/dashboard/appointments',
    icon: Scissors,
    badge: '24/7',
    section: 'creaciones',
    colorClass: 'from-pink-50/80 to-white border-pink-200',
    iconBgClass: 'bg-pink-600 text-white',
    description: 'Reservas por especialista y horarios'
  },
  {
    name: 'Tarjetas de Regalo',
    href: '/dashboard/gift-cards',
    icon: Gift,
    badge: 'VIP',
    section: 'creaciones',
    colorClass: 'from-purple-50/80 to-white border-purple-200',
    iconBgClass: 'bg-purple-600 text-white',
    description: 'Gift Cards con saldo y código QR'
  },
  {
    name: 'Fidelización & Sellos',
    href: '/dashboard/loyalty',
    icon: Sparkles,
    section: 'creaciones',
    colorClass: 'from-fuchsia-50/80 to-white border-fuchsia-200',
    iconBgClass: 'bg-fuchsia-600 text-white',
    description: 'Tarjetas de sellos para clientes frecuentes'
  },
  {
    name: 'Ruleta de Premios',
    href: '/dashboard/ruleta',
    icon: Disc,
    badge: 'Juegos',
    section: 'creaciones',
    colorClass: 'from-amber-50/80 to-white border-amber-200',
    iconBgClass: 'bg-amber-600 text-white',
    description: 'Ruleta y Raspa y Gana interactivo'
  },
  {
    name: 'Contactos (CRM)',
    href: '/dashboard/leads',
    icon: Users,
    section: 'gestion',
    colorClass: 'from-teal-50/80 to-white border-teal-200',
    iconBgClass: 'bg-teal-600 text-white',
    description: 'Base de datos de clientes capturados'
  },
  {
    name: 'Quejas Privadas',
    href: '/dashboard/feedback',
    icon: MessageSquareWarning,
    section: 'gestion',
    colorClass: 'from-rose-50/80 to-white border-rose-200',
    iconBgClass: 'bg-rose-600 text-white',
    description: 'Buzón retenido por el escudo 1-3★'
  },
  {
    name: 'Estadísticas',
    href: '/dashboard/analytics',
    icon: BarChart3,
    section: 'gestion',
    colorClass: 'from-blue-50/80 to-white border-blue-200',
    iconBgClass: 'bg-blue-600 text-white',
    description: 'Métricas de escaneos y visitas'
  },
  {
    name: 'Suscripción',
    href: '/dashboard/billing',
    icon: CreditCard,
    accent: true,
    section: 'cuenta',
    colorClass: 'from-emerald-50/80 to-white border-emerald-200',
    iconBgClass: 'bg-emerald-600 text-white',
    description: 'Estado de tu plan y métodos de pago'
  },
]

export default function DashboardNavbar({ 
  userEmail,
  userId,
  isAdmin = false,
  isRealSuperAdmin = false,
  isReseller = false,
  userIndustry = 'general',
  accountType = 'professional',
  planInfo,
  whiteLabelBrand,
  isWhiteLabeledClient = false,
}: { 
  userEmail?: string 
  userId?: string
  isAdmin?: boolean
  isRealSuperAdmin?: boolean
  isReseller?: boolean
  userIndustry?: string
  accountType?: string
  planInfo?: UserPlanInfo
  whiteLabelBrand?: WhiteLabelBrandConfig
  isWhiteLabeledClient?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isGridLauncherOpen, setIsGridLauncherOpen] = useState(false)

  const normalizedIndustry = normalizeIndustry(userIndustry)
  const industryConfig = getIndustryConfig(userIndustry)

  const brandName = (!isAdmin && whiteLabelBrand?.brand_name) ? whiteLabelBrand.brand_name : 'OmniTag'
  const brandLogo = (!isAdmin && whiteLabelBrand?.logo_url) ? whiteLabelBrand.logo_url : '/logo-light.png'
  const externalWebUrl = isWhiteLabeledClient ? (whiteLabelBrand?.website_url || '') : '/'

  // Filtrado de módulos disponibles según el rol y plan
  let filteredBaseItems: NavItem[] = []

  const canAccessProSuite = Boolean(isAdmin || planInfo?.canAccessProSuite)
  const hasNfc = Boolean(planInfo?.hasNfcCard || accountType === 'professional')
  const hasPlate = Boolean(planInfo?.hasReviewPlate || accountType === 'review_plate')

  if (canAccessProSuite) {
    filteredBaseItems = baseNavItems.filter(item => {
      if (industryConfig.hiddenHrefs && industryConfig.hiddenHrefs.includes(item.href)) {
        return false
      }
      if (normalizedIndustry !== 'health' && item.href === '/dashboard/patients') return false
      return true
    })

    if (normalizedIndustry === 'health') {
      filteredBaseItems.splice(1, 0, { 
        name: 'Pacientes & ECE', 
        href: '/dashboard/patients', 
        icon: Stethoscope, 
        badge: 'Médico', 
        section: 'creaciones',
        colorClass: 'from-cyan-50/80 to-white border-cyan-200',
        iconBgClass: 'bg-cyan-600 text-white',
        description: 'Expediente Clínico Electrónico e historial'
      })
    }
  } else {
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

  // Adaptar nombres e iconos contextuales según el giro
  filteredBaseItems = filteredBaseItems.map(item => {
    const override = industryConfig.routeLabels[item.href]
    let currentIcon = item.icon

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

  if (canAccessProSuite) {
    filteredBaseItems.sort((a, b) => {
      if (a.href === '/dashboard') return -1
      if (b.href === '/dashboard') return 1
      const indexA = industryConfig.priorityHrefs.indexOf(a.href)
      const indexB = industryConfig.priorityHrefs.indexOf(b.href)
      const posA = indexA === -1 ? 999 : indexA
      const posB = indexB === -1 ? 999 : indexB
      return posA - posB
    })
  }

  filteredBaseItems.push({
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: UserCircle,
    section: 'cuenta',
    colorClass: 'from-gray-50 to-white border-gray-200',
    iconBgClass: 'bg-gray-800 text-white',
    description: 'Ajustes de cuenta y contraseña'
  })

  const navItems: NavItem[] = isAdmin
    ? [
        {
          name: 'Suscriptores de Agencias',
          href: '/dashboard/reseller?view=master',
          icon: Crown,
          badge: 'Master',
          adminOnly: true,
          colorClass: 'from-purple-50 to-white border-purple-200',
          iconBgClass: 'bg-purple-600 text-white',
          description: 'Administra cupos, planes y vencimientos de Agencias'
        },
        {
          name: 'Mi Propia Agencia',
          href: '/dashboard/reseller?view=agency',
          icon: Building2,
          badge: 'Tu Agencia',
          adminOnly: true,
          colorClass: 'from-indigo-50 to-white border-indigo-200',
          iconBgClass: 'bg-indigo-600 text-white',
          description: 'Entra a tu cuenta de Agencia como un suscriptor más'
        },
        {
          name: 'Panel Global & Usuarios',
          href: '/dashboard/admin',
          icon: BarChart3,
          adminOnly: true,
          colorClass: 'from-blue-50 to-white border-blue-200',
          iconBgClass: 'bg-blue-600 text-white',
          description: 'Métricas globales, usuarios y transferencias'
        },
        {
          name: 'Lotes Tarjetas NFC',
          href: '/dashboard/admin?tab=nfc-batches',
          icon: CreditCard,
          adminOnly: true,
          colorClass: 'from-emerald-50 to-white border-emerald-200',
          iconBgClass: 'bg-emerald-600 text-white',
          description: 'Generación y control de tarjetas físicas NFC'
        },
        {
          name: 'Configuración Master',
          href: '/dashboard/settings',
          icon: UserCircle,
          colorClass: 'from-gray-50 to-white border-gray-200',
          iconBgClass: 'bg-gray-800 text-white',
          description: 'Preferencias de tu cuenta administradora'
        }
      ]
    : isReseller
    ? [
        {
          name: 'Clientes de Mi Agencia',
          href: '/dashboard/reseller?view=agency&tab=clients',
          icon: Users,
          badge: 'Partner',
          colorClass: 'from-indigo-50 to-white border-indigo-200',
          iconBgClass: 'bg-indigo-600 text-white',
          description: 'Da de alta negocios clientes, asigna su giro y controla su mes'
        },
        {
          name: 'Mi Marca Blanca & Precios',
          href: '/dashboard/reseller?view=agency&tab=brand',
          icon: Sparkles,
          badge: 'Marca Blanca',
          colorClass: 'from-purple-50 to-white border-purple-200',
          iconBgClass: 'bg-purple-600 text-white',
          description: 'Configura tu propio Logo, Nombre, Precios y Links de Cobro'
        },
        {
          name: 'Mi Suscripción Partner',
          href: '/dashboard/billing',
          icon: CreditCard,
          badge: 'Licencia',
          colorClass: 'from-emerald-50 to-white border-emerald-200',
          iconBgClass: 'bg-emerald-600 text-white',
          description: 'Estado de tu licencia de Agencia y ampliación de cupos'
        },
        {
          name: 'Configuración de Cuenta',
          href: '/dashboard/settings',
          icon: UserCircle,
          colorClass: 'from-gray-50 to-white border-gray-200',
          iconBgClass: 'bg-gray-800 text-white',
          description: 'Datos de acceso y seguridad de tu cuenta Partner'
        },
        ...(isRealSuperAdmin ? [
          { 
            name: 'Volver a Panel Master', 
            href: '/dashboard/reseller?view=master', 
            icon: Crown, 
            badge: 'Admin',
            adminOnly: true, 
            section: 'admin',
            colorClass: 'from-amber-50 to-white border-amber-200',
            iconBgClass: 'bg-amber-500 text-white',
            description: 'Regresar al control global de suscriptores de agencias'
          }
        ] : [])
      ]
    : [
        ...filteredBaseItems,
        ...(isRealSuperAdmin ? [
          { 
            name: 'Volver a Panel Master', 
            href: '/dashboard/reseller?view=master', 
            icon: Crown, 
            badge: 'Admin',
            adminOnly: true, 
            section: 'admin',
            colorClass: 'from-amber-50 to-white border-amber-200',
            iconBgClass: 'bg-amber-500 text-white',
            description: 'Regresar al control global de suscriptores de agencias'
          }
        ] : [])
      ]

  const isActive = (href: string) => {
    const cleanHref = href.split('?')[0]
    if (cleanHref === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(cleanHref)
  }

  const isMainGridHome = (isAdmin || isReseller)
    ? pathname === '/dashboard/reseller'
    : pathname === '/dashboard'

  const activeItem = navItems.find(item => isActive(item.href) && item.href !== '/dashboard')
  const homeUrl = isAdmin
    ? '/dashboard/reseller?view=master'
    : isReseller
    ? '/dashboard/reseller?view=agency'
    : '/dashboard'

  const handleNavItemClick = async (item: NavItem) => {
    setIsGridLauncherOpen(false)
    if (isRealSuperAdmin && item.href === '/dashboard/reseller?view=master' && !isAdmin) {
      const { switchAdminAgencyModeAction } = await import('@/app/dashboard/reseller/actions')
      await switchAdminAgencyModeAction(false)
    } else if (isRealSuperAdmin && item.href === '/dashboard/reseller?view=agency' && isAdmin) {
      const { switchAdminAgencyModeAction } = await import('@/app/dashboard/reseller/actions')
      await switchAdminAgencyModeAction(true)
    }
  }

  return (
    <>
      {/* 1. BARRA SUPERIOR LIMPIA SIN PANEL LATERAL (ESTILO APP VISUAL) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-3">
          {/* Izquierda: Logo + Botón Volver al Menú si está dentro de una herramienta */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <Link href={homeUrl} className="flex items-center gap-2 shrink-0 group">
              {brandLogo.startsWith('/') ? (
                <Image
                  src={brandLogo}
                  alt={brandName}
                  width={32}
                  height={32}
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 object-contain transition group-hover:scale-105"
                  priority
                />
              ) : (
                <img
                  src={brandLogo}
                  alt={brandName}
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 object-contain rounded"
                />
              )}
              <span className="text-base sm:text-xl font-black tracking-tight text-gray-950 truncate max-w-[130px] sm:max-w-none">
                {brandName}
              </span>
            </Link>

            {!isMainGridHome && (
              <>
                <span className="text-gray-300 hidden sm:inline">/</span>
                <Link
                  href={homeUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs transition shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al Menú</span>
                </Link>
              </>
            )}

            {activeItem && !isMainGridHome && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 truncate">
                {activeItem.name}
              </span>
            )}
          </div>

          {/* Derecha: Botón Cuadrícula de Herramientas + Notificaciones + Salir */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsGridLauncherOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Menú de Herramientas</span>
            </button>

            <NotificationBell userId={userId} position="topbar" />

            {externalWebUrl && (
              <Link
                href={externalWebUrl}
                className="hidden sm:inline-flex p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition"
                title="Ir a la página web pública"
              >
                <Globe className="w-4 h-4" />
              </Link>
            )}

            <form action={logout} className="hidden sm:block">
              <button
                type="submit"
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 2. MODAL VISUAL EN CUADRÍCULA DE APLICACIONES (APP LAUNCHER ESTILO CANVA / IPAD) */}
      {isGridLauncherOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Fondo desenfocado */}
          <div
            className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsGridLauncherOpen(false)}
          />

          {/* Contenedor de la Cuadrícula */}
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Cabecera del Launcher */}
            <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-gray-950">
                    {isAdmin ? 'Menú Master de Administración' : `Menú de Herramientas • ${brandName}`}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Selecciona cualquier herramienta para abrirla limpia en pantalla completa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGridLauncherOpen(false)}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuadrícula Responsiva de Iconos y Nombres */}
            <div className="p-5 sm:p-8 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavItemClick(item)}
                      className={`group relative rounded-2xl p-4 border bg-gradient-to-b transition-all duration-200 flex flex-col justify-between text-left hover:-translate-y-0.5 hover:shadow-md ${
                        active
                          ? 'ring-2 ring-purple-600 border-purple-600 from-purple-50/90 to-white shadow-sm'
                          : item.colorClass || 'from-gray-50/60 to-white border-gray-200/90 hover:border-gray-300'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${
                            item.iconBgClass || 'bg-gray-900 text-white'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/90 border border-gray-200 text-gray-800">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-black text-xs sm:text-sm text-gray-950 leading-snug group-hover:text-purple-700 transition">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-2 flex items-center justify-between text-[11px] font-bold text-gray-500 group-hover:text-purple-700">
                        <span>{active ? 'Abierto ahora' : 'Abrir'}</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Pie del Launcher con cuenta y botón de Cerrar Sesión */}
            <div className="px-5 sm:px-8 py-3.5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-600 font-medium truncate">
                Sesión iniciada como: <strong className="text-gray-900">{userEmail}</strong>
              </div>
              <div className="flex items-center gap-3">
                {externalWebUrl && (
                  <Link
                    href={externalWebUrl}
                    onClick={() => setIsGridLauncherOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-950 px-3 py-1.5 rounded-xl hover:bg-gray-200/60 transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Ver Web</span>
                  </Link>
                )}
                <form action={logout}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
