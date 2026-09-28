import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  FileText, 
  Mail, 
  Phone, 
  ArrowLeft, 
  CheckCircle2, 
  Users, 
  Gift, 
  Calendar, 
  Star, 
  Smartphone,
  Globe
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Políticas de Privacidad y Tratamiento de Datos | OmniTag',
  description: 'Conoce nuestras políticas de privacidad, protección de datos personales y términos de uso para el ecosistema de herramientas digitales de OmniTag.',
  openGraph: {
    title: 'Políticas de Privacidad | OmniTag',
    description: 'Protección de datos y privacidad en OmniTag y sus herramientas conectadas.',
    url: 'https://omnitag.site/privacidad',
    siteName: 'OmniTag',
    type: 'website'
  }
}

export default function PrivacyPolicyPage() {
  const lastUpdated = '25 de Septiembre de 2026'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-black selection:text-white">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="font-black text-xl tracking-tight text-gray-900">OmniTag</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-black hover:bg-gray-800 transition px-4 py-2 rounded-xl shadow-xs"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </header>

      {/* Cabecera Principal */}
      <section className="bg-gradient-to-b from-white via-gray-50 to-gray-100 border-b border-gray-200 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Documento Legal Oficial & Protección de Datos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
            Política de Privacidad y Tratamiento de Datos
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            En <b>OmniTag</b> nos tomamos con la máxima seriedad la confidencialidad, integridad y seguridad de la información tanto de los titulares de cuenta como de los clientes finales que interactúan con nuestras herramientas.
          </p>

          <p className="text-xs text-gray-400 font-semibold">
            Última actualización: <time dateTime="2026-09-25">{lastUpdated}</time>
          </p>
        </div>
      </section>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">

        {/* 1. Responsable del Tratamiento */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
              <Building2Icon />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sección 1</span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Identificación del Responsable del Tratamiento</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            La plataforma tecnológica <b>OmniTag</b> (disponible en <code className="bg-gray-100 px-2 py-0.5 rounded text-black font-semibold">https://omnitag.site</code>) es operada y administrada por <b>Nexoriama Tech</b>. A través de este portal se ofrecen servicios SaaS de tarjetas digitales (vCards), programas de lealtad, menús interactivos, reservas de turnos, gestión de reputación con placas NFC y conexión con monederos digitales como Google Wallet.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="font-bold text-gray-500 uppercase text-[10px]">Canal Oficial de Privacidad</span>
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-500" />
                <a href="mailto:soporte@nexoriama.com" className="hover:underline">soporte@nexoriama.com</a>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="font-bold text-gray-500 uppercase text-[10px]">Atención & Soporte WhatsApp</span>
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-500" />
                <a href="https://wa.me/50487724813" target="_blank" rel="noopener noreferrer" className="hover:underline">+504 8772-4813</a>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Información que Recopilamos por Herramienta */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sección 2</span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Datos Recopilados según cada Herramienta</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            OmniTag recopila exclusivamente los datos indispensables para operar cada servicio y brindar valor directo tanto a los negocios como a sus clientes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* A: Cuentas de Administrador */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-black font-extrabold text-sm">
                <Users className="w-4 h-4 text-purple-600" />
                <h3>1. Registro de Cuentas de Negocio y Profesionales</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nombre completo, correo electrónico, contraseña cifrada, tipo de cuenta (profesional o comercio), rubro/industria y cargo. Datos necesarios para la autenticación y personalización del panel de administración.
              </p>
            </div>

            {/* B: vCard & Leads */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-black font-extrabold text-sm">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <h3>2. vCard & Intercambio de Contactos (Leads)</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cuando un usuario interactúa con la tarjeta digital de un profesional y decide enviar sus datos, se almacena voluntariamente su <b>Nombre, WhatsApp/Teléfono y Correo Electrónico</b> para que el titular de la vCard pueda contactarlo.
              </p>
            </div>

            {/* C: Fidelización */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-black font-extrabold text-sm">
                <Gift className="w-4 h-4 text-emerald-600" />
                <h3>3. Club de Fidelización y Sellos Digitales</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Para acumular sellos de lealtad en un comercio, el cliente introduce su <b>Número de WhatsApp/Teléfono</b> y nombre opcional. Este dato actúa como llave única para resguardar su balance de visitas y evitar la pérdida de sus premios.
              </p>
            </div>

            {/* D: Ruleta de la Suerte */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-black font-extrabold text-sm">
                <SparklesIcon />
                <h3>4. Ruleta de Premios & Cupones Promocionales</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Al ganar un beneficio en la ruleta, el cliente ingresa su <b>Nombre y WhatsApp</b> para generar su código de cupón único y verificar las horas de validez y control antifraude de giros diarios.
              </p>
            </div>

            {/* E: Citas y Agendas */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-black font-extrabold text-sm">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h3>5. Agendas y Reservas de Turnos Online</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nombre del cliente, teléfono/WhatsApp, servicio elegido, especialista seleccionado, fecha, hora y notas adicionales para la correcta confirmación y atención de su turno en el establecimiento.
              </p>
            </div>

            {/* F: Placas NFC & Feedback */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-black font-extrabold text-sm">
                <Star className="w-4 h-4 text-yellow-600" />
                <h3>6. Reseñas y Buzón Privado de Feedback</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Las calificaciones de 4-5 estrellas son redirigidas a la ficha pública de Google Maps del negocio. En calificaciones menores, el cliente puede dejar un comentario de forma privada para que el comercio resuelva el problema internamente.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Finalidad del Tratamiento */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sección 3</span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Finalidad del Tratamiento de los Datos</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Los datos personales procesados en la plataforma tienen las siguientes finalidades explícitas:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><b>Prestación directa del servicio:</b> Emisión de tarjetas virtuales, registro de visitas en programas de lealtad, confirmación de citas y emisión de cupones.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><b>Comunicación negocio-cliente:</b> Permitir que el comercio o profesional atienda la solicitud, envíe recordatorios de turno o entregue premios canjeados.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><b>Integridad y prevención de fraude:</b> Evitar el abuso en giros continuos de ruletas, validar sellos legítimos mediante PIN autorizado del negocio y prevenir registros duplicados no autorizados.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><b>Soporte y actualizaciones técnicas:</b> Asistencia al cliente, mejoras de rendimiento y notificaciones esenciales sobre el estado de la cuenta.</span>
            </li>
          </ul>
        </div>

        {/* 4. Política de No Comercialización de Datos */}
        <div className="bg-linear-to-r from-gray-900 via-black to-gray-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-3 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Compromiso Cero Venta de Datos</span>
              <h2 className="text-lg sm:text-xl font-black text-white">Privacidad y Confidencialidad Absoluta</h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            <b>OmniTag NO vende, NO alquila y NO comercializa</b> bases de datos, correos electrónicos ni números de teléfono de usuarios ni de clientes finales a terceras partes, corredores de datos ni redes de publicidad invasiva. Los datos capturados por un negocio pertenecen exclusivamente a la relación entre ese negocio y su cliente.
          </p>
        </div>

        {/* 5. Google Wallet y Servicios de Terceros */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sección 4</span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Integración con Google Wallet y Servicios Conectados</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Cuando un usuario decide guardar una tarjeta de fidelización o vCard en <b>Google Wallet</b>, los identificadores necesarios del pase son transmitidos de forma cifrada mediante las APIs oficiales de Google. La información almacenada en el monedero digital del usuario se rige además por los 
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-black font-bold underline ml-1">
              Términos de Privacidad de Google
            </a>.
          </p>
        </div>

        {/* 6. Seguridad y Almacenamiento */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sección 5</span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Seguridad, Encriptación y Resguardo</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Implementamos medidas técnicas, administrativas y físicas rigurosas para proteger los datos frente a accesos no autorizados, pérdidas o alteraciones:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <p className="font-extrabold text-gray-900">Cifrado en Tránsito</p>
              <p className="text-gray-500">Todas las conexiones se realizan bajo protocolo seguro TLS / HTTPS con certificados SSL de grado bancario.</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <p className="font-extrabold text-gray-900">Aislamiento por Negocio</p>
              <p className="text-gray-500">Reglas estrictas de Row Level Security (RLS) en base de datos impiden que un negocio acceda a los datos de otro.</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <p className="font-extrabold text-gray-900">Contraseñas Cifradas</p>
              <p className="text-gray-500">Las credenciales se procesan con algoritmos irreversibles de hash criptográfico de Supabase Auth.</p>
            </div>
          </div>
        </div>

        {/* 7. Derechos del Usuario (ARCO) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sección 6</span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Tus Derechos: Acceso, Rectificación y Cancelación (ARCO)</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Todo usuario titular de cuenta o cliente final tiene el derecho indiscutible de:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <b>Acceder:</b> Conocer qué datos personales tenemos almacenados asociados a su número o cuenta.
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <b>Rectificar:</b> Solicitar la corrección o actualización de información errónea o desactualizada.
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <b>Cancelar / Suprimir:</b> Solicitar la eliminación total y definitiva de su número o cuenta de la base de datos.
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <b>Oposición / Revocación:</b> Revocar el consentimiento previamente otorgado para recibir comunicaciones.
            </div>
          </div>

          <p className="text-xs text-gray-500 pt-2">
            Para ejercer cualquiera de estos derechos, envía un correo a <a href="mailto:soporte@nexoriama.com" className="font-bold text-black underline">soporte@nexoriama.com</a> indicando tu número de teléfono o correo registrado, y procesaremos tu solicitud en un plazo máximo de 48 a 72 horas hábiles.
          </p>
        </div>

        {/* 8. Botón y Enlaces al pie */}
        <div className="text-center pt-6 space-y-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-extrabold px-8 py-4 rounded-2xl text-sm transition shadow-lg cursor-pointer"
          >
            <span>Entendido, volver al Registro</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>

          <div>
            <Link href="/" className="text-xs font-bold text-gray-500 hover:text-black hover:underline">
              Ir a la página principal de OmniTag
            </Link>
          </div>
        </div>

      </main>

      {/* Footer Legal */}
      <footer className="border-t border-gray-200 bg-white py-8 px-4 text-center text-xs text-gray-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} OmniTag por Nexoriama Tech. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-black hover:underline">Inicio</Link>
            <Link href="/login" className="hover:text-black hover:underline">Iniciar Sesión</Link>
            <Link href="/register" className="hover:text-black hover:underline">Registro</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Building2Icon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M10 11h2M10 15h2M14 11h2M14 15h2M6 7V3h12v4M18 11h2M18 15h2" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}
