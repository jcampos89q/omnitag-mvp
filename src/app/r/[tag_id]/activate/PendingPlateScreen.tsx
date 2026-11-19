'use client'

import { useState } from 'react'
import { Hourglass, AlertTriangle, ExternalLink, ArrowRight, Check, Copy, ShieldCheck, MapPin, Phone, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import LanguageSelector from '@/components/LanguageSelector'

interface PendingPlateScreenProps {
  tagId: string
  businessName: string
  businessAddress?: string | null
  businessPhone?: string | null
}

export default function PendingPlateScreen({
  tagId,
  businessName,
  businessAddress,
  businessPhone
}: PendingPlateScreenProps) {
  const { dict } = useTranslation()
  const a = dict.publicActivate
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const googleCreateUrl = `https://business.google.com/create?business_name=${encodeURIComponent(businessName)}`

  return (
    <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
      {/* Selector de idioma */}
      <div className="flex justify-end">
        <LanguageSelector variant="dark" />
      </div>

      {/* Icono y Encabezado */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 text-black rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 animate-pulse">
          <Hourglass className="w-8 h-8" />
        </div>
        
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{a.pendingBadge}</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white">
          {a.pendingTitle}
        </h1>
        <p className="text-xs text-gray-400">
          {a.plateId} <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{tagId}</span>
        </p>
      </div>

      {/* Alerta Destacada: NO COLOCAR EN MOSTRADOR */}
      <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{a.pendingAlertTitle}</span>
        </div>
        <p className="text-xs text-amber-100/90 leading-relaxed">
          {a.pendingAlertBody}
        </p>
      </div>

      {/* Resumen del Negocio y Asistente de Copiado */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {a.listingData}
        </p>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-gray-300 truncate">{businessName}</span>
            </div>
            <button
              onClick={() => copyToClipboard(businessName, 'name')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-amber-300 flex items-center gap-1 transition shrink-0"
            >
              {copiedField === 'name' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedField === 'name' ? a.copied : a.copy}
            </button>
          </div>

          {businessAddress && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-gray-300 truncate">{businessAddress}</span>
              </div>
              <button
                onClick={() => copyToClipboard(businessAddress, 'address')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-amber-300 flex items-center gap-1 transition shrink-0"
              >
                {copiedField === 'address' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'address' ? a.copied : a.copy}
              </button>
            </div>
          )}

          {businessPhone && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-gray-300 truncate">{businessPhone}</span>
              </div>
              <button
                onClick={() => copyToClipboard(businessPhone, 'phone')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-amber-300 flex items-center gap-1 transition shrink-0"
              >
                {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'phone' ? a.copied : a.copy}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Acciones principales */}
      <div className="space-y-3">
        <a
          href={googleCreateUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-center"
        >
          <span>{a.btnGoogleGuide}</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <Link
          href="/login?next=/dashboard/google-business"
          className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-white/15 text-center"
        >
          <span>{a.btnGoDashboard}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
