'use client'

import { useState } from 'react'
import { Zap, Sparkles, X, Check, ArrowRight, Building2 } from 'lucide-react'
import Link from 'next/link'

export interface ProFeatureModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
  featureDescription?: string
}

export default function ProFeatureModal({
  isOpen,
  onClose,
  featureName = 'Función Exclusiva PRO',
  featureDescription = 'Desbloquea todo el potencial de tu negocio con herramientas ilimitadas.'
}: ProFeatureModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 bg-linear-to-tr from-amber-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Zap className="w-6 h-6 fill-white text-white" />
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-purple-600" /> PLAN PRO ILIMITADO
          </div>

          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {featureName}
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed px-2">
            {featureDescription}
          </p>
        </div>

        {/* Beneficios Clave */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 text-xs space-y-2">
          <p className="font-bold text-gray-900 mb-2">Con OmniTag PRO obtienes acceso total a:</p>
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Escudo Anti-Quejas para Reseñas de Google</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Estudio QR HD (2000px) con Logos y Degradados</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Club de Fidelización & Sellos para clientes</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Exportación completa de CRM a Excel (CSV)</span>
          </div>
        </div>

        {/* Precios & Botón de Upgrade */}
        <div className="space-y-3 text-center pt-1">
          <div>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">L. 550</span>
              <span className="text-xs text-gray-500 font-medium">HNL / mes</span>
              <span className="text-xs text-gray-400 font-normal">($20 USD)</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Transferencia Bancaria BAC Credomatic o Pago Directo</p>
          </div>

          <div className="space-y-2">
            <Link
              href="/dashboard/billing#metodos-pago"
              onClick={onClose}
              className="w-full bg-black text-white font-extrabold py-3.5 px-4 rounded-xl hover:bg-gray-800 transition text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-red-500" />
              <span>Ver Datos de Transferencia BAC</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
