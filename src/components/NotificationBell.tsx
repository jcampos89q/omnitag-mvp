'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Sparkles, AlertCircle, Info, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'info' | 'alert'
  link?: string | null
  is_read: boolean
  created_at: string
}

export default function NotificationBell({ 
  userId,
  position = 'auto'
}: { 
  userId?: string
  position?: 'auto' | 'sidebar' | 'topbar'
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(15)

      if (data) setNotifications(data as AppNotification[])
    }

    fetchNotifications()
  }, [userId, supabase])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return

    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
  }

  const dropdownPositionClass = position === 'sidebar'
    ? 'left-0 mt-2'
    : position === 'topbar'
    ? 'right-0 mt-2'
    : 'right-0 md:left-0 md:right-auto mt-2'

  return (
    <div className="relative">
      {/* Botón de Campana */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && unreadCount > 0) {
            markAllAsRead()
          }
        }}
        className="relative p-2 text-gray-600 hover:text-black rounded-xl hover:bg-gray-100 transition cursor-pointer"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menú Desplegable de Notificaciones */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/5 md:bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className={`absolute ${dropdownPositionClass} w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left`}>
            <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900">Centro de Notificaciones</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Actividad reciente en tu negocio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-xl hover:bg-gray-200/50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 text-xs">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-1.5">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-gray-700 text-xs">No tienes notificaciones pendientes</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">Te avisaremos al instante sobre nuevas citas, reseñas y estados de cuenta.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3.5 space-y-1.5 hover:bg-gray-50/80 transition ${
                      !n.is_read ? 'bg-purple-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-gray-900 text-xs leading-snug">{n.title}</p>
                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                        {new Date(n.created_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed">{n.message}</p>

                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:underline pt-0.5"
                      >
                        <span>Ver detalles</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
