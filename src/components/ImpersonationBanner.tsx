'use client'

import { useState } from 'react'
import { Eye, ArrowLeft, Loader2, LifeBuoy, ShieldAlert } from 'lucide-react'
import { stopImpersonation } from '@/app/dashboard/admin/impersonateActions'

interface ImpersonationBannerProps {
  impersonatedUser: {
    id: string
    full_name?: string | null
    email?: string | null
    account_type?: string
  }
}

export default function ImpersonationBanner({ impersonatedUser }: ImpersonationBannerProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleExit = async () => {
    setIsExiting(true)
    try {
      await stopImpersonation()
    } catch (err) {
      console.error('Error al salir del modo soporte:', err)
      setIsExiting(false)
    }
  }

  return (
    <div className="bg-amber-400 text-black border-b border-amber-500 shadow-md sticky top-0 z-50 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <div className="w-7 h-7 rounded-lg bg-black text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-black text-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                Modo Soporte Técnico (Ghost Mode)
              </span>
              <span className="font-extrabold text-gray-900">
                Viendo como: {impersonatedUser.full_name || 'Cliente'}
              </span>
              <span className="text-[11px] text-amber-950 font-mono hidden md:inline">
                ({impersonatedUser.email})
              </span>
            </div>
            <p className="text-[11px] text-amber-950 mt-0.5 leading-tight">
              Cualquier cambio que realices en menús, vCards o placas se aplicará en la cuenta de este cliente.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExit}
          disabled={isExiting}
          className="bg-black hover:bg-neutral-800 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isExiting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <ArrowLeft className="w-3.5 h-3.5" />
          )}
          <span>Salir y Volver a Panel Admin</span>
        </button>
      </div>
    </div>
  )
}
