'use client'

import { useState } from 'react'
import { 
  BellRing, 
  Megaphone, 
  Send, 
  AlertCircle, 
  Check, 
  Clock, 
  ExternalLink,
  Link2,
  Sparkles,
  Building2,
  Tag,
  Briefcase,
  Gift,
  ArrowUpRight
} from 'lucide-react'
import { sendVCardCampaignPush } from './actions'

interface VCardCampaignPushProps {
  vcard: any
  messages?: any[]
}

const VCARD_TEMPLATES = [
  {
    icon: Building2,
    badge: 'Inmobiliaria',
    title: '🏡 Nueva Propiedad en Exclusiva',
    body: 'Acabamos de publicar una nueva propiedad con excelente ubicación y plusvalía. Mira fotos, precio y agenda tu visita.',
    actionLabel: 'Ver Propiedad / Dossier',
    sampleUrl: 'https://'
  },
  {
    icon: Tag,
    badge: 'Liquidación / Oferta',
    title: '🔥 Liquidación Especial de Inventario',
    body: 'Aprovecha ofertas exclusivas por tiempo limitado en equipos y artículos seleccionados. ¡Pide el tuyo antes de que se agoten!',
    actionLabel: 'Comprar / Consultar Stock',
    sampleUrl: 'https://wa.me/'
  },
  {
    icon: Briefcase,
    badge: 'Profesional / Citas',
    title: '📅 Nuevas Citas Disponibles',
    body: 'Abrimos nuevos turnos de asesoría y atención personalizada para esta semana. Reserva tu espacio directamente aquí.',
    actionLabel: 'Agendar Cita Ahora',
    sampleUrl: 'https://'
  },
  {
    icon: Gift,
    badge: 'Promoción',
    title: '🎁 Beneficio Exclusivo para Contactos',
    body: 'Por tener mi tarjeta de contacto guardada en tu Google Wallet, tienes un 15% de descuento en tu próximo servicio.',
    actionLabel: 'Reclamar Descuento',
    sampleUrl: 'https://'
  }
]

export default function VCardCampaignPush({ vcard, messages = [] }: VCardCampaignPushProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [actionUrl, setActionUrl] = useState('')
  const [actionLabel, setActionLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
    needsApiEnable?: boolean
  } | null>(null)

  const handleApplyTemplate = (tpl: typeof VCARD_TEMPLATES[0]) => {
    setTitle(tpl.title)
    setBody(tpl.body)
    setActionLabel(tpl.actionLabel)
    if (!actionUrl) {
      setActionUrl(tpl.sampleUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    setLoading(true)
    setFeedback(null)

    const formData = new FormData()
    formData.append('vcard_id', vcard.id)
    formData.append('title', title)
    formData.append('body', body)
    if (actionUrl.trim()) {
      formData.append('action_url', actionUrl.trim())
    }
    if (actionLabel.trim()) {
      formData.append('action_label', actionLabel.trim())
    }

    try {
      const res = await sendVCardCampaignPush(formData)
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || '¡Notificación enviada con éxito!'
        })
        setTitle('')
        setBody('')
        setActionUrl('')
        setActionLabel('')
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Ocurrió un error al enviar.',
          needsApiEnable: res.needsApiEnable
        })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error de conexión.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-6 rounded-2xl shadow-lg border border-purple-500/20 relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-purple-400/30">
            <BellRing className="w-3.5 h-3.5" /> Google Wallet Push Marketing
          </div>
          <h3 className="font-extrabold text-xl sm:text-2xl text-white">
            Notificaciones a Billeteras de tus Contactos
          </h3>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-xl">
            Envía avisos de propiedades, liquidaciones o citas con enlaces directos a la pantalla de bloqueo de quienes guardaron tu tarjeta digital. Sin costo de SMS ni WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalOpen(!modalOpen)
            setFeedback(null)
          }}
          className="bg-white text-purple-950 hover:bg-purple-50 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
        >
          <Megaphone className="w-4 h-4 text-purple-700" />
          <span>{modalOpen ? 'Cerrar Formulario' : 'Crear Notificación Push'}</span>
        </button>
      </div>

      {/* Formulario Desplegable */}
      {modalOpen && (
        <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 relative z-10">
          {/* Plantillas Rápidas */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Plantillas rápidas con ventaja comercial:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VCARD_TEMPLATES.map((tpl, idx) => {
                const Icon = tpl.icon
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-2.5 rounded-xl border border-purple-400/25 bg-black/40 hover:bg-purple-500/20 text-left transition text-xs flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 group-hover:text-white">
                      <Icon className="w-3.5 h-3.5 text-purple-400 group-hover:text-amber-300" />
                      <span>{tpl.badge}</span>
                    </div>
                    <div className="text-[11px] text-white/80 line-clamp-1 mt-1 font-medium">
                      {tpl.title.replace(/^[^\s]+\s/, '')}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">
                Título del Mensaje (máx. 50 caracteres) *
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. 🏡 Nueva Propiedad en Exclusiva"
                className="w-full rounded-xl border border-purple-400/40 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">
                Destinatarios
              </label>
              <div className="w-full rounded-xl border border-purple-400/20 bg-black/30 px-3.5 py-2.5 text-xs text-purple-300 flex items-center justify-between">
                <span>Contactos con tu tarjeta en Google Wallet</span>
                <span className="font-bold text-white bg-purple-600/60 px-2 py-0.5 rounded-lg">Pases activos</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-200 mb-1">
              Contenido del Mensaje *
            </label>
            <textarea
              required
              rows={2}
              maxLength={200}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ej. Acabamos de publicar una nueva propiedad con excelente plusvalía. Mira fotos, precio y agenda tu visita."
              className="w-full rounded-xl border border-purple-400/40 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Enlace de Acción Interactivo */}
          <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-400/30 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-200">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enlace Directo de Acción (Opcional - WhatsApp, Tienda o Ficha Web)</span>
            </div>
            <p className="text-[11px] text-purple-300/80">
              Google Wallet convertirá este enlace en un botón interactivo dentro de la notificación para que tus clientes puedan comprar o consultar en 1 clic.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                  URL / Enlace de Destino
                </label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://wa.me/593... o https://inmobiliaria.com/casa-123"
                  className="w-full rounded-xl border border-purple-400/30 bg-black/50 px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                  Texto del Botón / Acción (CTA)
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  placeholder="Ej. Ver Propiedad, Comprar Ahora, Chatear"
                  className="w-full rounded-xl border border-purple-400/30 bg-black/50 px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl text-xs ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200' 
                : 'bg-rose-500/20 border border-rose-400/40 text-rose-200'
            }`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{feedback.message}</p>
                  {feedback.needsApiEnable && (
                    <div className="mt-2 text-[11px] text-white space-y-1">
                      <p>
                        Tu cuenta de Google Cloud necesita tener habilitada la <b>Google Wallet API</b>.
                      </p>
                      <a
                        href="https://console.developers.google.com/apis/api/walletobjects.googleapis.com/overview?project=1009146761390"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-white text-black font-extrabold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition mt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Habilitar Google Wallet API en 1 Clic
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-xs font-bold text-purple-300 hover:text-white px-4 py-2 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Despachando...' : 'Enviar Notificación Push Ahora'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Historial Reciente */}
      {messages && messages.length > 0 && !modalOpen && (
        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-purple-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" /> 
            <span>Última notificación: <b>"{messages[0].title}"</b> ({new Date(messages[0].created_at).toLocaleDateString('es-ES')})</span>
            {messages[0].action_url && (
              <a 
                href={messages[0].action_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-cyan-300 hover:text-white inline-flex items-center gap-0.5 underline ml-1"
              >
                {messages[0].action_label || 'Enlace'} <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
          <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-md font-mono text-emerald-300 shrink-0 self-start sm:self-auto">
            {messages.length} enviada(s)
          </span>
        </div>
      )}
    </div>
  )
}
