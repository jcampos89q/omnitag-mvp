export type IndustryId = 
  | 'restaurant' 
  | 'beauty' 
  | 'health' 
  | 'retail' 
  | 'professional' 
  | 'general'

export interface IndustryConfig {
  id: IndustryId
  name: string
  shortName: string
  category: 'business' | 'professional' | 'all'
  description: string
  badgeText: string
  badgeClass: string
  accentColor: string
  tagline: string
  // Nombres y textos adaptados por ruta
  routeLabels: Record<string, {
    name?: string
    badge?: string
    shortDesc?: string
  }>
  // Rutas recomendadas en orden de importancia
  priorityHrefs: string[]
  // Rutas que tienen menor relevancia (se agrupan o pliegan)
  secondaryHrefs: string[]
  // Barra móvil inferior de 4 accesos rápidos
  bottomBar: {
    name: string
    href: string
    icon: 'home' | 'menu' | 'star' | 'scissors' | 'stethoscope' | 'vcard' | 'leads' | 'gift' | 'loyalty' | 'ruleta' | 'analytics' | 'shop'
  }[]
  // Accesos rápidos recomendados para el inicio
  featuredCards: {
    href: string
    title: string
    description: string
    badge?: string
    badgeColor?: string
    actionText: string
    icon: 'coffee' | 'scissors' | 'stethoscope' | 'shopping' | 'user' | 'star' | 'sparkles' | 'gift' | 'disc' | 'qrcode' | 'mapPin' | 'users' | 'alert'
  }[]
  tips: string[]
}

export const INDUSTRIES: Record<IndustryId, IndustryConfig> = {
  restaurant: {
    id: 'restaurant',
    name: 'Restaurantes, Bares & Cafeterías',
    shortName: 'Gastronomía',
    category: 'business',
    description: 'Menús con fotos y pedidos por WhatsApp, placas de reseñas en mesa y fidelización de comensales.',
    badgeText: 'Gastronomía & Bares',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    accentColor: '#d97706',
    tagline: 'Tu menú en cada mesa, pedidos por WhatsApp y comensales que siempre regresan.',
    routeLabels: {
      '/dashboard/menus': {
        name: 'Menú & Comandas WhatsApp',
        badge: 'Mesas',
        shortDesc: 'Carta digital con fotos, alérgenos y pedidos directos a tu WhatsApp.'
      },
      '/dashboard/devices': {
        name: 'Reseñas en Mesas & NFC',
        badge: 'Google 5★',
        shortDesc: 'Placas NFC y QRs de mesa para que los clientes califiquen al terminar de comer.'
      },
      '/dashboard/loyalty': {
        name: 'Club de Comensales (Sellos)',
        badge: 'Fidelidad',
        shortDesc: 'Regala un plato o bebida tras completar 5 o 10 visitas al restaurante.'
      },
      '/dashboard/ruleta': {
        name: 'Ruleta de Premios & Postres',
        badge: 'Juego',
        shortDesc: 'Gamificación en mesa: los comensales juegan por bebidas o postres de cortesía.'
      },
      '/dashboard/gift-cards': {
        name: 'Tarjetas de Regalo & Cenas',
        badge: 'Ventas',
        shortDesc: 'Certificados de consumo para cumpleaños y cenas especiales.'
      },
      '/dashboard/qr-studio': {
        name: 'Estudio QR de Mesa',
        badge: 'Imprimir',
        shortDesc: 'Genera e imprime stickers y marcos de mesa en alta resolución.'
      },
      '/dashboard/google-business': {
        name: 'Google Maps & SEO Local',
        badge: 'IA',
        shortDesc: 'Atrae comensales hambrientos que buscan restaurantes cerca.'
      },
      '/dashboard/feedback': {
        name: 'Buzón Anti-Quejas',
        shortDesc: 'Atiende inconformidades de comida o servicio antes de que lleguen a Google.'
      },
      '/dashboard/leads': {
        name: 'Base de Clientes (CRM)',
        shortDesc: 'Lista de comensales para enviar promociones de fin de semana.'
      }
    },
    priorityHrefs: [
      '/dashboard',
      '/dashboard/menus',
      '/dashboard/devices',
      '/dashboard/google-business',
      '/dashboard/loyalty',
      '/dashboard/ruleta',
      '/dashboard/gift-cards',
      '/dashboard/qr-studio',
      '/dashboard/feedback',
      '/dashboard/leads'
    ],
    secondaryHrefs: [
      '/dashboard/appointments',
      '/dashboard/vcard',
      '/dashboard/patients'
    ],
    bottomBar: [
      { name: 'Inicio', href: '/dashboard', icon: 'home' },
      { name: 'Menú', href: '/dashboard/menus', icon: 'menu' },
      { name: 'Reseñas', href: '/dashboard/devices', icon: 'star' },
      { name: 'Fidelidad', href: '/dashboard/loyalty', icon: 'loyalty' }
    ],
    featuredCards: [
      {
        href: '/dashboard/menus',
        title: 'Menú Digital & Comandas WhatsApp',
        description: 'Actualiza platos, precios del día y recibe pedidos ordenados por número de mesa.',
        actionText: 'Gestionar Menú',
        icon: 'coffee',
        badge: 'Principal',
        badgeColor: 'bg-amber-100 text-amber-800'
      },
      {
        href: '/dashboard/devices',
        title: 'Reseñas en Mesas con NFC',
        description: 'Coloca placas Tap-to-Rate en tus mesas con escudo anti-quejas para subir tu puntaje en Google Maps.',
        actionText: 'Configurar Placas',
        icon: 'star',
        badge: '5 Estrellas',
        badgeColor: 'bg-yellow-100 text-yellow-800'
      },
      {
        href: '/dashboard/loyalty',
        title: 'Club de Fidelización Gastronómica',
        description: 'Sella la tarjeta digital de tus clientes en cada almuerzo o cena y fidelízalos para siempre.',
        actionText: 'Ver Miembros',
        icon: 'sparkles',
        badge: 'Retención',
        badgeColor: 'bg-purple-100 text-purple-800'
      },
      {
        href: '/dashboard/ruleta',
        title: 'Ruleta de Premios para Mesas',
        description: 'Premia a los comensales con café gratis o descuentos sorpresa para aumentar su consumo.',
        actionText: 'Activar Premios',
        icon: 'disc'
      },
      {
        href: '/dashboard/qr-studio',
        title: 'Estudio de QRs para Mesas',
        description: 'Descarga artes de alta calidad listos para imprenta o acrílicos de mesa con el logo de tu restaurante.',
        actionText: 'Diseñar QRs',
        icon: 'qrcode'
      },
      {
        href: '/dashboard/google-business',
        title: 'Google Maps & SEO Local',
        description: 'Auditoría en 1 clic de tu perfil de Google Business y respuestas a reseñas asistidas con IA.',
        actionText: 'Auditar Perfil',
        icon: 'mapPin'
      }
    ],
    tips: [
      'Coloca un QR en cada mesa: los comensales prefieren ver fotos de los platillos antes de pedir.',
      'Configura una recompensa en la tarjeta de fidelidad: por ejemplo, "Postre gratis en tu 5ta visita".',
      'Activa el escudo anti-quejas para enterarte de cualquier inconformidad con la comida antes de que se publique en Google.'
    ]
  },

  beauty: {
    id: 'beauty',
    name: 'Salones, Barberías & Spas',
    shortName: 'Belleza & Citas',
    category: 'business',
    description: 'Reserva de turnos online, portal móvil con PIN para estilistas/barberos y fidelización por visitas.',
    badgeText: 'Salones & Barberías',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    accentColor: '#9333ea',
    tagline: 'Agenda llena sin llamadas, especialistas organizados y clientes leales cada mes.',
    routeLabels: {
      '/dashboard/appointments': {
        name: 'Agendas & Especialistas',
        badge: 'Turnos',
        shortDesc: 'Reserva de turnos online 24/7, portal móvil con PIN para estilistas y bloqueo de horarios.'
      },
      '/dashboard/devices': {
        name: 'Reseñas Google en Espejos',
        badge: 'Google 5★',
        shortDesc: 'Placas NFC en cada estación o en recepción para captar 5 estrellas al terminar el corte o servicio.'
      },
      '/dashboard/loyalty': {
        name: 'Fidelización (Sello por Visita)',
        badge: 'Club VIP',
        shortDesc: 'Ofrece el 5to corte o tratamiento gratis para asegurar que regresen cada 2 o 3 semanas.'
      },
      '/dashboard/gift-cards': {
        name: 'Tarjetas de Regalo de Belleza',
        badge: 'Ventas',
        shortDesc: 'Vende certificados de regalo para cambios de look, masajes o tratamientos.'
      },
      '/dashboard/ruleta': {
        name: 'Ruleta de Descuentos & Mimos',
        badge: 'Juego',
        shortDesc: 'Premia a tus clientas con tratamientos capilares o descuentos en su próxima cita.'
      },
      '/dashboard/vcard': {
        name: 'vCard del Salón / Estilistas',
        badge: 'Perfil',
        shortDesc: 'Perfil digital para redes sociales y WhatsApp con botón de agendar directo.'
      },
      '/dashboard/leads': {
        name: 'Directorio de Clientela',
        shortDesc: 'Base de datos con teléfonos de tus clientes para avisos de promociones y recordatorios.'
      },
      '/dashboard/google-business': {
        name: 'Google Maps & SEO Local',
        badge: 'IA',
        shortDesc: 'Posiciona tu salón o barbería en los primeros resultados locales de Google.'
      },
      '/dashboard/qr-studio': {
        name: 'Estudio QR para Espejos',
        shortDesc: 'QRs elegantes para pegar en los espejos de cada barbero o estación de maquillaje.'
      }
    },
    priorityHrefs: [
      '/dashboard',
      '/dashboard/appointments',
      '/dashboard/devices',
      '/dashboard/loyalty',
      '/dashboard/gift-cards',
      '/dashboard/ruleta',
      '/dashboard/vcard',
      '/dashboard/leads',
      '/dashboard/google-business',
      '/dashboard/qr-studio'
    ],
    secondaryHrefs: [
      '/dashboard/menus',
      '/dashboard/patients'
    ],
    bottomBar: [
      { name: 'Inicio', href: '/dashboard', icon: 'home' },
      { name: 'Citas', href: '/dashboard/appointments', icon: 'scissors' },
      { name: 'Fidelidad', href: '/dashboard/loyalty', icon: 'loyalty' },
      { name: 'Reseñas', href: '/dashboard/devices', icon: 'star' }
    ],
    featuredCards: [
      {
        href: '/dashboard/appointments',
        title: 'Agendas, Servicios & Especialistas',
        description: 'Tus clientes reservan su horario y barbero/estilista favorito en segundos. Incluye portal con PIN.',
        actionText: 'Abrir Agenda',
        icon: 'scissors',
        badge: 'Core',
        badgeColor: 'bg-purple-100 text-purple-800'
      },
      {
        href: '/dashboard/devices',
        title: 'Placas de Reseñas en Estaciones',
        description: 'Invita a los clientes a tocar con su móvil el espejo para dejar su reseña 5 estrellas al terminar.',
        actionText: 'Ver Placas',
        icon: 'star',
        badge: '5 Estrellas',
        badgeColor: 'bg-amber-100 text-amber-800'
      },
      {
        href: '/dashboard/loyalty',
        title: 'Club de Fidelización (Sellos por Corte)',
        description: 'Recompensa a tus clientes leales. Funciona en iPhone y Android e incluso con Google Wallet.',
        actionText: 'Gestionar Sellos',
        icon: 'sparkles',
        badge: 'Retención',
        badgeColor: 'bg-pink-100 text-pink-800'
      },
      {
        href: '/dashboard/gift-cards',
        title: 'Tarjetas de Regalo para Tratamientos',
        description: 'Permite que compren certificados de regalo para consentir a una amiga, pareja o familiar.',
        actionText: 'Crear Gift Cards',
        icon: 'gift'
      },
      {
        href: '/dashboard/vcard',
        title: 'Perfil Digital & Link en Bio',
        description: 'Pon tu perfil en el Instagram de tu salón para que agenden turnos directamente.',
        actionText: 'Ver Perfil',
        icon: 'user'
      },
      {
        href: '/dashboard/google-business',
        title: 'Google Maps Local',
        description: 'Destaca en búsquedas como "mejor barbería cerca de mí" o "salón de belleza en mi zona".',
        actionText: 'Auditar',
        icon: 'mapPin'
      }
    ],
    tips: [
      'Asigna a cada especialista su PIN para que consulte su agenda desde su propio teléfono sin tocar la caja.',
      'Coloca una tarjeta NFC cerca del espejo: cuando el cliente se ve terminado y feliz, es el momento óptimo para pedir la reseña.',
      'Usa las tarjetas de regalo en fechas especiales (Día de la Madre, Navidad, San Valentín).'
    ]
  },

  health: {
    id: 'health',
    name: 'Salud, Médicos & Clínicas',
    shortName: 'Salud & Clínicas',
    category: 'business',
    description: 'Expediente clínico electrónico (ECE), citas médicas, recetas, cobros de consultas y reputación.',
    badgeText: 'Salud & Clínicas',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accentColor: '#059669',
    tagline: 'Expediente clínico completo, citas sin esperas y reputación médica profesional.',
    routeLabels: {
      '/dashboard/patients': {
        name: 'Pacientes & Expediente (ECE)',
        badge: 'Clínico',
        shortDesc: 'Historial clínico, diagnósticos, recetas, alergias, tipo de sangre y pagos de consultas.'
      },
      '/dashboard/appointments': {
        name: 'Citas Médicas & Doctores',
        badge: 'Turnos',
        shortDesc: 'Gestión de consultas presenciales o virtuales, horarios y especialistas médicos.'
      },
      '/dashboard/devices': {
        name: 'Reputación Médica en Google',
        badge: 'Google 5★',
        shortDesc: 'Captura de testimonios y valoraciones en la sala de espera o consultorio.'
      },
      '/dashboard/feedback': {
        name: 'Buzón de Atención al Paciente',
        badge: 'Privado',
        shortDesc: 'Canal ético y confidencial para que el paciente exprese dudas o inconformidades.'
      },
      '/dashboard/vcard': {
        name: 'vCard Médico Profesional',
        badge: 'Médico',
        shortDesc: 'Tarjeta digital con especialidad, colegiación médica, clínica y botón directo de urgencias.'
      },
      '/dashboard/leads': {
        name: 'Directorio de Prospectos',
        shortDesc: 'Pacientes potenciales que solicitaron información por WhatsApp o web.'
      },
      '/dashboard/google-business': {
        name: 'Google Maps & Consultorio',
        badge: 'SEO',
        shortDesc: 'Optimiza la presencia de tu clínica o consultorio dental en Google.'
      },
      '/dashboard/qr-studio': {
        name: 'Estudio QR Clínico',
        shortDesc: 'QRs para folletos de salud, recetas digitales o sala de espera.'
      }
    },
    priorityHrefs: [
      '/dashboard',
      '/dashboard/patients',
      '/dashboard/appointments',
      '/dashboard/devices',
      '/dashboard/feedback',
      '/dashboard/vcard',
      '/dashboard/google-business',
      '/dashboard/leads',
      '/dashboard/qr-studio'
    ],
    secondaryHrefs: [
      '/dashboard/menus',
      '/dashboard/loyalty',
      '/dashboard/ruleta',
      '/dashboard/gift-cards'
    ],
    bottomBar: [
      { name: 'Inicio', href: '/dashboard', icon: 'home' },
      { name: 'Pacientes', href: '/dashboard/patients', icon: 'stethoscope' },
      { name: 'Citas', href: '/dashboard/appointments', icon: 'scissors' },
      { name: 'Reputación', href: '/dashboard/devices', icon: 'star' }
    ],
    featuredCards: [
      {
        href: '/dashboard/patients',
        title: 'Expediente Clínico Electrónico (ECE)',
        description: 'Registra fichas de pacientes, antecedentes, diagnósticos médicos, recetas y cobros de consulta.',
        actionText: 'Ver Pacientes',
        icon: 'stethoscope',
        badge: 'Médico',
        badgeColor: 'bg-emerald-100 text-emerald-800'
      },
      {
        href: '/dashboard/appointments',
        title: 'Agenda de Citas & Consultas',
        description: 'Organiza los turnos de tus pacientes por consultorio, doctor o procedimiento médico.',
        actionText: 'Ver Citas',
        icon: 'scissors',
        badge: 'Turnos',
        badgeColor: 'bg-teal-100 text-teal-800'
      },
      {
        href: '/dashboard/devices',
        title: 'Reputación y Reseñas en Google',
        description: 'Placas Tap-to-Rate en recepción para que los pacientes califiquen su buena experiencia.',
        actionText: 'Gestionar Placa',
        icon: 'star',
        badge: '5 Estrellas',
        badgeColor: 'bg-amber-100 text-amber-800'
      },
      {
        href: '/dashboard/feedback',
        title: 'Buzón Privado de Pacientes',
        description: 'Protege tu reputación médica recibiendo observaciones de manera confidencial.',
        actionText: 'Ver Buzón',
        icon: 'alert'
      },
      {
        href: '/dashboard/vcard',
        title: 'Tarjeta Digital Profesional',
        description: 'Comparte tus datos de colegiatura, consultorios y especialidades por WhatsApp en 1 toque.',
        actionText: 'Mi vCard',
        icon: 'user'
      },
      {
        href: '/dashboard/google-business',
        title: 'Google Maps para Clínicas',
        description: 'Atrae a pacientes que buscan "dentista cerca", "pediatra" o tu especialidad médica en Google.',
        actionText: 'Auditar Perfil',
        icon: 'mapPin'
      }
    ],
    tips: [
      'Guarda el expediente médico antes de finalizar la consulta para llevar un historial detallado de recetas.',
      'El buzón privado te ayuda a resolver cualquier inconformidad de servicio en recepción sin afectar tu reputación pública.',
      'Tu vCard profesional es perfecta para enviarla a pacientes referidos por WhatsApp.'
    ]
  },

  retail: {
    id: 'retail',
    name: 'Tiendas, Boutiques & Retail',
    shortName: 'Comercio & Retail',
    category: 'business',
    description: 'Catálogo de productos con fotos y precios, pedidos por WhatsApp, club de puntos y gift cards.',
    badgeText: 'Tiendas & Retail',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    accentColor: '#2563eb',
    tagline: 'Tu catálogo online en WhatsApp, fidelización de compradores y reseñas en caja.',
    routeLabels: {
      '/dashboard/menus': {
        name: 'Catálogo de Productos',
        badge: 'Stock',
        shortDesc: 'Exhibe tus productos, colecciones, precios y recibe pedidos directamente a tu WhatsApp.'
      },
      '/dashboard/loyalty': {
        name: 'Club de Puntos & Compras',
        badge: 'Sellos',
        shortDesc: 'Otorga sellos por cada compra o monto gastado para que los clientes acumulen premios.'
      },
      '/dashboard/gift-cards': {
        name: 'Tarjetas de Regalo (Gift Cards)',
        badge: 'Ventas',
        shortDesc: 'Vende certificados de regalo para que tus clientes obsequien a sus amigos.'
      },
      '/dashboard/ruleta': {
        name: 'Ruleta de Descuentos en Tienda',
        badge: 'Juego',
        shortDesc: 'Haz que los compradores en tienda giren la ruleta para ganar descuentos y cupones.'
      },
      '/dashboard/devices': {
        name: 'Reseñas en Caja & NFC',
        badge: 'Google 5★',
        shortDesc: 'Placa en el mostrador de cobro para solicitar reseñas mientras pagan o empacan su compra.'
      },
      '/dashboard/google-business': {
        name: 'Google Maps & Tienda Física',
        badge: 'IA',
        shortDesc: 'Haz que los compradores de tu ciudad encuentren tu local en el mapa.'
      },
      '/dashboard/qr-studio': {
        name: 'Estudio QR para Vitrinas',
        shortDesc: 'QRs para vitrinas, etiquetas de ropa, bolsas y perchas con enlace directo al catálogo.'
      },
      '/dashboard/leads': {
        name: 'Directorio de Compradores (CRM)',
        shortDesc: 'Base de datos para enviar ofertas relámpago y lanzamientos de nuevas colecciones.'
      }
    },
    priorityHrefs: [
      '/dashboard',
      '/dashboard/menus',
      '/dashboard/loyalty',
      '/dashboard/gift-cards',
      '/dashboard/ruleta',
      '/dashboard/devices',
      '/dashboard/google-business',
      '/dashboard/qr-studio',
      '/dashboard/leads'
    ],
    secondaryHrefs: [
      '/dashboard/appointments',
      '/dashboard/vcard',
      '/dashboard/patients'
    ],
    bottomBar: [
      { name: 'Inicio', href: '/dashboard', icon: 'home' },
      { name: 'Catálogo', href: '/dashboard/menus', icon: 'shop' },
      { name: 'Fidelidad', href: '/dashboard/loyalty', icon: 'loyalty' },
      { name: 'Reseñas', href: '/dashboard/devices', icon: 'star' }
    ],
    featuredCards: [
      {
        href: '/dashboard/menus',
        title: 'Catálogo de Productos & WhatsApp',
        description: 'Sube fotos, variantes y precios para que tus clientes elijan y pidan directo a tu WhatsApp.',
        actionText: 'Ver Catálogo',
        icon: 'shopping',
        badge: 'Productos',
        badgeColor: 'bg-blue-100 text-blue-800'
      },
      {
        href: '/dashboard/loyalty',
        title: 'Club de Puntos por Compra',
        description: 'Premia la frecuencia de compra con descuentos o regalos exclusivos en su 5ta o 10ma visita.',
        actionText: 'Gestionar Club',
        icon: 'sparkles',
        badge: 'Sellos',
        badgeColor: 'bg-indigo-100 text-indigo-800'
      },
      {
        href: '/dashboard/gift-cards',
        title: 'Tarjetas de Regalo (Gift Cards)',
        description: 'La mejor herramienta para aumentar ventas en cumpleaños, San Valentín y temporada navideña.',
        actionText: 'Crear Gift Cards',
        icon: 'gift',
        badge: 'Monetización',
        badgeColor: 'bg-emerald-100 text-emerald-800'
      },
      {
        href: '/dashboard/devices',
        title: 'Placas Tap-to-Rate en Mostrador',
        description: 'Coloca la placa cerca de la terminal de pago: los clientes tocan con su móvil y califican con 5 estrellas.',
        actionText: 'Configurar Placa',
        icon: 'star'
      },
      {
        href: '/dashboard/ruleta',
        title: 'Ruleta de Descuentos en Tienda',
        description: 'Incentiva compras por impulso permitiendo a los clientes girar la ruleta antes de pagar.',
        actionText: 'Activar Ruleta',
        icon: 'disc'
      },
      {
        href: '/dashboard/qr-studio',
        title: 'Estudio QR para Vitrinas y Bolsas',
        description: 'Crea códigos de alta calidad para imprimir en bolsas de compra, vitrinas o etiquetas de precio.',
        actionText: 'Diseñar QRs',
        icon: 'qrcode'
      }
    ],
    tips: [
      'Imprime el QR de tu catálogo en las bolsas de tu tienda: así los clientes volverán a comprar desde casa por WhatsApp.',
      'Ofrece una tirada en la ruleta de premios a todo cliente que supere cierto monto de compra.',
      'Las tarjetas de regalo atraen a nuevos clientes que nunca antes habían visitado tu negocio.'
    ]
  },

  professional: {
    id: 'professional',
    name: 'Servicios Profesionales & B2B',
    shortName: 'Servicios B2B',
    category: 'professional',
    description: 'vCards interactivas, captación de leads directo al CRM, agendas de asesorías y reputación.',
    badgeText: 'Profesional & B2B',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    accentColor: '#4f46e5',
    tagline: 'Tu tarjeta de presentación inteligente que guarda contactos automáticamente en tu CRM.',
    routeLabels: {
      '/dashboard/vcard': {
        name: 'Mi vCard & Perfil Digital',
        badge: 'Tarjeta',
        shortDesc: 'Tarjeta digital con captura de leads, botón para guardar contacto y enlaces profesionales.'
      },
      '/dashboard/leads': {
        name: 'Contactos & CRM de Prospectos',
        badge: 'Leads',
        shortDesc: 'Prospectos capturados por tu vCard listos para seguimiento telefónico o WhatsApp.'
      },
      '/dashboard/appointments': {
        name: 'Agendas & Consultas',
        badge: 'Citas',
        shortDesc: 'Permite a tus clientes agendar reuniones de asesoría o consultoría en tu calendario.'
      },
      '/dashboard/devices': {
        name: 'Placa de Oficina & Tarjeta NFC',
        badge: 'NFC',
        shortDesc: 'Tarjeta física inteligente para eventos de networking o placa de recepción para tu despacho.'
      },
      '/dashboard/google-business': {
        name: 'Google Maps Corporativo',
        badge: 'SEO',
        shortDesc: 'Mejora el posicionamiento de tu despacho o consultoría en Google.'
      },
      '/dashboard/qr-studio': {
        name: 'Estudio QR Corporativo',
        shortDesc: 'QRs para imprimir en carpetas de propuestas, tarjetas de presentación y presentaciones.'
      }
    },
    priorityHrefs: [
      '/dashboard',
      '/dashboard/vcard',
      '/dashboard/leads',
      '/dashboard/appointments',
      '/dashboard/devices',
      '/dashboard/google-business',
      '/dashboard/qr-studio'
    ],
    secondaryHrefs: [
      '/dashboard/menus',
      '/dashboard/loyalty',
      '/dashboard/ruleta',
      '/dashboard/gift-cards',
      '/dashboard/patients'
    ],
    bottomBar: [
      { name: 'Inicio', href: '/dashboard', icon: 'home' },
      { name: 'vCard', href: '/dashboard/vcard', icon: 'vcard' },
      { name: 'Leads', href: '/dashboard/leads', icon: 'leads' },
      { name: 'Citas', href: '/dashboard/appointments', icon: 'scissors' }
    ],
    featuredCards: [
      {
        href: '/dashboard/vcard',
        title: 'Mi vCard Digital Interactiva',
        description: 'Comparte tu tarjeta con un toque NFC o QR. Tus prospectos pueden guardar tu contacto o enviarte sus datos.',
        actionText: 'Editar vCard',
        icon: 'user',
        badge: 'Networking',
        badgeColor: 'bg-indigo-100 text-indigo-800'
      },
      {
        href: '/dashboard/leads',
        title: 'CRM de Prospectos & Contactos',
        description: 'Todos los contactos que escanean tu tarjeta o llenan tu formulario se guardan automáticamente aquí.',
        actionText: 'Ver Prospectos',
        icon: 'users',
        badge: 'CRM',
        badgeColor: 'bg-emerald-100 text-emerald-800'
      },
      {
        href: '/dashboard/appointments',
        title: 'Agenda de Consultorías & Citas',
        description: 'Permite a tus clientes reservar horas de asesoría sin cruces de horarios ni llamadas innecesarias.',
        actionText: 'Configurar Agenda',
        icon: 'scissors'
      },
      {
        href: '/dashboard/devices',
        title: 'Tarjeta NFC & Placa de Despacho',
        description: 'Activa tu tarjeta inteligente para eventos de negocios y congresos, o tu placa de recepción.',
        actionText: 'Gestionar NFC',
        icon: 'star'
      },
      {
        href: '/dashboard/google-business',
        title: 'Google Maps para Despachos',
        description: 'Atrae clientes corporativos locales que busquen asesoría en tu ciudad.',
        actionText: 'Auditar',
        icon: 'mapPin'
      },
      {
        href: '/dashboard/qr-studio',
        title: 'Estudio QR Corporativo',
        description: 'Crea códigos elegantes con tu logotipo corporativo para tus propuestas comerciales.',
        actionText: 'Diseñar QRs',
        icon: 'qrcode'
      }
    ],
    tips: [
      'Agrega el enlace de tu vCard a la firma de tu correo electrónico corporativo.',
      'Activa la captura de datos en tu vCard para que cada persona que te conozca te deje su número antes de guardar tu contacto.',
      'Usa el portal de citas para cobrar consultas previas o coordinar reuniones sin intermediarios.'
    ]
  },

  general: {
    id: 'general',
    name: 'Suite Completa (Todas las Herramientas)',
    shortName: 'Modo General',
    category: 'all',
    description: 'Acceso a todas las herramientas sin filtros: menús, citas, vCards, fidelización, reseñas y más.',
    badgeText: 'Suite Completa',
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
    accentColor: '#111827',
    tagline: 'Todas las herramientas digitales activas y listas para potenciar tu presencia física y virtual.',
    routeLabels: {},
    priorityHrefs: [
      '/dashboard',
      '/dashboard/vcard',
      '/dashboard/qr-studio',
      '/dashboard/devices',
      '/dashboard/google-business',
      '/dashboard/menus',
      '/dashboard/appointments',
      '/dashboard/gift-cards',
      '/dashboard/loyalty',
      '/dashboard/ruleta',
      '/dashboard/leads',
      '/dashboard/feedback',
      '/dashboard/analytics'
    ],
    secondaryHrefs: [],
    bottomBar: [
      { name: 'Inicio', href: '/dashboard', icon: 'home' },
      { name: 'vCard', href: '/dashboard/vcard', icon: 'vcard' },
      { name: 'Menús', href: '/dashboard/menus', icon: 'menu' },
      { name: 'Reseñas', href: '/dashboard/devices', icon: 'star' }
    ],
    featuredCards: [
      {
        href: '/dashboard/vcard',
        title: 'Mi vCard Digital',
        description: 'Tarjeta de presentación virtual interactiva para guardar contactos en la agenda.',
        actionText: 'Gestionar vCard',
        icon: 'user'
      },
      {
        href: '/dashboard/qr-studio',
        title: 'Estudio QR (Impresión)',
        description: 'Diseña códigos QR con degradados estilo Instagram, logotipo central y marcos listos para imprenta.',
        actionText: 'Diseñar e Imprimir',
        icon: 'qrcode',
        badge: 'HD',
        badgeColor: 'bg-purple-100 text-purple-800'
      },
      {
        href: '/dashboard/devices',
        title: 'Reseñas Google & NFC',
        description: 'Placas Tap-to-Rate con escudo anti-quejas para multiplicar tus 5 estrellas en Google Maps.',
        actionText: 'Configurar Placas',
        icon: 'star'
      },
      {
        href: '/dashboard/google-business',
        title: 'Google Maps & SEO Local',
        description: 'Auditoría de perfil en 1-clic y respuestas inteligentes a reseñas con IA.',
        actionText: 'Auditar Perfil',
        icon: 'mapPin',
        badge: 'IA',
        badgeColor: 'bg-blue-100 text-blue-800'
      },
      {
        href: '/dashboard/menus',
        title: 'Menú & Catálogo Digital',
        description: 'Catálogo con fotos, categorías, precios y botón para recibir pedidos directos a WhatsApp.',
        actionText: 'Gestionar Menú',
        icon: 'coffee'
      },
      {
        href: '/dashboard/appointments',
        title: 'Agendas & Citas',
        description: 'Reserva de turnos para Barberías, Salones y Spas con especialistas y portal con PIN.',
        actionText: 'Gestionar Agenda',
        icon: 'scissors',
        badge: 'Nuevo',
        badgeColor: 'bg-emerald-100 text-emerald-800'
      },
      {
        href: '/dashboard/loyalty',
        title: 'Fidelización & Sellos',
        description: 'Tarjeta de sellos digitales para premiar a clientes frecuentes y aumentar visitas repetidas.',
        actionText: 'Club de Premios',
        icon: 'sparkles'
      },
      {
        href: '/dashboard/ruleta',
        title: 'Ruleta de Premios & Gamificación',
        description: 'Incentiva a tus clientes a dejar sus datos y volver a tu local con una ruleta de premios.',
        actionText: 'Crear Ruleta',
        icon: 'disc'
      },
      {
        href: '/dashboard/gift-cards',
        title: 'Tarjetas de Regalo (Gift Cards)',
        description: 'Vende tarjetas de regalo digitales canjeables en tu local comercial.',
        actionText: 'Crear Tarjetas',
        icon: 'gift'
      }
    ],
    tips: [
      'Puedes cambiar tu tipo de negocio en cualquier momento para ver herramientas especializadas para tu sector.',
      'Conecta tu cuenta con Google Business para auditar tu visibilidad local automáticamente.'
    ]
  }
}

/**
 * Normaliza cualquier valor previo de industry de la base de datos hacia los 6 giros estandarizados
 */
export function normalizeIndustry(raw?: string | null): IndustryId {
  if (!raw) return 'general'
  const val = raw.toLowerCase().trim()

  if (val === 'restaurant' || val === 'bar' || val === 'cafe' || val === 'food') return 'restaurant'
  if (val === 'beauty' || val === 'salon' || val === 'spa' || val === 'barbershop') return 'beauty'
  if (val === 'health' || val === 'clinic' || val === 'dental' || val === 'medical') return 'health'
  if (val === 'retail' || val === 'store' || val === 'shop' || val === 'commerce') return 'retail'
  if (
    val === 'professional' || 
    val === 'legal' || 
    val === 'lawyer' || 
    val === 'real_estate' || 
    val === 'finance' || 
    val === 'sales' || 
    val === 'tech' || 
    val === 'architecture' || 
    val === 'consulting'
  ) {
    return 'professional'
  }

  return 'general'
}

/**
 * Retorna la configuración del giro actual
 */
export function getIndustryConfig(rawIndustry?: string | null): IndustryConfig {
  const normalized = normalizeIndustry(rawIndustry)
  return INDUSTRIES[normalized] || INDUSTRIES.general
}
