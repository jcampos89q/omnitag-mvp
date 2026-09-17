import Link from 'next/link'
import Image from 'next/image'
import { 
  CreditCard, 
  Star, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  Radio, 
  QrCode, 
  Check, 
  ArrowRight, 
  HelpCircle, 
  Smartphone,
  Sparkles,
  ArrowLeft,
  Shield,
  Clock,
  ExternalLink
} from 'lucide-react'

export const metadata = {
  title: 'Tienda Oficial OmniTag | Tarjetas NFC & Placas de Reseñas Google',
  description: 'Adquiere tu Tarjeta Inteligente NFC y Placa en Vinil sobre PVC (altamente resistente) de Reseñas para Mostrador con 1 año de membresía PRO incluida. Envíos a toda Honduras.',
}

export default function TiendaPage() {
  const whatsappNumber = '50487724813'
  const whatsappDisplay = '+504 8772-4813'

  const cardOrderUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hola OmniTag, quiero ordenar la Tarjeta Inteligente NFC (Matte Black) por L. 1,200 con 1 año PRO incluido.'
  )}`

  const plateOrderUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hola OmniTag, quiero ordenar la Placa NFC para Reseñas de Google en Vinil sobre PVC (altamente resistente) por L. 1,200 con 1 año PRO incluido.'
  )}`

  const comboOrderUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hola OmniTag, quiero ordenar el Combo Dúo (Tarjeta NFC + Placa de Reseñas Google en Vinil sobre PVC) por L. 2,200 con 1 año PRO incluido.'
  )}`

  const generalWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hola OmniTag, tengo una consulta sobre los dispositivos físicos y tarjetas NFC.'
  )}`

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
      {/* 0. CINTILLO DE ENVÍO */}
      <div className="bg-gradient-to-r from-purple-800 via-slate-900 to-emerald-800 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
        <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>🚚 <b>Envíos rápidos a toda Honduras</b> • Todos los dispositivos incluyen <b>1 Año Completo PRO</b></span>
        <a 
          href={generalWhatsappUrl} 
          target="_blank" 
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1 underline font-black text-emerald-300 hover:text-white transition ml-2 shrink-0"
        >
          <span>Atención por WhatsApp</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* 1. NAVEGACIÓN DE LA TIENDA */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <nav className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Image
                src="/logo-light.png"
                alt="OmniTag"
                width={32}
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition group-hover:scale-105"
                priority
              />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-none">OmniTag</span>
                <span className="text-[10px] font-extrabold text-purple-600 tracking-wider uppercase">Tienda Oficial</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-600">
            <a href="#catalogo" className="hover:text-black transition">Catálogo de Productos</a>
            <a href="#como-funciona" className="hover:text-black transition">¿Cómo Funciona?</a>
            <a href="#faq" className="hover:text-black transition">Preguntas Frecuentes</a>
            <Link href="/" className="text-purple-700 hover:text-purple-900 transition flex items-center gap-1">
              <span>Plataforma Web</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link 
              href="/"
              className="text-xs font-bold text-gray-600 hover:text-black px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition hidden sm:inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la Web</span>
            </Link>
            <a 
              href={generalWhatsappUrl} 
              target="_blank" 
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl font-extrabold transition shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </nav>
      </header>

      {/* 2. HERO PRINCIPAL DE LA TIENDA */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-900 text-xs font-black tracking-wide">
              <Radio className="w-3.5 h-3.5 text-purple-700 animate-pulse" />
              <span>HARDWARE & PRODUCTOS FÍSICOS OMNITAG</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-950 leading-[1.1]">
              Dispositivos Inteligentes NFC <br />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                para Profesionales y Comercios
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Conecta tu presencia física con tus herramientas digitales. Sin cuotas mensuales: cada tarjeta o placa viene programada con <b>1 año completo de suscripción PRO incluido</b>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <a 
                href="#catalogo" 
                className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl cursor-pointer"
              >
                <span>Ver Catálogo & Precios</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href={generalWhatsappUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-6 py-4 rounded-2xl font-black text-sm sm:text-base transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>

            {/* Micro métricas de garantía */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
                <p className="text-[11px] text-gray-500 font-bold">Chip NFC</p>
                <p className="text-xs sm:text-sm font-black text-gray-900">NTAG Universal (iOS / Android)</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
                <p className="text-[11px] text-gray-500 font-bold">Software PRO</p>
                <p className="text-xs sm:text-sm font-black text-emerald-700">365 Días Incluidos (Sin cuotas)</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
                <p className="text-[11px] text-gray-500 font-bold">Cobertura</p>
                <p className="text-xs sm:text-sm font-black text-gray-900">Envíos a toda Honduras</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
                <p className="text-[11px] text-gray-500 font-bold">Atención Directa</p>
                <p className="text-xs sm:text-sm font-black text-purple-700">Chat por WhatsApp</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECCIÓN DEL CATÁLOGO DE PRODUCTOS */}
        <section id="catalogo" className="py-20 sm:py-28 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block">
                PRODUCTOS DISPONIBLES
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Elige tu Dispositivo OmniTag
              </h2>
              <p className="text-sm sm:text-base text-gray-400 font-medium">
                Haz tu pedido directo a nuestro canal de WhatsApp y coordinamos tu entrega de forma inmediata.
              </p>
            </div>

            {/* Grid de Productos: Tarjeta y Placa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              
              {/* PRODUCTO 1: TARJETA INTELIGENTE NFC (MATTE BLACK) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm relative group hover:border-purple-500/50 transition duration-300">
                <div className="space-y-6">
                  {/* Badge & Título */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Formato Bolsillo • CR80 (85.6 x 54 mm)
                    </span>
                    <span className="text-xs font-extrabold text-gray-400 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" /> Envío a toda Honduras
                    </span>
                  </div>

                  {/* MAQUETA VISUAL EXACTA: TARJETA NEGRO MATE (Según diseño de lote PDF) */}
                  <div className="w-full max-w-sm mx-auto aspect-[85.6/54] bg-[#0f0f12] rounded-2xl border border-zinc-700/80 p-4 sm:p-5 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    {/* Acento violeta superior */}
                    <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-fuchsia-500" />

                    {/* Fila Superior: Isotipo y Marca */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/logo-dark.png"
                          alt="OmniTag"
                          width={28}
                          height={28}
                          className="w-7 h-7 object-contain"
                        />
                        <div>
                          <div className="text-xs font-black tracking-wider leading-none text-white">OMNITAG</div>
                          <div className="text-[7px] font-bold text-gray-400 tracking-widest mt-0.5">SMART BUSINESS CARD</div>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-purple-300 bg-purple-950/80 border border-purple-700/50 px-1.5 py-0.5 rounded">
                        NTAG215
                      </span>
                    </div>

                    {/* Fila Central / Inferior: NFC Contactless y QR enmarcado */}
                    <div className="flex items-end justify-between gap-3 pt-2">
                      <div className="space-y-1">
                        <div className="text-[9px] sm:text-[10px] font-black text-purple-400 font-mono tracking-wider flex items-center gap-1">
                          <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
                          <span>((( NFC CONTACTLESS )))</span>
                        </div>
                        <p className="text-[7px] sm:text-[8px] text-gray-400 leading-tight">
                          Acerca tu teléfono a la tarjeta <br />
                          o escanea el código QR directo
                        </p>
                      </div>

                      {/* Marco Blanco con Código QR HD */}
                      <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-lg text-center">
                        <div className="w-14 h-14 bg-black rounded-lg p-1 flex items-center justify-center relative">
                          <QrCode className="w-full h-full text-white" />
                          <div className="absolute inset-0 m-auto w-3 h-3 bg-white rounded-xs flex items-center justify-center">
                            <span className="text-[7px] font-black text-black">O</span>
                          </div>
                        </div>
                        <div className="text-[7px] font-mono font-bold text-gray-800 mt-0.5">
                          OT-CARD-001
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nombre y Precio */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">
                      Tarjeta Inteligente NFC <span className="text-purple-400 font-semibold text-lg">(Matte Black Edition)</span>
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-white">L. 1,200</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Pago Único • 1 Año PRO Incluido
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Sustituye tus tarjetas tradicionales de papel por una credencial inteligente para siempre. Al acercarla a cualquier teléfono móvil, se abre al instante tu perfil profesional interactivo (vCard) con botón directo para guardar tus datos en los contactos del cliente.
                    </p>
                  </div>

                  {/* Lista de Especificaciones */}
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><b>1 Año Completo de Membresía PRO</b> (valorado en L. 6,600 / año)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><b>Chip NFC NTAG integrado</b> con lectura ultra-rápida (iOS & Android)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><b>Código QR Dinámico HD</b> impreso: cambia tus datos en la nube sin reimprimir</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><b>Acabado PVC Matte Black</b> resistente al agua, polvo y fricción diaria</span>
                    </div>
                  </div>
                </div>

                {/* Botón Pedido a WhatsApp */}
                <div className="pt-6">
                  <a
                    href={cardOrderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Pedir Tarjeta NFC por WhatsApp (L. 1,200)</span>
                  </a>
                  <p className="text-[11px] text-gray-500 text-center mt-2">
                    Atención personalizada y despacho inmediato
                  </p>
                </div>
              </div>

              {/* PRODUCTO 2: PLACA DE RESEÑAS DE GOOGLE (VINIL SOBRE PVC) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm relative group hover:border-amber-500/50 transition duration-300">
                <div className="space-y-6">
                  {/* Badge & Título */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Mostrador & Mesas • Vinil sobre PVC (120 x 126 mm)
                    </span>
                    <span className="text-xs font-extrabold text-gray-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-400" /> Escudo 5★ Activo
                    </span>
                  </div>

                  {/* MAQUETA VISUAL: STAND EN VINIL SOBRE PVC (ALTAMENTE RESISTENTE) */}
                  <div className="w-full max-w-[260px] mx-auto aspect-[1/1.05] bg-white rounded-2xl border-2 border-slate-200 p-4 text-slate-900 shadow-2xl relative flex flex-col justify-between items-center text-center">
                    {/* Borde sutil interior */}
                    <div className="absolute inset-1 rounded-xl border border-slate-100 pointer-events-none" />

                    {/* 5 Estrellas Doradas */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="text-[11px] font-black tracking-tight text-gray-900 uppercase">
                        CALIFÍCANOS EN GOOGLE
                      </div>
                      <div className="text-[6.5px] text-slate-500 font-medium leading-none">
                        Tu opinión nos ayuda a seguir creciendo
                      </div>
                    </div>

                    {/* QR Mostrador Enmarcado */}
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl shadow-inner my-1.5 w-24 h-24 flex flex-col items-center justify-center relative">
                      <QrCode className="w-full h-full text-slate-900" />
                      <div className="absolute inset-0 m-auto w-4 h-4 bg-white rounded-xs shadow-xs flex items-center justify-center">
                        <span className="text-[9px] font-black text-black">G</span>
                      </div>
                    </div>

                    {/* Badge Contactless y Pie de Placa */}
                    <div className="space-y-1 w-full">
                      <div className="bg-amber-100 text-amber-900 font-bold text-[7.5px] font-mono py-0.5 px-2 rounded-full inline-block border border-amber-300">
                        ((( CONTACTLESS NFC )))
                      </div>
                      <div className="text-[7.5px] font-extrabold text-slate-900 leading-none">
                        Acerca tu teléfono celular aquí
                      </div>
                      <div className="text-[6.5px] text-slate-400 leading-none">
                        o escanea con la cámara de tu teléfono
                      </div>

                      {/* Footer de marca de la placa */}
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[6px] text-slate-400 w-full px-1">
                        <span className="font-mono font-bold">OT-REV-001</span>
                        <div className="flex items-center gap-1">
                          <Image
                            src="/logo-light.png"
                            alt="OmniTag"
                            width={10}
                            height={10}
                            className="w-2.5 h-2.5 object-contain"
                          />
                          <span className="font-bold">OMNITAG</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nombre y Precio */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">
                      Placa NFC en Vinil sobre PVC <span className="text-amber-400 font-semibold text-lg">(Google Reviews 5★)</span>
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-white">L. 1,200</span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Pago Único • 1 Año PRO Incluido
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Multiplica tus opiniones 5 estrellas en Google Maps. Fabricada con vinil de alta definición montado sobre una sólida placa de PVC (altamente resistente al uso continuo, caídas y humedad). Cuando tu cliente acerca su teléfono en mostrador o mesa, se abre de inmediato la ventana para calificar con 5 estrellas en Google Maps.
                    </p>
                  </div>

                  {/* Lista de Especificaciones */}
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><b>Escudo Anti-Reseñas Negativas</b>: quejas de 1 a 3★ van a tu buzón privado</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><b>1 Año Completo de Membresía PRO</b> incluido sin cobros mensuales</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><b>Chip NFC NTAG integrado</b> de alta sensibilidad y toque instantáneo</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><b>Vinil premium sobre base de PVC</b>: altamente resistente a caídas, polvo y humedad diaria</span>
                    </div>
                  </div>
                </div>

                {/* Botón Pedido a WhatsApp */}
                <div className="pt-6">
                  <a
                    href={plateOrderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Pedir Placa de Reseñas por WhatsApp (L. 1,200)</span>
                  </a>
                  <p className="text-[11px] text-gray-500 text-center mt-2">
                    Atención personalizada y despacho inmediato
                  </p>
                </div>
              </div>

            </div>

            {/* COMBO DÚO: BANNER DE OFERTA ESPECIAL */}
            <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left max-w-xl">
                <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-black px-2.5 py-1 rounded-full inline-block">
                  COMBO DÚO NEGOCIO COMPLETO
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  1 Tarjeta Inteligente NFC + 1 Placa de Reseñas Google
                </h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  Lleva la credencial personal para tus reuniones de negocios y el stand para el mostrador de tu local comercial. <b>Incluye 1 año de servicio PRO completo para ambos dispositivos</b>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 text-center md:text-right">
                <div>
                  <div className="text-xs text-gray-400 line-through">Precio Regular: L. 2,400</div>
                  <div className="text-3xl sm:text-4xl font-black text-white">L. 2,200</div>
                  <div className="text-[11px] font-bold text-emerald-400">Ahorras L. 200 al instante</div>
                </div>

                <a
                  href={comboOrderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3.5 px-6 rounded-2xl bg-white text-black hover:bg-gray-100 font-black text-sm flex items-center justify-center gap-2 shadow-xl transition hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Ordenar Combo por WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* 4. SECCIÓN CÓMO FUNCIONA EL PROCESO */}
        <section id="como-funciona" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-black uppercase tracking-wider text-purple-700">Proceso Simple y Seguro</h2>
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
              ¿Cómo ordenar y activar tu dispositivo?
            </h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Solo toma 3 pasos rápidos desde tu teléfono celular.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto">
                1
              </div>
              <h4 className="font-extrabold text-base text-gray-900">Escríbenos a WhatsApp</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Envíanos un mensaje por WhatsApp indicando si deseas la Tarjeta NFC, la Placa de Reseñas o el Combo Dúo.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto">
                2
              </div>
              <h4 className="font-extrabold text-base text-gray-900">Programación & Envío</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Programamos tu chip NFC con tu código único y despachamos tu paquete con entrega rápida y segura en cualquier ciudad de Honduras.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto">
                3
              </div>
              <h4 className="font-extrabold text-base text-gray-900">1 Año PRO Activado</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Recibes tu dispositivo físico listo para usar, con acceso total a tu panel de control, enlaces y estadísticas por 365 días sin mensualidades.
              </p>
            </div>
          </div>
        </section>

        {/* 5. PREGUNTAS FRECUENTES (FAQ) */}
        <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Resolvemos tus Dudas</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-gray-950">
                Preguntas Frecuentes sobre el Hardware
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                  ¿Funcionan las tarjetas y placas con cualquier teléfono?
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Sí. Prácticamente el 95% de los teléfonos inteligentes actuales (iPhone y Android) cuentan con sensor NFC activo de fábrica. Además, todos nuestros dispositivos cuentan con un <b>código QR dinámico impreso en alta definición</b>, de modo que cualquier cliente que prefiera abrir su cámara puede escanearlo al instante.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                  ¿Qué ocurre si cambio de número telefónico, redes sociales o menú?
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  No necesitas comprar otra tarjeta ni reimprimir nada. La tecnología OmniTag es <b>100% dinámica en la nube</b>: inicias sesión en tu panel web desde tu teléfono o computadora, modificas tus enlaces o datos de contacto, y tu tarjeta o placa física reflejará los cambios de manera instantánea.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                  ¿Cómo funciona el Escudo de Reseñas de Google?
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Cuando tu cliente acerca su teléfono a la placa de mostrador, el sistema le solicita una valoración previa: si selecciona <b>5 estrellas</b>, se abre automáticamente la ficha de Google Maps para que publique su comentario positivo. Si selecciona <b>1 a 3 estrellas</b>, se abre un formulario privado de atención para que te explique su queja o desacuerdo directamente en tu panel, permitiéndote solucionar el inconveniente antes de que dañe la reputación pública de tu negocio.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                  ¿Cuáles son los métodos de pago aceptados?
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Aceptamos depósitos y transferencias bancarias directas en los principales bancos de Honduras (Banco Atlántida, BAC Credomatic, Ficohsa, Banpaís y Banhcafé). Al contactarnos por WhatsApp te proporcionamos los números de cuenta para formalizar tu orden.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. BANNER FINAL DIRECTO A WHATSAPP */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-950 via-slate-900 to-black text-white p-8 sm:p-14 rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden border border-emerald-500/30">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-600/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />

            <div className="relative space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                Atención Personalizada
              </span>
              <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                ¿Listo para modernizar la atención de tu negocio?
              </h3>
              <p className="text-xs sm:text-base text-gray-300 max-w-lg mx-auto font-medium">
                Contáctanos directamente en nuestro canal oficial de WhatsApp para tomar tu orden o resolver cualquier duda.
              </p>
            </div>

            <div className="relative pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a 
                href={generalWhatsappUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl text-sm sm:text-base transition shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 fill-black" />
                <span>Ordenar por WhatsApp</span>
              </a>
              <Link 
                href="/" 
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-2xl text-sm sm:text-base transition"
              >
                Explorar Plataforma Web
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href={generalWhatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-110 active:scale-95 group"
        title="Contactar a WhatsApp Oficial"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="hidden sm:inline font-black text-xs pr-1">WhatsApp Oficial</span>
      </a>

      {/* 8. FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={26}
              height={26}
              className="w-6 h-6 object-contain"
            />
            <span className="font-black text-base text-gray-900">OmniTag Hardware</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hardware Oficial • Chips Certificados NTAG • Soporte Técnico en Honduras</span>
          </div>

          <p className="text-gray-400 text-xs font-medium">
            © {new Date().getFullYear()} OmniTag. Soporte y envíos a toda Honduras.
          </p>
        </div>
      </footer>
    </div>
  )
}
