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

export default function NotificationBell({ userId }: { userId?: string }) {
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
        .limit(10)

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
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menú Desplegable de Notificaciones */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-purple-600" />
                <h4 className="font-extrabold text-xs text-gray-900">Notificaciones de tu Cuenta</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-xs">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-1.5 opacity-30" />
                  <p className="font-semibold text-gray-600 text-xs">No tienes notificaciones</p>
                  <p className="text-[11px] mt-0.5">Te avisaremos sobre tus pagos y estado de suscripción.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3.5 space-y-1 hover:bg-gray-50/80 transition ${
                      !n.is_read ? 'bg-purple-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-gray-900 text-xs">{n.title}</p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed">{n.message}</p>

                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:underline pt-1"
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
