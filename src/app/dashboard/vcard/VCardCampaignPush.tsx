'use client'

import { useState } from 'react'
import { 
  BellRing, 
  Megaphone, 
  Send, 
  AlertCircle, 
  Check, 
  Clock, 
  ExternalLink 
} from 'lucide-react'
import { sendVCardCampaignPush } from './actions'

interface VCardCampaignPushProps {
  vcard: any
  messages?: any[]
}

export default function VCardCampaignPush({ vcard, messages = [] }: VCardCampaignPushProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
    needsApiEnable?: boolean
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    setLoading(true)
    setFeedback(null)

    const formData = new FormData()
    formData.append('vcard_id', vcard.id)
    formData.append('title', title)
    formData.append('body', body)

    try {
      const res = await sendVCardCampaignPush(formData)
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || '¡Notificación enviada con éxito!'
        })
        setTitle('')
        setBody('')
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
            Envía avisos, promociones o actualizaciones a la pantalla de bloqueo de todos los que guardaron tu tarjeta digital en su Google Wallet. Sin costo de SMS ni WhatsApp.
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
                placeholder="Ej. ¡Nuevo horario de atención / 15% OFF!"
                className="w-full rounded-xl border border-purple-400/40 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">
                Destinatarios
              </label>
              <div className="w-full rounded-xl border border-purple-400/20 bg-black/30 px-3.5 py-2.5 text-xs text-purple-300 flex items-center justify-between">
                <span>Contactos con tu tarjeta en Google Wallet</span>
                <span className="font-bold text-white bg-purple-600/60 px-2 py-0.5 rounded-lg">Pase activo</span>
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
              placeholder="Ej. Te recuerdo que a partir de esta semana estamos atendiendo en nuestra nueva sede. ¡Reserva tu cita hoy!"
              className="w-full rounded-xl border border-purple-400/40 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
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
        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-purple-200/70 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Última notificación: <b>"{messages[0].title}"</b> ({new Date(messages[0].created_at).toLocaleDateString('es-ES')})
          </span>
          <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-md font-mono text-emerald-300">
            {messages.length} enviada(s)
          </span>
        </div>
      )}
    </div>
  )
}
