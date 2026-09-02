import Link from 'next/link'
import { 
  Smartphone, 
  Star, 
  Coffee, 
  Scissors, 
  Gift, 
  Users, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Calendar, 
  MessageCircle, 
  Lock, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      id: 'appointments',
      badge: 'Citas & Salones',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Scissors,
      iconColor: 'text-emerald-600 bg-emerald-100',
      title: 'Agendas & Reservas con Especialistas',
      description: 'Permite a tus clientes reservar turnos online las 24 horas. Asignación inteligente de personal, portal móvil para especialistas protegido con PIN y bloqueo de horarios automático.',
      highlights: [
        'Reserva en tiempo real por especialista o servicio',
        'Portal móvil para colaboradores con PIN de 4 dígitos',
        'Extensión de tiempo en vivo (+15m, +30m) para servicios extra',
        'Escudo de reputación: las bajas calificaciones se tratan en privado'
      ],
      linkText: 'Ver solución para salones y clínicas',
      href: '/register'
    },
    {
      id: 'menus',
      badge: 'Restaurantes & Bares',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Coffee,
      iconColor: 'text-amber-600 bg-amber-100',
      title: 'Menús Digitales & Pedidos a WhatsApp',
      description: 'Digitaliza tu carta gastronómica con fotos en alta definición, filtros de alérgenos y comandas directas desde la mesa a tu número de WhatsApp.',
      highlights: [
        'Comandas identificadas por Mesa (#Mesa QR)',
        'Plato del Día destacado que expira automáticamente',
        'Filtros por categorías (entradas, bebidas, carnes, postres)',
        'Cambia precios y disponibilidad al instante sin reimprimir papel'
      ],
      linkText: 'Crear menú digital interactivo',
      href: '/register'
    },
    {
      id: 'loyalty',
      badge: 'Fidelización',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Gift,
      iconColor: 'text-purple-600 bg-purple-100',
      title: 'Tarjeta de Sellos & Recompensas Digitales',
      description: 'Sustituye las tarjetas de cartón que se pierden por una tarjeta de fidelización digital en el teléfono del cliente con sellos acumulativos por visita.',
      highlights: [
        'Sellado ultrarrápido con PIN antifraude del cajero',
        'Premios y beneficios configurables (ej. 5º corte o café gratis)',
        'Compatible con cualquier smartphone sin descargar apps',
        'Notificaciones y seguimiento de clientes recurrentes'
      ],
      linkText: 'Aumentar retención de clientes',
      href: '/register'
    },
    {
      id: 'reputation',
      badge: 'Google Reviews',
      badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      icon: Star,
      iconColor: 'text-yellow-600 bg-yellow-100',
      title: 'Reseñas Google & Escudo de Reputación',
      description: 'Potencia las opiniones de 5 estrellas en tu perfil de Google Maps con tecnología Tap-to-Rate NFC & QR, desviando quejas a un buzón privado para resolverlas antes de que dañen tu imagen.',
      highlights: [
        '1 Toque NFC o escaneo QR para abrir Google Reviews',
        'Filtro inteligente: 5★ van a Google, 1-3★ van a gerencia',
        'Botón directo de WhatsApp para contactar y disculparse',
        'Aumenta tu posición y visibilidad en búsquedas locales'
      ],
      linkText: 'Blindar reputación online',
      href: '/register'
    },
    {
      id: 'vcards',
      badge: 'Identidad Digital',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Smartphone,
      iconColor: 'text-blue-600 bg-blue-100',
      title: 'vCards Digitales & Perfiles Interactivos',
      description: 'Comparte tu tarjeta de presentación profesional, catálogo, redes sociales y formas de pago con un toque en tu tarjeta NFC o escaneo de código QR.',
      highlights: [
        'Descarga de contacto directo a la agenda del móvil (.vcf)',
        'Enlaces a WhatsApp, Instagram, LinkedIn, Ubicación y Web',
        'Intercambio bidireccional: captura los datos de la otra persona',
        'Temas visuales modernos con colores y tipografías a tu medida'
      ],
      linkText: 'Diseñar mi vCard profesional',
      href: '/register'
    },
    {
      id: 'crm',
      badge: 'Base de Datos',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Users,
      iconColor: 'text-indigo-600 bg-indigo-100',
      title: 'CRM Centralizado & Contactos Permanentes',
      description: 'Todos los clientes que agendan citas, piden en el menú, acumulan sellos o intercambian contactos quedan registrados de forma permanente en tu base de datos.',
      highlights: [
        'Los contactos no se pierden aunque se cancelen las citas',
        'Etiquetas inteligentes por origen (Cita, Menú, Sellos, vCard)',
        'Envío de mensajes personalizados por WhatsApp en 1 clic',
        'Exportación completa a Excel (CSV) para campañas'
      ],
      linkText: 'Gestionar clientes en el CRM',
      href: '/register'
    }
  ]

  const industries = [
    { name: 'Barberías & Salones', emoji: '💈', desc: 'Reservas por barbero, tiempo extra en vivo y sellos de fidelización.' },
    { name: 'Restaurantes & Bares', emoji: '🍽️', desc: 'Menú digital con comandas a WhatsApp y pedidos por número de mesa.' },
    { name: 'Spas & Estética', emoji: '💆‍♀️', desc: 'Catálogo de masajes, agendamiento de turnos y opiniones privadas.' },
    { name: 'Clínicas & Médicos', emoji: '🩺', desc: 'Citas ordenadas, perfil profesional y reseñas de pacientes verificadas.' },
    { name: 'Profesionales & Negocios', emoji: '💼', desc: 'vCards NFC, intercambio de contactos y captura de prospectos.' }
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
      {/* 1. NAVEGACIÓN SUPERIOR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="flex items-center justify-between px-4 sm:px-6 py-3.5 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center font-black text-xl shadow-xs">
              O
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">OmniTag</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-600">
            <a href="#funciones" className="hover:text-black transition">Funcionalidades</a>
            <a href="#soluciones" className="hover:text-black transition">Sectores</a>
            <a href="#como-funciona" className="hover:text-black transition">¿Cómo Funciona?</a>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link 
              href="/login" 
              className="text-xs sm:text-sm text-gray-700 hover:text-black font-bold px-3 py-2 rounded-xl transition"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="bg-black text-white text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl font-extrabold hover:bg-gray-800 transition shadow-xs flex items-center gap-1.5"
            >
              <span>Empezar Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. HERO SECTION */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 border-b border-gray-100">
          {/* Fondo decorativo con gradientes suaves */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/40 via-blue-50/50 to-amber-50/40 rounded-full blur-3xl opacity-70" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/10 text-gray-900 text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>PLATAFORMA INTEGRAL PARA COMERCIOS & PROFESIONALES</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-950 leading-[1.1]">
              Tu negocio en el mundo físico, <br />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                conectado al mundo digital.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Todo en un solo lugar: <b>Citas con especialistas</b>, <b>Menús QR para restaurantes</b>, <b>Club de Sellos de Fidelización</b>, <b>Reseñas Google</b> y <b>vCards NFC</b> con CRM integrado.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl cursor-pointer"
              >
                <span>Crear Cuenta Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#funciones" 
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base transition text-center"
              >
                Explorar Módulos
              </a>
            </div>

            {/* Micro métricas / Ventajas */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <p className="text-xs text-gray-500 font-bold">Tecnología</p>
                <p className="text-sm font-black text-gray-900">QR + NFC Contactless</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <p className="text-xs text-gray-500 font-bold">Disponibilidad</p>
                <p className="text-sm font-black text-gray-900">24/7 En Tiempo Real</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <p className="text-xs text-gray-500 font-bold">Integración</p>
                <p className="text-sm font-black text-gray-900">Directo a WhatsApp</p>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-gray-200 shadow-2xs">
                <p className="text-xs text-gray-500 font-bold">Clientes</p>
                <p className="text-sm font-black text-gray-900">CRM Permanente</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECCIÓN DE FUNCIONES PRINCIPALES (GRID DETALLADO) */}
        <section id="funciones" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16 sm:mb-20">
            <h2 className="text-xs font-black uppercase tracking-wider text-purple-700">Módulos Potentes</h2>
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
              Diseñado para digitalizar y multiplicar tus ventas
            </h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Cada herramienta funciona de forma independiente o perfectamente integrada para ofrecer a tus clientes una experiencia moderna sin fricción.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div 
                  key={f.id}
                  className="bg-white rounded-3xl p-7 border border-gray-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.iconColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${f.badgeColor}`}>
                        {f.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-extrabold text-gray-900 group-hover:text-black transition">
                        {f.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                        {f.description}
                      </p>
                    </div>

                    {/* Lista de características clave */}
                    <div className="pt-2 space-y-2 border-t border-gray-100">
                      {f.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <Link
                      href={f.href}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-black group-hover:text-purple-700 transition"
                    >
                      <span>{f.linkText}</span>
                      <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4. SECTORES & CASOS DE ÉXITO */}
        <section id="soluciones" className="py-20 bg-gray-50 border-y border-gray-200 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">Adaptado a tu Rubro</h2>
              <h3 className="text-2xl sm:text-4xl font-black text-gray-900">
                La solución exacta para tu tipo de negocio
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Sin configuraciones complejas. Elige lo que necesitas y comienza a operar hoy mismo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {industries.map((ind, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2 text-center sm:text-left">
                  <div className="text-3xl mb-2">{ind.emoji}</div>
                  <h4 className="font-extrabold text-sm text-gray-900">{ind.name}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. CÓMO FUNCIONA EN 3 PASOS */}
        <section id="como-funciona" className="py-20 sm:py-28 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-black uppercase tracking-wider text-purple-700">Simple & Rápido</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900">
              Operativo en menos de 5 minutos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto">
                1
              </div>
              <h4 className="font-extrabold text-base text-gray-900">Crea tu Perfil</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Registra tus servicios, menú o tarjeta de presentación en tu panel intuitivo con tus fotos y precios.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto">
                2
              </div>
              <h4 className="font-extrabold text-base text-gray-900">Comparte con QR o NFC</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Descarga tus códigos QR de alta resolución para mostradores o enlaza tu tarjeta física con tecnología NFC.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto">
                3
              </div>
              <h4 className="font-extrabold text-base text-gray-900">Recibe Clientes & Citas</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tus clientes reservan, acumulan sellos y ordenan en 1 toque directo a tu WhatsApp y CRM centralizado.
              </p>
            </div>
          </div>
        </section>

        {/* 6. BANNER FINAL DE LLAMADO A LA ACCIÓN */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-8 sm:p-14 rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" />

            <div className="relative space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white/10 text-purple-300 px-3 py-1 rounded-full border border-white/10">
                Pruébalo sin compromiso
              </span>
              <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Empieza a digitalizar tu negocio hoy mismo
              </h3>
              <p className="text-xs sm:text-base text-gray-300 max-w-lg mx-auto font-medium">
                Únete a barberías, salones, restaurantes y clínicas que ya están ahorrando tiempo y atrayendo más clientes con OmniTag.
              </p>
            </div>

            <div className="relative pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-black px-8 py-4 rounded-2xl text-sm sm:text-base transition shadow-xl cursor-pointer"
              >
                Comenzar Prueba Gratuita
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-2xl text-sm sm:text-base transition"
              >
                Ya tengo una cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">
              O
            </div>
            <span className="font-black text-lg text-gray-900">OmniTag</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Plataforma Segura • Infraestructura en la Nube de Alta Disponibilidad</span>
          </div>

          <p className="text-gray-400 text-xs font-medium">
            © {new Date().getFullYear()} OmniTag. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
